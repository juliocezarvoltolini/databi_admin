import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Buscar o primeiro dashboard disponível para o usuário
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        companyId: user.companyId,
        isActive: true,
        
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