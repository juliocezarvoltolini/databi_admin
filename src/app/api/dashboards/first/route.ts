import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    const companyId = request.headers.get("x-company-id");

    if (!userId || !companyId) {
      return NextResponse.json(
        { success: false, error: "Dados de autenticação necessários" },
        { status: 401 }
      );
    }

    // Buscar o primeiro dashboard disponível para o usuário
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        companyId,
        isActive: true,
        permissions: {
          some: {
            profile: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!dashboard) {
      return NextResponse.json(
        { success: false, error: "Nenhum dashboard disponível" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Erro ao buscar primeiro dashboard:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}