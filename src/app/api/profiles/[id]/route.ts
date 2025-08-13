// src/app/api/profiles/[id]/companies/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateProfileCompaniesSchema, validateData, type ApiResponse } from "@/lib/types";
import { hasPermission } from "@/lib/permissions";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

// PUT - Atualizar empresas associadas ao perfil
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }
  console.log("OPAAAAAAAiiiiAA");
    const { user } = authResult;

    // Verificar permissão para editar perfis
    const canEditProfiles = await hasPermission(user.userId, "EDIT_PROFILES");
    if (!canEditProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para editar perfis",
        } as ApiResponse,
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validar dados
    const validation = validateData(updateProfileCompaniesSchema, body);
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

    const { companyIds } = validation.data!;

    console.log('OPAAAAAAAAAA')

    // Verificar se o perfil existe
    const profile = await prisma.profile.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    // Verificar se todas as empresas existem
    const validCompanies = await prisma.company.findMany({
      where: {
        id: { in: companyIds },
        isActive: true,
      },
    });

    if (validCompanies.length !== companyIds.length) {
      return NextResponse.json(
        { success: false, error: "Uma ou mais empresas são inválidas" } as ApiResponse,
        { status: 400 }
      );
    }

    // Atualizar associações em uma transação
    await prisma.$transaction(async (tx) => {
      // Remover todas as associações existentes
      await tx.profileCompany.deleteMany({
        where: {
          profileId: resolvedParams.id,
        },
      });

      // Criar novas associações
      if (companyIds.length > 0) {
        await tx.profileCompany.createMany({
          data: companyIds.map((companyId: string) => ({
            profileId: resolvedParams.id,
            companyId,
          })),
        });
      }
    });

    // Buscar perfil atualizado com empresas
    const updatedProfile = await prisma.profile.findUnique({
      where: { id: resolvedParams.id },
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Empresas do perfil atualizadas com sucesso",
      data: {
        id: updatedProfile!.id,
        name: updatedProfile!.name,
        companies: updatedProfile!.companies.map((pc) => pc.company),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar empresas do perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// GET - Listar empresas associadas ao perfil
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Verificar permissão para visualizar perfis
    const canViewProfiles = await hasPermission(user.userId, "VIEW_PROFILES");
    if (!canViewProfiles) {
      return NextResponse.json(
        {
          success: false,
          error: "Sem permissão para visualizar perfis",
        } as ApiResponse,
        { status: 403 }
      );
    }

    // Buscar perfil com empresas
    const profile = await prisma.profile.findUnique({
      where: { id: resolvedParams.id },
      include: {
        companies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Perfil não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        companies: profile.companies.map((pc) => pc.company),
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar empresas do perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}