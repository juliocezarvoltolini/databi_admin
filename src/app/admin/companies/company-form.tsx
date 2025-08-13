// src/app/admin/companies/company-form.tsx
"use client";

import { useState } from "react";

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  dashboardCount: number;
  profileCount: number;
}

interface Props {
  company?: CompanyData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: company?.name || "",
    slug: company?.slug || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
      .replace(/[\s_-]+/g, "-") // Substitui espaços e underscores por hífens
      .replace(/^-+|-+$/g, ""); // Remove hífens do início e fim
  };

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: company ? formData.slug : generateSlug(name), // Só gera slug automaticamente para novas empresas
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = company ? `/api/companies/${company.id}` : "/api/companies";
      const method = company ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        if (result.details) {
          // Erros de validação
          const fieldErrors: Record<string, string> = {};
          result.details.forEach((error: { field: string; message: string }) => {
            fieldErrors[error.field] = error.message;
          });
          setErrors(fieldErrors);
        } else {
          // Erro geral
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      setErrors({ general: "Erro ao salvar empresa" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome da empresa */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nome da Empresa
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Ex: Empresa ABC Ltda"
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Slug (URL amigável)
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.slug ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Ex: empresa-abc"
            pattern="[a-z0-9-]+"
            title="Apenas letras minúsculas, números e hífens"
            required
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Usado na URL da empresa. Apenas letras minúsculas, números e hífens.
          </p>
        </div>
      </div>

      {/* Informações adicionais para edição */}
      {company && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Informações da Empresa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Usuários:</span>
              <span className="ml-2 font-medium">{company.userCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Dashboards:</span>
              <span className="ml-2 font-medium">{company.dashboardCount}</span>
            </div>
            <div>
              <span className="text-gray-500">Perfis:</span>
              <span className="ml-2 font-medium">{company.profileCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Salvando..." : company ? "Atualizar" : "Criar"} Empresa
        </button>
      </div>
    </form>
  );
}