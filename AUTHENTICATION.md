# Autenticação - Dashboard Manager

## Visão Geral

O sistema de autenticação foi organizado e padronizado usando JWT (JSON Web Tokens) com as seguintes características:

- **JWT com expiração de 7 dias**
- **Cookies httpOnly para navegadores**
- **Headers Authorization para APIs/mobile**
- **Middleware unificado para páginas e APIs**
- **Permissões baseadas em perfis por empresa**

## Arquitetura

### 1. Núcleo de Autenticação (`src/lib/auth.ts`)

**Principais funções:**
- `generateToken()` - Gera JWT com dados do usuário
- `verifyToken()` - Valida e decodifica JWT
- `authenticateUser()` - Login com email/senha
- `getCurrentUser()` - Busca dados completos do usuário
- `hashPassword()` / `verifyPassword()` - Segurança de senhas

### 2. Middleware de API (`src/lib/api-auth.ts`)

**Funcionalidades:**
- Extração de token de cookie ou header Authorization
- Suporte para desenvolvimento com header `x-user-id`
- Validação de token e retorno de dados do usuário
- Funções helper para respostas de erro padronizadas

**Uso em rotas API:**
```typescript
import { authenticateApiRequest, createAuthErrorResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const authResult = await authenticateApiRequest(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult.error!, authResult.status);
  }
  
  const { user } = authResult;
  // usar user.userId, user.companyId, etc.
}
```

### 3. Middleware Global (`src/middleware.ts`)

**Protege automaticamente:**
- Páginas: `/dashboard`, `/admin`, `/users`, `/profiles`
- APIs: `/api/companies`, `/api/users`, `/api/profiles`, `/api/permissions`

**Permite sem autenticação:**
- Páginas públicas: `/`, `/login`, `/register`
- APIs públicas: `/api/auth/*`

**Funcionalidades:**
- Redireciona para `/login` se não autenticado (páginas)
- Retorna JSON de erro se não autenticado (APIs)
- Adiciona headers `x-user-id` e `x-company-id` para compatibilidade

## Fluxo de Autenticação

### 1. Login
```
POST /api/auth/login
Body: { email, password }
→ Valida credenciais
→ Gera JWT
→ Define cookie httpOnly
→ Retorna dados básicos do usuário
```

### 2. Acesso a Páginas Protegidas
```
GET /dashboard
→ Middleware verifica cookie
→ Valida JWT
→ Adiciona headers com dados do usuário
→ Continua para página
```

### 3. Acesso a APIs Protegidas
```
GET /api/companies
→ Middleware verifica cookie/header
→ Valida JWT
→ Se inválido: retorna JSON erro 401
→ Se válido: adiciona headers e continua
```

### 4. Logout
```
POST /api/auth/logout
→ Remove cookie
→ Confirma logout
```

## Métodos de Autenticação

### 1. Navegador (Padrão)
- Cookie httpOnly `auth-token`
- Configuração segura (secure em produção, sameSite strict)
- Expiração automática em 7 dias

### 2. APIs/Mobile
- Header `Authorization: Bearer <token>`
- Mesmo JWT do cookie
- Flexibilidade para aplicações externas

### 3. Desenvolvimento
- Header `x-user-id` para testes
- Busca usuário diretamente no banco
- Apenas em `NODE_ENV=development`

## Permissões

### Sistema de Verificação
```typescript
import { hasPermission } from "@/lib/permissions";

const canView = await hasPermission(userId, "VIEW_COMPANIES");
const canEdit = await hasPermission(userId, "EDIT_DASHBOARD", dashboardId);
```

### Permissões Disponíveis
- **Dashboard**: `VIEW_DASHBOARD`, `MANAGE_DASHBOARDS`
- **Usuários**: `VIEW_USERS`, `CREATE_USERS`, `EDIT_USERS`, `DELETE_USERS`
- **Perfis**: `VIEW_PROFILES`, `CREATE_PROFILES`, `EDIT_PROFILES`, `DELETE_PROFILES`
- **Empresas**: `VIEW_COMPANIES`, `CREATE_COMPANIES`, `EDIT_COMPANIES`, `DELETE_COMPANIES`
- **Sistema**: `ADMIN_COMPANY`

## Segurança

### Implementações
- ✅ Tokens JWT assinados com HS256
- ✅ Cookies httpOnly e secure
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Validação de dados com Zod
- ✅ Verificação de empresa e usuário ativos
- ✅ Expiração automática de tokens
- ✅ Headers de segurança configurados

### Variáveis de Ambiente
```env
JWT_SECRET=sua-chave-secreta-super-forte-aqui
DATABASE_URL=postgresql://...
```

## Testes

### Login com cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"admin123"}' \
  -c cookies.txt

# Testar API protegida
curl http://localhost:3000/api/companies -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

### Dados de Teste
- **Email**: admin@demo.com
- **Senha**: admin123
- **Perfil**: Administrador (todas as permissões)
- **Empresa**: Demo Empresa

## Rotas

### Públicas
- `GET /` - Página inicial
- `GET /login` - Página de login
- `POST /api/auth/login` - Endpoint de login
- `POST /api/auth/logout` - Endpoint de logout

### Protegidas (Requerem autenticação)
- `GET /dashboard` - Dashboard principal
- `GET /admin/*` - Páginas administrativas
- `GET|POST /api/companies` - API de empresas
- `GET|POST /api/users` - API de usuários
- `GET|POST /api/profiles` - API de perfis
- `GET /api/permissions` - API de permissões

## Troubleshooting

### Problemas Comuns
1. **"Token de autenticação não fornecido"**
   - Verificar se fez login
   - Verificar se cookie não expirou
   - Para APIs, usar header Authorization

2. **"Token inválido ou expirado"**
   - Fazer login novamente
   - Verificar variável JWT_SECRET

3. **"Sem permissão para..."**
   - Verificar se usuário tem o perfil correto
   - Verificar se permissão foi atribuída ao perfil

### Debug
- Logs detalhados em `src/lib/permissions.ts`
- Headers de debug adicionados pelo middleware
- Modo desenvolvimento permite header `x-user-id`