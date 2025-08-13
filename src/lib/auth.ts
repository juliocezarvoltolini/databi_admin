// src/lib/auth.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { UserSession, userSessionSchema } from "./types";


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Interface que combina JWTPayload com UserSession
interface JWTUserPayload extends JWTPayload, UserSession {}

// Gerar token JWT
export async function generateToken(user: UserSession): Promise<string> {
  // Validar dados do usuário antes de gerar token
  const validationResult = userSessionSchema.safeParse(user);
  if (!validationResult.success) {
    throw new Error("Dados de usuário inválidos para geração de token");
  }

  const payload: JWTUserPayload = {
    ...user,
    // Campos obrigatórios do JWTPayload serão adicionados automaticamente
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Token válido por 7 dias
    .sign(JWT_SECRET);
}

// Verificar token JWT
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Extrair apenas os campos do UserSession
    const userData = {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      companyId: payload.companyId,
      profileId: payload.profileId,
    };

    // Validar dados extraídos
    const validationResult = userSessionSchema.safeParse(userData);
    if (!validationResult.success) {
      console.error("Token contém dados inválidos:", validationResult.error);
      return null;
    }

    return validationResult.data;
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    return null;
  }
}

// Hash da senha
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Verificar senha
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Autenticar usuário
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: true,
      profile: true,
    },
  });

  if (!user || !user.isActive ||  (user.company && !user.company.isActive)) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    companyId: user.companyId,
    profileId: user.profileId,
  };
}

// Obter usuário atual (para usar nas rotas)
export async function getCurrentUser(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
      profile: {
        include: {
          permissions: {
            include: {
              permission: true,
              dashboard: true,
            },
          },
        },
      },
    },
  });
}
