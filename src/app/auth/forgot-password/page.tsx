"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message || "Se o email existir em nossa base, você receberá instruções para redefinir sua senha.");
        reset();
      } else {
        setIsSuccess(false);
        setMessage(result.error || "Erro ao enviar email.");
      }
    } catch (err) {
      console.error("Erro ao solicitar reset de senha:", err);
      setIsSuccess(false);
      setMessage("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <Link href="/login" className="flex justify-center mb-6">
            <div className="w-40 h-40 flex items-center justify-center">
              <img
                src="/Logo DataBi - Branco.svg"
                alt="DataBi Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Digite seu email abaixo e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {message && (
            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label-field">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
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
                  Enviando...
                </div>
              ) : (
                "Enviar instruções"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
              >
                Voltar para o login
              </Link>
            </div>
          </div>
        </form>

        {isSuccess && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p><strong>Próximos passos:</strong></p>
                <ul className="mt-1 list-disc list-inside">
                  <li>Verifique sua caixa de entrada</li>
                  <li>Procure também na pasta de spam/lixo eletrônico</li>
                  <li>O link expira em 1 hora</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}