// src/app/admin/dashboards/dashboard-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const dashboardFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  powerbiUrl: z.string().min(1, "URL do Power BI é obrigatória").url("URL do Power BI inválida"),
  companyId: z.string().optional(),
});

type DashboardFormData = z.infer<typeof dashboardFormSchema>;

interface Company {
  id: string;
  name: string;
  slug: string;
}

interface Dashboard {
  id: string;
  name: string;
  description: string | null;
  powerbiUrl: string;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Props {
  dashboard?: Dashboard | null;
  allCompanies: Company[];
  currentUserCompanyId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DashboardForm({
  dashboard,
  allCompanies,
  currentUserCompanyId,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!dashboard;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DashboardFormData>({
    resolver: zodResolver(dashboardFormSchema),
    defaultValues: {
      name: dashboard?.name || "",
      description: dashboard?.description || "",
      powerbiUrl: dashboard?.powerbiUrl || "",
      companyId: dashboard?.company?.id || currentUserCompanyId || "",
    },
  });

  const powerbiUrl = watch("powerbiUrl");

  const onSubmit = async (data: DashboardFormData) => {
    console.log("🚀 onSubmit chamado!");
    console.log("Dados do formulário:", data);
    setLoading(true);
    setError("");

    try {
      const url = isEditing ? `/api/dashboards/${dashboard.id}` : "/api/dashboards";

      if (data.companyId === "") {
        delete data.companyId; // Remover companyId se estiver vazio
      }

      const method = isEditing ? "PUT" : "POST";
      console.log("Enviando dados para a API:", data);
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log("Resultado da API:", result);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Erro ao salvar dashboard");
      }
    } catch (error) {
      console.error("Erro ao salvar dashboard:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Validar se a URL é do Power BI
  const isValidPowerBIUrl = (url: string) => {
    if (!url) return false;
    return url.includes("app.powerbi.com") || url.includes("powerbi.microsoft.com");
  };

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("✅ Validação passou, chamando onSubmit:", data);
      onSubmit(data);
    },
    (errors) => {
      console.log("❌ Erros de validação:", errors);
    }
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {error && <div className="alert-error">{error}</div>}

      {/* Informações básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label-field">Nome do Dashboard</label>
          <input
            {...register("name")}
            type="text"
            className="input-field"
            placeholder="Ex: Vendas Q4, Relatório Financeiro, etc."
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
            placeholder="Descreva o propósito deste dashboard"
            disabled={loading}
          />
        </div>
      </div>

      {/* Seleção de Empresa */}
      {allCompanies.length > 1 && (
        <div>
          <label className="label-field">Empresa</label>
          <select
            {...register("companyId")}
            className="input-field"
            disabled={loading}
          >
            <option value="">Selecione uma empresa</option>
            {allCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {errors.companyId && (
            <p className="mt-1 text-sm text-red-600">{errors.companyId.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Se não selecionada, o dashboard será associado à sua empresa atual
          </p>
        </div>
      )}

      {/* URL do Power BI */}
      <div>
        <label className="label-field">URL do Power BI</label>
        <div className="space-y-2">
          <input
            {...register("powerbiUrl")}
            type="url"
            className="input-field"
            placeholder="https://app.powerbi.com/view?r=..."
            disabled={loading}
          />
          {errors.powerbiUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.powerbiUrl.message}</p>
          )}
          
          {/* Validação visual da URL */}
          {powerbiUrl && (
            <div className="flex items-center space-x-2">
              {isValidPowerBIUrl(powerbiUrl) ? (
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">URL do Power BI válida</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Verifique se a URL é do Power BI</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Dicas de uso */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Como obter a URL do Power BI:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. Abra seu dashboard no Power BI</li>
            <li>2. Clique em "Arquivo" → "Compartilhar" → "Inserir relatório"</li>
            <li>3. Copie a URL pública gerada</li>
            <li>4. Cole aqui a URL que começará com "https://app.powerbi.com/view?r="</li>
          </ul>
        </div>
      </div>

      {/* Preview da URL (se válida) */}
      {powerbiUrl && isValidPowerBIUrl(powerbiUrl) && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Preview do Dashboard:</h4>
          <div className="bg-gray-100 rounded-md p-3">
            <p className="text-sm text-gray-600 mb-2">
              O dashboard será exibido em um iframe apontando para:
            </p>
            <p className="text-sm font-mono text-gray-800 bg-white p-2 rounded border break-all">
              {powerbiUrl}
            </p>
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
          disabled={loading}
          className="btn-primary"
          onClick={() => console.log("🔴 Botão clicado!")}
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
            "Criar Dashboard"
          )}
        </button>
      </div>
    </form>
  );
}