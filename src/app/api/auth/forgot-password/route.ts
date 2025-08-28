import { NextRequest, NextResponse } from 'next/server';
import { generatePasswordResetTokenByEmail } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const result = await generatePasswordResetTokenByEmail(email);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    if (result.token) {
      await sendPasswordResetEmail(email, result.token);
    }

    return NextResponse.json({
      success: true,
      message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.'
    });

  } catch (error) {
    console.error('Erro na API forgot-password:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}