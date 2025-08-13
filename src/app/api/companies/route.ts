// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCompanySchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

// GET - Listar empresas
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para visualizar empresas
    const canViewCompanies = await hasPermission(user.userId, "VIEW_COMPANIES");
    if (!canViewCompanies) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar empresas",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar empresas com estatísticas
    const companies = await prisma.company.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            users: { where: { isActive: true } },
            dashboards: { where: { isActive: true } },
            profiles: { 
              where: { 
                profile: { 
                  isActive: true 
                } 
              } 
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Transformar dados para incluir contadores
    const companiesWithStats = companies.map((company) => ({
      id: company.id,
      name: company.name,
      slug: company.slug,
      logo: company.logo,
      isActive: company.isActive,
      createdAt: company.createdAt,
      userCount: company._count.users,
      dashboardCount: company._count.dashboards,
      profileCount: company._count.profiles,
    }));

    return NextResponse.json({
      success: true,
      data: companiesWithStats,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// POST - Criar nova empresa
export async function POST(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para criar empresas
    const canCreateCompanies = await hasPermission(user.userId, "CREATE_COMPANIES");
    if (!canCreateCompanies) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para criar empresas",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(createCompanySchema, body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados inválidos",
          details: validation.errors,
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { name, slug } = validation.data!;

    // Verificar se slug já existe
    const existingCompany = await prisma.company.findUnique({
      where: { slug },
    });

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: "Slug já está em uso" } as ApiResponse,
        { status: 400 }
      );
    }

    // Criar empresa
    const newCompany = await prisma.company.create({
      data: {
        name,
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Empresa criada com sucesso",
      data: newCompany,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}