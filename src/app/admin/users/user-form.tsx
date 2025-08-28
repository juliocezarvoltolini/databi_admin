// src/app/admin/users/user-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CompanyClient,
  PermissionClient,
  ProfileClient,
  UserClient,
} from "../layout";

const userFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  confirmEmail: z.string().email("Email inválido"),
  profileId: z.string().optional(),
  companyId: z.string().optional(),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Os emails não coincidem",
  path: ["confirmEmail"],
});

// Schema específico para edição (senha opcional, email sem confirmação)
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

interface Props {
  userLogged: UserClient;
  user?: UserClient | null;
  profiles: ProfileClient[];
  companies: CompanyClient[];
  isSystemAdmin: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserForm({
  userLogged,
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
  const [allCompaniesAvailable, setAllCompaniesAvailable] = useState((companies && companies.length > 0) ? companies : (user.company ? [user.company] : []))
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [sendResetLoading, setSendResetLoading] = useState(false);
  const [sendResetMessage, setSendResetMessage] = useState("");

  console.log(allCompaniesAvailable, companies, user)

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
      ...(isEditing ? {} : { confirmEmail: user?.email || "" }),
      profileId: user?.profile?.id || "",
      companyId: user?.company?.id || userLogged.company?.id || "",
    },
  });

  const selectedProfileId = watch("profileId");
  const selectedProfile = profiles.find(
    (p: ProfileClient) => p.id === selectedProfileId
  );

  const onSubmit = async (data: UserFormData | EditUserFormData) => {
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
          }
        : {
            name: data.name,
            email: data.email,
            profileId: data.profileId || null,
            companyId: data.companyId || null,
            // Não incluir senha na criação - será definida na verificação de email
          };


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

  const handleResendVerification = async () => {
    if (!user?.id) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (result.success) {
        setResendMessage("Email de verificação enviado com sucesso!");
      } else {
        setResendMessage(result.error || "Erro ao enviar email.");
      }
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      setResendMessage("Erro de conexão. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.id) return;

    setSendResetLoading(true);
    setSendResetMessage("");

    try {
      const response = await fetch(`/api/admin/users/${user.id}/send-reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setSendResetMessage("Email de redefinição de senha enviado com sucesso!");
      } else {
        setSendResetMessage(result.error || "Erro ao enviar email.");
      }
    } catch (error) {
      console.error("Erro ao enviar email de reset:", error);
      setSendResetMessage("Erro de conexão. Tente novamente.");
    } finally {
      setSendResetLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="alert-error">{error}</div>}

      <div className="space-y-6">
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
        {isEditing ? (
          // Modo edição - email em campo único
          <div>
            <label className="label-field">Email</label>
            <input
              {...register("email")}
              type="email"
              className={`input-field ${user?.emailVerified ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              placeholder="Digite o email"
              disabled={loading || user?.emailVerified}
              readOnly={user?.emailVerified}
            />
            {user?.emailVerified ? (
              <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Email verificado - Não pode ser alterado
              </div>
            ) : (
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Email não verificado
                  </div>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading || loading}
                    className="btn-secondary btn-sm"
                  >
                    {resendLoading ? "Enviando..." : "Reenviar verificação"}
                  </button>
                </div>
                {resendMessage && (
                  <p className={`text-xs mt-2 ${resendMessage.includes('sucesso') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}

            {/* Botão de Reset de Senha (apenas para usuários verificados) */}
            {isEditing && user?.emailVerified && (
              <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Redefinição de Senha
                </h4>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enviar email para redefinir senha
                  </p>
                  <button
                    type="button"
                    onClick={handleSendPasswordReset}
                    disabled={sendResetLoading || loading}
                    className="btn-secondary btn-sm"
                  >
                    {sendResetLoading ? "Enviando..." : "Enviar Reset"}
                  </button>
                </div>
                {sendResetMessage && (
                  <p className={`text-xs mt-2 ${sendResetMessage.includes('sucesso') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {sendResetMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          // Modo criação - emails em grid com confirmação
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Confirmação de Email - apenas para novos usuários */}
            {!isEditing && (
              <div>
                <label className="label-field">Confirmar Email</label>
                <input
                  {...register("confirmEmail")}
                  type="email"
                  className="input-field"
                  placeholder="Confirme o email"
                  disabled={loading}
                />
                {(errors as any).confirmEmail && (
                  <p className="mt-1 text-sm text-red-600">{(errors as any).confirmEmail.message}</p>
                )}
              </div>
            )}
          </div>
        )}

        

        {/* Aviso sobre definição de senha para novos usuários */}
        {!isEditing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Definição de Senha
                </h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                  <p>
                    O usuário receberá um email de confirmação onde poderá definir sua própria senha.
                    A senha será criada durante o processo de verificação de email.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empresa e Perfil em grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa */}
          <div>
            <label className="label-field">Empresa</label>
            <select
              disabled={!isSystemAdmin || loading}
              {...register("companyId")}
              className="input-field"
            >
              <option key="" value="">Administrador do Sistema (sem empresa)</option>
              {allCompaniesAvailable.map((company) => (
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

          {/* Perfil */}
          <div>
            <label className="label-field">Perfil</label>
            <select
              {...register("profileId")}
              className="input-field"
              disabled={loading}
            >
              <option value="">Selecione um perfil</option>
              {profiles.map((profile: ProfileClient) => (
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
      </div>

      {/* Informações do perfil selecionado */}
      {selectedProfile && (
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
            Perfil: {selectedProfile.name}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
            {selectedProfile.description}
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Permissões incluídas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {selectedProfile.permissions?.map(
                (permission: PermissionClient) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
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
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {permission.description}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
