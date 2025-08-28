import { NextRequest, NextResponse } from 'next/server';
import { resendEmailVerification } from '@/lib/email-verification';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ID do usuário não fornecido' },
        { status: 400 }
      );
    }

    // Verificar se o usuário está autenticado (opcional, pode ser chamado por usuários não autenticados também)
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const session = await verifyToken(token);
        if (session && session.userId !== userId) {
          return NextResponse.json(
            { success: false, error: 'Não autorizado' },
            { status: 403 }
          );
        }
      }
    }

    const result = await resendEmailVerification(userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email de verificação enviado com sucesso!',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro ao reenviar verificação de email:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}