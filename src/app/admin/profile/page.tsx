// src/app/admin/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AdminCard from "@/components/admin/AdminCard";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .optional()
    .or(z.literal("")),
});

type ProfileData = z.infer<typeof profileSchema>;

interface UserData {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    slug: string;
  };
  profile?: {
    id: string;
    name: string;
    description: string;
  };
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sendResetLoading, setSendResetLoading] = useState(false);
  const [sendResetMessage, setSendResetMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  // Carregar dados do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        const result = await response.json();

        if (result.success) {
          setUserData(result.data);
          setValue("name", result.data.name);
          setValue("email", result.data.email);
          setValue("password", "");
        } else {
          setError("Erro ao carregar dados do perfil");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  // Salvar alterações
  const onSubmit = async (data: ProfileData) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Perfil atualizado com sucesso!");
        setUserData(result.data);
        setValue("password", ""); // Limpar senha após salvar
      } else {
        setError(result.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // Solicitar reset de senha
  const handlePasswordReset = async () => {
    if (!userData?.email) return;

    setSendResetLoading(true);
    setSendResetMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userData.email }),
      });

      const result = await response.json();

      if (result.success) {
        setSendResetMessage("Email de reset de senha enviado com sucesso!");
      } else {
        setSendResetMessage(result.error || "Erro ao solicitar reset de senha");
      }
    } catch (error) {
      console.error("Erro ao solicitar reset:", error);
      setSendResetMessage("Erro de conexão. Tente novamente.");
    } finally {
      setSendResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-secondary-600 dark:text-secondary-400">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-secondary-100">
          Meu Perfil
        </h1>
        <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
          Gerencie suas informações pessoais e configurações de conta.
        </p>
      </div>

      {/* Mensagens */}
      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Conta */}
        <div className="lg:col-span-1">
          <AdminCard title="Informações da Conta">
            <div className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Email verificado
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {userData?.emailVerified ? (
                    <span className="badge badge-success">
                      ✓ Verificado
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      ⚠ Não verificado
                    </span>
                  )}
                </dd>
              </div>

              {userData?.company && (
                <div>
                  <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    Empresa
                  </dt>
                  <dd className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                    {userData.company.name}
                  </dd>
                </div>
              )}

              {userData?.profile && (
                <div>
                  <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                    Perfil de Acesso
                  </dt>
                  <dd className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                    {userData.profile.name}
                  </dd>
                  {userData.profile.description && (
                    <dd className="mt-1 text-xs text-secondary-500 dark:text-secondary-400">
                      {userData.profile.description}
                    </dd>
                  )}
                </div>
              )}

              <div>
                <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
                  Membro desde
                </dt>
                <dd className="mt-1 text-sm text-secondary-900 dark:text-secondary-100">
                  {new Date(userData?.createdAt || "").toLocaleDateString("pt-BR")}
                </dd>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <form /*onSubmit={handleSubmit(onSubmit)}*/ className="space-y-6">
            <AdminCard title="Editar Informações">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div>
                  <label className="label">
                    Nome Completo
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className="input-field"
                    disabled={saving}
                  />
                  {errors.name && (
                    <p className="input-error">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="label">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="input-field"
                    disabled={saving}
                  />
                  {errors.email && (
                    <p className="input-error">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="card-footer flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={sendResetLoading}
                  className="btn-secondary"
                >
                  {sendResetLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </div>
                  ) : (
                    "Solicitar Reset de Senha por Email"
                  )}
                </button>

                {/* <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </div>
                  ) : (
                    "Salvar Alterações"
                  )}
                </button> */}
              </div>
            </AdminCard>
          </form>

          {/* Mensagem do Reset de Senha */}
          {sendResetMessage && (
            <div className={`alert ${
              sendResetMessage.includes("sucesso") 
                ? "alert-success"
                : "alert-error"
            }`}>
              {sendResetMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}