# 🚀 Dashboard Manager

Sistema de gerenciamento de dashboards Power BI com controle de acesso por empresa e perfis personalizáveis.

## 📋 Funcionalidades

- 🔐 **Autenticação segura** com JWT
- 🏢 **Multi-empresa** - cada empresa isolada
- 👥 **Perfis personalizáveis** por empresa
- 📊 **Integração Power BI** - links públicos
- 🔑 **Sistema de permissões** granular
- 📱 **Interface responsiva** com TailwindCSS

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT (Jose)
- **Validação**: Zod + React Hook Form

## 🚀 Setup Rápido

### 1. Clonar e instalar dependências

```bash
# Criar projeto
npx create-next-app@latest dashboard-manager --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd dashboard-manager

# Instalar dependências
npm install prisma @prisma/client bcryptjs jsonwebtoken jose zod react-hook-form @hookform/resolvers
npm install -D @types/bcryptjs @types/jsonwebtoken tsx
```

### 2. Configurar banco de dados

```bash
# Inicializar Prisma
npx prisma init

# Configurar .env.local (veja exemplo abaixo)
# Executar migrations
npx prisma migrate dev --name init

# Gerar cliente
npx prisma generate

# Popular banco
npx prisma db seed
```

### 3. Executar projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## ⚙️ Configuração do .env.local

```env
# Banco de dados PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/dashboard_manager?schema=public"

# JWT Secret (GERE UMA CHAVE FORTE!)
JWT_SECRET="sua_chave_super_secreta_aqui_128_bits_no_minimo"

# URL da aplicação
NEXTAUTH_URL="http://localhost:3000"
```

## 🗄️ Scripts Úteis

```bash
# Banco de dados
npm run db:migrate    # Executar migrations
npm run db:generate   # Gerar cliente Prisma
npm run db:seed       # Popular com dados
npm run db:studio     # Interface visual do banco
npm run db:reset      # Reset completo do banco

# Desenvolvimento
npm run dev           # Servidor de desenvolvimento
npm run build         # Build para produção
npm run start         # Servidor de produção
npm run lint          # Verificar código
```

## 👤 Usuário de Teste

Após executar o seed:

- **Email**: `admin@demo.com`
- **Senha**: `admin123`
- **Empresa**: Demo Empresa
- **Perfil**: Administrador (todas as permissões)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/                 # Página de login
│   ├── api/
│   │   └── auth/                  # APIs de autenticação
│   ├── dashboard/                 # Dashboard principal
│   ├── globals.css                # Estilos globais
│   ├── layout.tsx                 # Layout raiz
│   └── page.tsx                   # Página inicial
├── lib/
│   ├── auth.ts                    # Utilitários de autenticação
│   ├── permissions.ts             # Sistema de permissões
│   └── prisma.ts                  # Cliente Prisma
└── middleware.ts                  # Middleware de autenticação

prisma/
├── schema.prisma                  # Schema do banco
└── seed.ts                        # Dados iniciais
```

## 🔐 Sistema de Permissões

### Analogia das Chaves 🗝️

Imagine o sistema como um **prédio com várias salas**:

- **Empresas** = Andares diferentes
- **Perfis** = Tipos de cartão de acesso
- **Permissões** = Chaves específicas
- **Usuários** = Pessoas com cartões

### Permissões Disponíveis

| Permissão | Descrição | Categoria |
|-----------|-----------|-----------|
| `VIEW_DASHBOARD` | Visualizar dashboards | DASHBOARD |
| `MANAGE_DASHBOARDS` | Gerenciar dashboards | DASHBOARD |
| `VIEW_USERS` | Visualizar usuários | USER |
| `CREATE_USERS` | Criar usuários | USER |
| `EDIT_USERS` | Editar usuários | USER |
| `DELETE_USERS` | Excluir usuários | USER |
| `VIEW_PROFILES` | Visualizar perfis | PROFILE |
| `CREATE_PROFILES` | Criar perfis | PROFILE |
| `EDIT_PROFILES` | Editar perfis | PROFILE |
| `DELETE_PROFILES` | Excluir perfis | PROFILE |
| `ADMIN_COMPANY` | Administrar empresa | SYSTEM |

### Regra de Ouro ⚡

**Um usuário só pode conceder permissões que ele mesmo possui!**

## 🏢 Como Funciona Multi-Empresa

1. **Isolamento Total**: Cada empresa tem seus próprios dados
2. **Perfis Personalizados**: Cada empresa define seus perfis
3. **Dashboards Específicos**: Dashboards vinculados à empresa
4. **Usuários Segregados**: Usuários só veem dados da sua empresa

## 📊 Integrando Power BI

1. Publique seu dashboard no Power BI (versão gratuita)
2. Copie o link público
3. Cadastre no sistema vinculado à empresa
4. Atribua permissões aos perfis

## 🚨 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo service postgresql status

# Verificar conexão
psql -h localhost -U usuario -d dashboard_manager
```

### Erro no Prisma

```bash
# Reset completo do banco
npm run db:reset

# Regenerar cliente
npm run db:generate
```

### Erro no JWT

Verifique se a variável `JWT_SECRET` tem pelo menos 32 caracteres.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se todas as dependências estão instaladas
2. Confirme se o PostgreSQL está rodando
3. Verifique as variáveis de ambiente no `.env.local`
4. Execute `npm run db:reset` para reset completo

---

**Feito com ❤️ e muito ☕**