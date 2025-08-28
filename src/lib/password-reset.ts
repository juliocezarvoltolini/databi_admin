import { prisma } from './prisma';
import { randomBytes } from 'crypto';
import { hashPassword } from './auth';

export async function generatePasswordResetToken(userId: string): Promise<string> {
  // Gerar token único
  const token = randomBytes(32).toString('hex');
  
  // Expirar em 1 hora
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Invalidar tokens anteriores para este usuário
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Marcar como usado para invalidar
    },
  });

  // Criar novo token
  await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function generatePasswordResetTokenByEmail(email: string): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, isActive: true, emailVerified: true },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Usuário inativo' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Email não verificado. Verifique seu email primeiro.' };
    }

    const token = await generatePasswordResetToken(user.id);
    return { success: true, token };
  } catch (error) {
    console.error('Erro ao gerar token de reset:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function verifyPasswordResetToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        usedAt: null, // Ainda não foi usado
        expiresAt: {
          gt: new Date(), // Ainda não expirou
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return { success: false, error: 'Token inválido ou expirado' };
    }

    return { success: true, userId: resetToken.userId };
  } catch (error) {
    console.error('Erro ao verificar token de reset:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar token
    const tokenVerification = await verifyPasswordResetToken(token);
    
    if (!tokenVerification.success || !tokenVerification.userId) {
      return { success: false, error: tokenVerification.error };
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha do usuário e marcar token como usado
    await prisma.$transaction([
      // Atualizar senha
      prisma.user.update({
        where: { id: tokenVerification.userId },
        data: { password: hashedPassword },
      }),
      // Marcar token como usado
      prisma.passwordResetToken.updateMany({
        where: { token },
        data: { usedAt: new Date() },
      }),
      // Invalidar todos os outros tokens de reset para este usuário
      prisma.passwordResetToken.updateMany({
        where: {
          userId: tokenVerification.userId,
          token: { not: token },
          usedAt: null,
        },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function requestPasswordResetByAdmin(userId: string): Promise<{ success: boolean; error?: string; token?: string }> {
  try {
    // Verificar se usuário existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        isActive: true, 
        emailVerified: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Usuário inativo' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Email do usuário não está verificado' };
    }

    // Verificar se já existe um token válido recente (últimos 5 minutos)
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId,
        usedAt: null,
        createdAt: {
          gt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        },
      },
    });

    if (recentToken) {
      return { 
        success: false, 
        error: 'Um email de redefinição já foi enviado recentemente. Aguarde alguns minutos.' 
      };
    }

    const token = await generatePasswordResetToken(userId);
    return { success: true, token };
  } catch (error) {
    console.error('Erro ao solicitar reset por admin:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}