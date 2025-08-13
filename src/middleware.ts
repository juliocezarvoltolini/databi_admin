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
const protectedRoutes = ["/welcome", "/dashboard", "/admin", "/users", "/profiles"];

// Rotas de API que precisam de autenticação
const protectedApiRoutes = ["/api/companies", "/api/users", "/api/profiles", "/api/permissions"];

// Rotas públicas
const publicRoutes = ["/login", "/register", "/"];

// Rotas de API públicas
const publicApiRoutes = ["/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rotas de API públicas
  if (publicApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se é rota protegida (páginas ou APIs)
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  // Verificar token
  let token = request.cookies.get("auth-token")?.value;
  
  // Para APIs, também verificar header Authorization
  if (!token && isProtectedApiRoute) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { success: false, error: "Token de autenticação necessário" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userPayload = payload as JWTUserPayload;

    // Verificar se tem os campos necessários
    if (!userPayload.userId || !userPayload.companyId) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { success: false, error: "Token inválido" },
          { status: 401 }
        );
      }
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
    if (isProtectedApiRoute) {
      return NextResponse.json(
        { success: false, error: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  // Proteger todas as rotas exceto as explicitamente públicas
  matcher: [
    "/((?!api/auth|api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
