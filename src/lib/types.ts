// src/lib/types.ts
import { z } from "zod";

// Schema para validar dados de usuário
export const userSessionSchema = z.object({
  userId: z.string().cuid(),
  email: z.string().email(),
  name: z.string().min(1),
  companyId: z.string().cuid().nullable(), // Opcional para administradores do sistema
  profileId: z.string().cuid().nullable(),
});

// Schema para validar login
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").nonoptional(),
  email: z.string().email("Email inválido").nonoptional(),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional(),
  profileId: z.string().cuid().nonoptional({error: "Perfil é obrigatório"}),
  isActive: z.boolean().optional(),
});

// Schema para criar usuário
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  profileId: z.string().cuid().nonoptional(),
  companyId: z.string().cuid().nullable().optional(), // Opcional para administradores do sistema
});

// Schema para criar empresa
export const createCompanySchema = z.object({
  name: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter pelo menos 2 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug deve conter apenas letras minúsculas, números e hífens"
    ),
});

// Schema para criar dashboard
export const createDashboardSchema = z.object({
  name: z.string().min(2, "Nome do dashboard deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  powerbiUrl: z.string().url("URL do Power BI inválida"),
  companyId: z.string().cuid().optional(), // Empresa associada (opcional para admins sistema)
});

// Schema para criar perfil
export const createProfileSchema = z.object({
  name: z.string().min(2, "Nome do perfil deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  companyId: z.string().cuid().optional(), // ID da empresa (obrigatório)
});

// Schema para atualizar perfil
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome do perfil deve ter pelo menos 2 caracteres").optional(),
  description: z.string().optional(),
  companyId: z.string().cuid().optional(), // ID da empresa
  isActive: z.boolean().optional(),
  dashboards: z.array(z.string()).optional(),
});

// Tipos derivados dos schemas
export type UserSession = z.infer<typeof userSessionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type CreateCompanyData = z.infer<typeof createCompanySchema>;
export type CreateDashboardData = z.infer<typeof createDashboardSchema>;
export type CreateProfileData = z.infer<typeof createProfileSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

// Tipos para resposta da API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipo para erros de validação
export interface ValidationError {
  field: string;
  message: string;
}

// Função helper para validar dados - CORRIGIDA
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Corrigido: usar result.error.issues em vez de result.error.errors
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return { success: false, errors };
  }
}

// Função alternativa usando try/catch para casos específicos
export function parseWithZod<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      const field = firstError.path.join(".");
      throw new Error(`Erro de validação em '${field}': ${firstError.message}`);
    }
    throw error;
  }
}
