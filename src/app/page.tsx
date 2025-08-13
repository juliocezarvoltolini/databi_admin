// src/app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Link from "next/link";

export default async function HomePage() {
  // Verificar se usuário está logado
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  // Se tem token, verificar se é válido
  if (token) {
    const session = await verifyToken(token);
    if (session) {
      // Usuário logado e token válido = redirecionar para dashboard
      redirect("/dashboard");
    }
  }

  // Se chegou aqui, usuário NÃO está logado = mostrar página de login
  redirect("/login");

  // Este return nunca será executado devido ao redirect acima,
  // mas é necessário para evitar erros de TypeScript
  return null;
}

// ===== VERSÃO ALTERNATIVA: Com página de apresentação =====
// Se você quiser manter uma página de apresentação para usuários não logados,
// descomente o código abaixo e comente o redirect("/login") acima:

/*
export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    const session = await verifyToken(token);
    if (session) {
      redirect("/dashboard");
    }
  }

  // Mostrar página de apresentação para usuários não logados
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4 animate-fade-in">
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Dashboard Manager
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema de gerenciamento de dashboards Power BI com controle de acesso
            por empresa e perfis personalizáveis.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center mb-12">
          <Link
            href="/login"
            className="btn-primary inline-flex items-center justify-center py-4 px-8 text-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Acessar Sistema
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Controle de Acesso</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Gerencie quem pode ver cada dashboard com perfis personalizáveis por empresa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6m-6 4h6m-2 4h2M7 7h2v2H7V7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Power BI Integrado</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Visualize seus dashboards do Power BI diretamente na plataforma de forma segura.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-blue-600 mb-4">
              <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Multi-Empresa</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Cada empresa tem seus próprios usuários, perfis e dashboards isolados.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Desenvolvido com ❤️ para gerenciar seus dashboards
          </p>
        </div>
      </div>
    </div>
  );
}
*/
