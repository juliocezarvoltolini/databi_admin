import { NextRequest, NextResponse } from 'next/server';
import { resetPassword, verifyPasswordResetToken } from '@/lib/password-reset';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    const result = await verifyPasswordResetToken(token);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const result = await resetPassword(token, password);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}