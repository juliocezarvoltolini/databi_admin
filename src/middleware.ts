// middleware.ts - Proteção das rotas
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Interface para o payload do JWT
interface JWTUserPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  companyId: string;
  profileId: string | null;
}

// Rotas que precisam de autenticação
const protectedRoutes = ["/dashboard", "/admin", "/users", "/profiles"];

// Rotas públicas
const publicRoutes = ["/login", "/register", "/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se é rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar token
  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userPayload = payload as JWTUserPayload;

    // Verificar se tem os campos necessários
    if (!userPayload.userId || !userPayload.companyId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Adicionar dados do usuário no header para uso nas rotas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", userPayload.userId);
    requestHeaders.set("x-company-id", userPayload.companyId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token inválido
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
