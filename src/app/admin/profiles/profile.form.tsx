// src/app/admin/profiles/profile-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "Selecione pelo menos uma permissão"),
  companyIds: z.array(z.string()).min(1, "Selecione pelo menos uma empresa"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface Profile {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  permissions: Permission[];
  companies: Company[];
}

interface Props {
  profile?: Profile | null;
  allPermissions: Permission[];
  allCompanies: Company[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProfileForm({
  profile,
  allPermissions,
  allCompanies,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!profile;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name || "",
      description: profile?.description || "",
      permissions: profile?.permissions.map((p) => p.id) || [],
      companyIds: profile?.companies.map((c) => c.id) || [],
    },
  });

  const selectedPermissions = watch("permissions") || [];
  const selectedCompanies = watch("companyIds") || [];

  // Agrupar permissões por categoria
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    const currentPermissions = getValues("permissions");

    if (checked) {
      setValue("permissions", [...currentPermissions, permissionId]);
    } else {
      setValue(
        "permissions",
        currentPermissions.filter((id) => id !== permissionId)
      );
    }
  };

  const handleSelectAllCategory = (category: string, checked: boolean) => {
    const categoryPermissions = permissionsByCategory[category].map(
      (p) => p.id
    );
    const currentPermissions = getValues("permissions");

    if (checked) {
      // Adicionar todas as permissões da categoria
      const newPermissions = [
        ...new Set([...currentPermissions, ...categoryPermissions]),
      ];
      setValue("permissions", newPermissions);
    } else {
      // Remover todas as permissões da categoria
      const newPermissions = currentPermissions.filter(
        (id) => !categoryPermissions.includes(id)
      );
      setValue("permissions", newPermissions);
    }
  };

  const handleCompanyChange = (companyId: string, checked: boolean) => {
    const currentCompanies = getValues("companyIds");

    if (checked) {
      setValue("companyIds", [...currentCompanies, companyId]);
    } else {
      setValue(
        "companyIds",
        currentCompanies.filter((id) => id !== companyId)
      );
    }
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category].map(
      (p) => p.id
    );
    return categoryPermissions.every((id) => selectedPermissions.includes(id));
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/profiles/${profile.id}` : "/api/profiles";
      const method = isEditing ? "PUT" : "POST";

      console.log(JSON.stringify(data));

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao salvar perfil");
      }
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    DASHBOARD:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    USER: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v1M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    PROFILE:
      "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
    COMPANY:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    SYSTEM:
      "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  };

  const categoryNames: Record<string, string> = {
    DASHBOARD: "Dashboards",
    USER: "Usuários",
    PROFILE: "Perfis",
    COMPANY: "Empresas",
    SYSTEM: "Sistema",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="alert-error">{error}</div>}

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label-field">Nome do Perfil</label>
          <input
            {...register("name")}
            type="text"
            className="input-field"
            placeholder="Ex: Gerente, Analista, etc."
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="label-field">Descrição (opcional)</label>
          <input
            {...register("description")}
            type="text"
            className="input-field"
            placeholder="Descreva o propósito deste perfil"
            disabled={loading}
          />
        </div>
      </div>

      {/* Empresas */}
      <div>
        <label className="label-field">Empresas</label>
        {errors.companyIds && (
          <p className="mt-1 text-sm text-red-600">
            {errors.companyIds.message}
          </p>
        )}
        
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {allCompanies.map((company) => (
            <label
              key={company.id}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCompanies.includes(company.id)}
                onChange={(e) =>
                  handleCompanyChange(company.id, e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {company.name}
                </p>
                <p className="text-xs text-gray-500">
                  {company.slug}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Permissões */}
      <div>
        <label className="label-field">Permissões</label>
        {errors.permissions && (
          <p className="mt-1 text-sm text-red-600">
            {errors.permissions.message}
          </p>
        )}

        <div className="mt-2 space-y-6">
          {Object.entries(permissionsByCategory).map(
            ([category, permissions]) => (
              <div
                key={category}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={categoryIcons[category]}
                      />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">
                      {categoryNames[category] || category}
                    </h3>
                    <span className="text-xs text-gray-500">
                      ({permissions.length} permissões)
                    </span>
                  </div>

                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isCategoryFullySelected(category)}
                      onChange={(e) =>
                        handleSelectAllCategory(category, e.target.checked)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-gray-600">Selecionar todas</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissions.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start space-x-3 p-3 border border-gray-100 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={(e) =>
                          handlePermissionChange(
                            permission.id,
                            e.target.checked
                          )
                        }
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {permission.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {permission.name}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Resumo das permissões selecionadas */}
      {selectedPermissions.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Resumo - {selectedPermissions.length} permissão(ões) selecionada(s)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedPermissions.map((permissionId) => {
              const permission = allPermissions.find(
                (p) => p.id === permissionId
              );
              return permission ? (
                <span
                  key={permissionId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {permission.description}
                </span>
              ) : null;
            })}
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

        <button
          type="submit"
          disabled={loading || selectedPermissions.length === 0 || selectedCompanies.length === 0}
          className="btn-primary"
        >
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
            "Criar Perfil"
          )}
        </button>
      </div>
    </form>
  );
}
