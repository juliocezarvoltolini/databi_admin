import { prisma } from './prisma';
import { randomBytes } from 'crypto';

export async function generateEmailVerificationToken(userId: string): Promise<string> {
  // Gerar token único
  const token = randomBytes(32).toString('hex');
  
  // Expirar em 24 horas
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Invalidar tokens anteriores para este usuário
  await prisma.emailVerificationToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(), // Marcar como usado para invalidar
    },
  });

  // Criar novo token
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function verifyEmailToken(token: string, markAsUsed: boolean = true): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Buscar token válido
    const emailToken = await prisma.emailVerificationToken.findFirst({
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

    if (!emailToken) {
      return { success: false, error: 'Token inválido ou expirado' };
    }

    // Só marcar como usado e verificar email se solicitado
    if (markAsUsed) {
      // Marcar token como usado
      await prisma.emailVerificationToken.update({
        where: {
          id: emailToken.id,
        },
        data: {
          usedAt: new Date(),
        },
      });

      // Marcar email do usuário como verificado
      await prisma.user.update({
        where: {
          id: emailToken.userId,
        },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    return { success: true, userId: emailToken.userId };
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    return user?.emailVerified || false;
  } catch (error) {
    console.error('Erro ao verificar status do email:', error);
    return false;
  }
}

export async function resendEmailVerification(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar se usuário existe e se email já não foi verificado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        email: true,
        name: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email já verificado' };
    }

    // Verificar se já existe um token válido recente (últimos 5 minutos)
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId,
        usedAt: null,
        createdAt: {
          gt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        },
      },
    });

    if (recentToken) {
      return { success: false, error: 'Um email de verificação já foi enviado recentemente. Aguarde alguns minutos.' };
    }

    // Gerar novo token e enviar email
    const token = await generateEmailVerificationToken(userId);
    
    const { sendEmailVerification } = await import('./email');
    const emailResult = await sendEmailVerification(user.email, user.name, token);

    if (!emailResult.success) {
      return { success: false, error: 'Erro ao enviar email de verificação' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao reenviar verificação de email:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}