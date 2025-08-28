// src/app/(auth)/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData, type ApiResponse } from "@/lib/types";
import Link from "next/link";
import { useThemeSafe } from "@/contexts/ThemeContext";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotVerified, setEmailNotVerified] = useState<{
    userId: string;
    email: string;
  } | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const themeContext = useThemeSafe();

    let currentTheme = 'dark'; // Tema padrão para SSR
    
    useEffect(() => {
      setMounted(true);
    }, []);
  
    if (mounted) {
      if (themeContext) {
        currentTheme = themeContext.theme;
      } else if (typeof window !== 'undefined') {
        currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      }
    }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError("");
    setEmailNotVerified(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        if ("code" in result && result.code === "EMAIL_NOT_VERIFIED") {
          setEmailNotVerified({
            userId: (result as any).userId,
            email: data.email,
          });
        } else {
          setError(result.error || "Erro ao fazer login");
        }
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!emailNotVerified) return;

    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: emailNotVerified.userId }),
      });

      const result = await response.json();

      if (result.success) {
        setResendMessage(
          "Email de verificação enviado com sucesso! Verifique sua caixa de entrada."
        );
      } else {
        setResendMessage(result.error || "Erro ao enviar email.");
      }
    } catch (err) {
      console.error("Erro ao reenviar email:", err);
      setResendMessage("Erro de conexão. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) return;

    setForgotPasswordLoading(true);
    setForgotPasswordMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const result = await response.json();

      if (result.success) {
        setForgotPasswordMessage(
          "Se o email existir em nossa base, você receberá instruções para redefinir sua senha."
        );
        setForgotPasswordEmail("");
        setTimeout(() => setShowForgotPassword(false), 3000);
      } else {
        setForgotPasswordMessage(result.error || "Erro ao enviar email.");
      }
    } catch (err) {
      console.error("Erro ao solicitar reset de senha:", err);
      setForgotPasswordMessage("Erro de conexão. Tente novamente.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40 flex items-center justify-center">
              <img
                src={currentTheme === 'dark' ? "/Logo DataBi - Branco.svg" : "/Logo DataBi - Colorido fundo claro.svg"}
                alt="DataBi Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="alert-error">{error}</div>}

          {emailNotVerified && (
            <div className="alert-warning">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="font-medium">Email não verificado</h4>
                  <p className="text-sm mt-1">
                    Você precisa verificar seu email antes de fazer login.
                    Verifique sua caixa de entrada para o email enviado para{" "}
                    <strong>{emailNotVerified.email}</strong>.
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="btn-secondary btn-sm"
                    >
                      {resendLoading
                        ? "Enviando..."
                        : "Reenviar email de verificação"}
                    </button>
                  </div>
                  {resendMessage && (
                    <p
                      className={`text-sm mt-2 ${
                        resendMessage.includes("sucesso")
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {resendMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
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
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label-field">
                Senha
              </label>
              <input
                {...register("password")}
                type="password"
                className="input-field"
                placeholder="Sua senha"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <div>
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                        5.291A7.962 7.962 0 014 12H0c0 
                        3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
