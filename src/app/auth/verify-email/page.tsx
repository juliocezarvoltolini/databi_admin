"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { setPasswordSchema } from '@/lib/types';
import Link from 'next/link';

type SetPasswordData = {
  password: string;
  confirmPassword: string;
};

function VerifyEmailForm() {
  const [status, setStatus] = useState<'loading' | 'needsPassword' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordData>({
    resolver: zodResolver(setPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificação não encontrado.');
      return;
    }

    // Inicialmente, apenas validar o token (sem definir senha ainda)
    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const result = await response.json();

        if (result.success) {
          // Token válido, mostrar formulário de senha
          setStatus('needsPassword');
          setMessage('Seu email foi confirmado! Agora defina sua senha para completar o cadastro.');
        } else {
          setStatus('error');
          setMessage(result.error);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Erro ao validar token. Tente novamente.');
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: SetPasswordData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Erro ao definir senha');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erro ao definir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              {status === 'loading' && (
                <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {(status === 'needsPassword' || status === 'success') && (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {status === 'error' && (
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {status === 'loading' && 'Verificando Email...'}
              {status === 'needsPassword' && 'Defina sua Senha'}
              {status === 'success' && 'Cadastro Concluído!'}
              {status === 'error' && 'Erro na Verificação'}
            </h1>
          </div>

          {/* Content */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>

            {status === 'needsPassword' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {/* Senha */}
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="Digite sua senha"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirmar Senha */}
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Senha
                    </label>
                    <input
                      {...register('confirmPassword')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirme sua senha"
                      disabled={loading}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Definindo senha...
                    </div>
                  ) : (
                    'Definir Senha e Completar Cadastro'
                  )}
                </button>
              </form>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Você será redirecionado para a página de login em alguns segundos...
                </p>
                <div className="flex justify-center">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                  >
                    Ir para Login
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors"
                  >
                    Voltar ao Login
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-pulse text-sm text-gray-500 dark:text-gray-400">
                  Aguarde...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Data BI. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-700 dark:text-gray-300">Carregando...</span>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}