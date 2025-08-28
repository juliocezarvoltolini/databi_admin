import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordResetByAdmin } from '@/lib/password-reset';
import { sendPasswordResetEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const userId = paramsResolved.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    const result = await requestPasswordResetByAdmin(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    if (result.token) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (user) {
        await sendPasswordResetEmail(user.email, result.token);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email de redefinição de senha enviado com sucesso.",
    });
  } catch (error) {
    console.error("Erro na API admin send-reset:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}