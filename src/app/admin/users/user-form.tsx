// src/app/admin/users/user-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ProfileWithPermissions {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  permissions: Permission[];
}

const userFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  profileId: z.string().optional(),
  companyId: z.string().optional(),
});

// Schema específico para edição (senha opcional)
const editUserFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  profileId: z.string().optional(),
  companyId: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;
type EditUserFormData = z.infer<typeof editUserFormSchema>;

interface UserData {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  } | null;
  profile: {
    id: string;
    name: string;
    description: string;
  } | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface Props {
  user?: UserData | null;
  profiles: ProfileWithPermissions[];
  companies: Company[];
  isSystemAdmin: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({
  user,
  profiles,
  companies,
  isSystemAdmin,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserFormData | EditUserFormData>({
    resolver: zodResolver(isEditing ? editUserFormSchema : userFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      profileId: user?.profile?.id || "",
      companyId: user?.company?.id || "",
    },
  });

  const selectedProfileId = watch("profileId");
  const selectedProfile = profiles.find((p: ProfileWithPermissions) => p.id === selectedProfileId);

  const onSubmit = async (data: UserFormData | EditUserFormData) => {
    console.log("Passou aqui");
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/users/${user.id}` : "/api/users";
      const method = isEditing ? "PUT" : "POST";

      // Para edição, só incluir senha se foi fornecida
      const payload = isEditing
        ? {
            name: data.name,
            email: data.email,
            profileId: data.profileId || null,
            companyId: data.companyId || null,
            ...(data.password && { password: data.password }),
          }
        : {
            name: data.name,
            email: data.email,
            profileId: data.profileId || null,
            companyId: data.companyId || null,
            ...(data.password && { password: data.password }),
          };

          console.log(`usuario ${JSON.stringify(payload)}`);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao salvar usuário");
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="alert-error">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div>
          <label className="label-field">Nome Completo</label>
          <input
            {...register("name")}
            type="text"
            className="input-field"
            placeholder="Digite o nome completo"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="label-field">Email</label>
          <input
            {...register("email")}
            type="email"
            className="input-field"
            placeholder="Digite o email"
            disabled={loading}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div>
          <label className="label-field">
            {isEditing ? "Nova Senha (opcional)" : "Senha"}
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className="input-field pr-10"
              placeholder={
                isEditing
                  ? "Deixe em branco para manter a atual"
                  : "Digite a senha"
              }
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Empresa */}
        {isSystemAdmin && (
          <div>
            <label className="label-field">Empresa</label>
            <select
              {...register("companyId", {})}
              className="input-field"
              disabled={loading}
            >
              <option value="">Administrador do Sistema (sem empresa)</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.companyId.message}
              </p>
            )}
          </div>
        )}

        {/* Perfil */}
        <div>
          <label className="label-field">Perfil</label>
          <select
            {...register("profileId")}
            className="input-field"
            disabled={loading}
          >
            <option value="">Selecione um perfil</option>
            {profiles.map((profile: ProfileWithPermissions) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          {errors.profileId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.profileId.message}
            </p>
          )}
        </div>
      </div>

      {/* Informações do perfil selecionado */}
      {selectedProfile && (
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Perfil: {selectedProfile.name}
          </h4>
          <p className="text-sm text-blue-700 mb-3">
            {selectedProfile.description}
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900">
              Permissões incluídas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedProfile.permissions?.map((permission: Permission) => (
                <div
                  key={permission.id}
                  className="flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-blue-700">
                    {permission.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-secondary"
        >
          Cancelar
        </button>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? "Salvando..." : "Criando..."}
            </div>
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Criar Usuário"
          )}
        </button>
      </div>
    </form>
  );
}
