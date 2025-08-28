import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/email-verification';
import { setPasswordSchema, validateData } from '@/lib/types';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // Apenas validar o token sem marcar como usado
    const result = await verifyEmailToken(token, false);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Token válido! Você pode definir sua senha.',
        userId: result.userId,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro na verificação de email:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // Se senha foi fornecida, validar
    if (password) {
      const passwordValidation = validateData(setPasswordSchema, { password, confirmPassword });
      if (!passwordValidation.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Dados de senha inválidos',
            details: passwordValidation.errors,
          },
          { status: 400 }
        );
      }
    }

    // Se senha foi fornecida, validar token e processar
    if (password) {
      const result = await verifyEmailToken(token, true); // Marcar como usado

      if (result.success && result.userId) {
        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
          where: { id: result.userId },
          data: { 
            password: hashedPassword,
            // Email já foi marcado como verificado pela função verifyEmailToken
          },
        });
        
        return NextResponse.json({
          success: true,
          message: 'Email verificado e senha definida com sucesso! Você pode fazer login agora.',
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
    } else {
      // Se não tem senha, apenas validar o token
      const result = await verifyEmailToken(token, true);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Email verificado com sucesso!',
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error('Erro na verificação de email:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}