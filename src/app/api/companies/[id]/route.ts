// src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createCompanySchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

// GET - Buscar empresa específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;
    const resolvedParams = await params;

    // Verificar permissão
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

    const company = await prisma.company.findUnique({
      where: {
        id: resolvedParams.id,
        isActive: true,
      },
      include: {
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
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Empresa não encontrada" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...company,
        userCount: company._count.users,
        dashboardCount: company._count.dashboards,
        profileCount: company._count.profiles,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Atualizar empresa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const resolvedParams = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" } as ApiResponse,
        { status: 401 }
      );
    }

    // Verificar permissão
    const canEditCompanies = await hasPermission(userId, "EDIT_COMPANIES");
    if (!canEditCompanies) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para editar empresas",
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

    // Verificar se empresa existe
    const existingCompany = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { success: false, error: "Empresa não encontrada" } as ApiResponse,
        { status: 404 }
      );
    }

    // Verificar se slug não conflita com outra empresa
    if (slug !== existingCompany.slug) {
      const conflictingCompany = await prisma.company.findUnique({
        where: { slug },
      });

      if (conflictingCompany) {
        return NextResponse.json(
          { success: false, error: "Slug já está em uso" } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Atualizar empresa
    const updatedCompany = await prisma.company.update({
      where: { id: resolvedParams.id },
      data: { name, slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Empresa atualizada com sucesso",
      data: updatedCompany,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// DELETE - Desativar empresa
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const userId = headersList.get("x-user-id");
    const resolvedParams = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" } as ApiResponse,
        { status: 401 }
      );
    }

    // Verificar permissão
    const canDeleteCompanies = await hasPermission(userId, "DELETE_COMPANIES");
    if (!canDeleteCompanies) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para excluir empresas",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Verificar se empresa existe
    const company = await prisma.company.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            users: { where: { isActive: true } },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Empresa não encontrada" } as ApiResponse,
        { status: 404 }
      );
    }

    // Verificar se há usuários ativos na empresa
    if (company._count.users > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Não é possível excluir empresa com usuários ativos",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Desativar empresa
    await prisma.company.update({
      where: { id: resolvedParams.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Empresa desativada com sucesso",
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao desativar empresa:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}