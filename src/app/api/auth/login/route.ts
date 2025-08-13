// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { loginSchema, validateData, type ApiResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const validation = validateData(loginSchema, body);
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

    const { email, password } = validation.data!;

    // Autenticar usuário
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Email ou senha inválidos",
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Gerar token
    const token = await generateToken(user);

    // Configurar cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return NextResponse.json({
      success: true,
      message: "Login realizado com sucesso",
      data: {
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
        },
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
