import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Configuração do transporter
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    // Adicionar configurações para lidar com certificados
    ...(process.env.SMTP_HOST === 'smtp.databi-ge.com.br' && {
      tls: {
        // Usar o hostname correto do certificado
        servername: 'email-ssl.com.br',
        // Ou desabilitar verificação de certificado para desenvolvimento
        rejectUnauthorized: false
      }
    })
  };

  return nodemailer.createTransport(config);
};

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.SMTP_FROM_NAME || 'Data BI'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function sendEmailVerification(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirme seu email - Data BI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Data BI</h1>
          <p>Bem-vindo ao sistema!</p>
        </div>
        <div class="content">
          <h2>Olá, ${name}!</h2>
          <p>Obrigado por se cadastrar no Data BI. Para completar seu cadastro, clique no botão abaixo para confirmar seu endereço de email:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Confirmar Email</a>
          </div>
          
          <p>Ou copie e cole o link abaixo em seu navegador:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p><strong>Este link expira em 24 horas.</strong></p>
          
          <p>Se você não criou uma conta no Data BI, pode ignorar este email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Data BI. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Olá ${name}!
    
    Bem-vindo ao Data BI!
    
    Para completar seu cadastro, acesse o link abaixo para confirmar seu email:
    ${verificationUrl}
    
    Este link expira em 24 horas.
    
    Se você não criou uma conta no Data BI, pode ignorar este email.
    
    Data BI - Gestão Inteligente de Dados
  `;

  return sendEmail({
    to: email,
    subject: 'Confirme seu email - Data BI',
    html,
    text,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinir senha - Data BI</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Data BI</h1>
          <p>Redefinição de Senha</p>
        </div>
        <div class="content">
          <h2>Redefinir sua senha</h2>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no Data BI.</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </div>
          
          <p>Ou copie e cole o link abaixo em seu navegador:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <div class="warning">
            <p><strong>⚠️ Importante:</strong></p>
            <ul>
              <li>Este link expira em <strong>1 hora</strong></li>
              <li>Se você não solicitou esta redefinição, ignore este email</li>
              <li>Por segurança, este link só pode ser usado uma vez</li>
            </ul>
          </div>
          
          <p>Se você não solicitou a redefinição de senha, sua conta permanece segura e você pode ignorar este email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Data BI. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Data BI - Redefinição de Senha
    
    Recebemos uma solicitação para redefinir a senha da sua conta.
    
    Para redefinir sua senha, acesse o link abaixo:
    ${resetUrl}
    
    IMPORTANTE:
    - Este link expira em 1 hora
    - Se você não solicitou esta redefinição, ignore este email
    - Por segurança, este link só pode ser usado uma vez
    
    Se você não solicitou a redefinição de senha, sua conta permanece segura.
    
    Data BI - Gestão Inteligente de Dados
  `;

  return sendEmail({
    to: email,
    subject: 'Redefinir senha - Data BI',
    html,
    text,
  });
}