// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import { validateData, type ApiResponse } from "@/lib/types";
import {
  authenticateApiRequest,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// Schema para atualização do perfil próprio
const updateOwnProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
});

// GET - Buscar dados do próprio perfil
export async function GET(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    // Buscar dados completos do usuário
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        emailVerifiedAt: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        profile: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userData,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}

// PUT - Atualizar próprio perfil
export async function PUT(request: NextRequest) {
  try {
    // Autenticar usuário
    const authResult = await authenticateApiRequest(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.status);
    }

    const { user } = authResult;

    const body = await request.json();

    // Validar dados
    const validation = validateData(updateOwnProfileSchema, body);
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

    const { name, email, password } = validation.data!;

    // Verificar se email já existe em outro usuário
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: user.userId },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Este email já está sendo usado por outro usuário" } as ApiResponse,
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
    };

    // Se senha foi fornecida, incluir no update
    if (password && password.length > 0) {
      updateData.password = await hashPassword(password);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        profile: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      data: updatedUser,
    } as ApiResponse);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" } as ApiResponse,
      { status: 500 }
    );
  }
}