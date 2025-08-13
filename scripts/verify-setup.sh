#!/bin/bash

echo "🔍 Verificação Final do Setup"
echo "============================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_color() {
    printf "${1}${2}${NC}\n"
}

# Contador de verificações
checks_passed=0
total_checks=8

# Verificação 1: Arquivos obrigatórios
print_color $BLUE "1️⃣ Verificando arquivos obrigatórios..."
required_files=(
    "package.json"
    "tsconfig.json"
    ".env.local"
    "prisma/schema.prisma"
    "src/lib/auth.ts"
    "src/lib/types.ts"
    "src/middleware.ts"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_color $GREEN "   ✅ $file"
    else
        print_color $RED "   ❌ $file não encontrado"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    ((checks_passed++))
    print_color $GREEN "✅ Todos os arquivos obrigatórios estão presentes!"
else
    print_color $RED "❌ Arquivos obrigatórios ausentes!"
fi

# Verificação 2: Dependências instaladas
print_color $BLUE "\n2️⃣ Verificando se node_modules existe..."
if [ -d "node_modules" ]; then
    ((checks_passed++))
    print_color $GREEN "✅ node_modules encontrado!"
else
    print_color $RED "❌ Execute 'npm install' primeiro!"
fi

# Verificação 3: Verificação de tipos TypeScript
print_color $BLUE "\n3️⃣ Verificando tipos TypeScript..."
if npm run type-check > /dev/null 2>&1; then
    ((checks_passed++))
    print_color $GREEN "✅ Verificação de tipos passou!"
else
    print_color $RED "❌ Erros de tipo encontrados! Execute 'npm run type-check' para detalhes."
fi

# Verificação 4: Variáveis de ambiente
print_color $BLUE "\n4️⃣ Verificando variáveis de ambiente..."
if grep -q "DATABASE_URL" .env.local && grep -q "JWT_SECRET" .env.local; then
    ((checks_passed++))
    print_color $GREEN "✅ Variáveis de ambiente configuradas!"
else
    print_color $RED "❌ Configure DATABASE_URL e JWT_SECRET no .env.local!"
fi

# Verificação 5: Cliente Prisma
print_color $BLUE "\n5️⃣ Verificando cliente Prisma..."
if [ -d "node_modules/.prisma" ]; then
    ((checks_passed++))
    print_color $GREEN "✅ Cliente Prisma gerado!"
else
    print_color $YELLOW "⚠️  Execute 'npm run db:generate' para gerar o cliente Prisma!"
fi

# Verificação 6: Teste de build
print_color $BLUE "\n6️⃣ Testando build do projeto..."
if npm run build > /dev/null 2>&1; then
    ((checks_passed++))
    print_color $GREEN "✅ Build passou!"
else
    print_color $RED "❌ Erro no build! Execute 'npm run build' para detalhes."
fi

# Verificação 7: Teste de JWT (se possível)
print_color $BLUE "\n7️⃣ Testando sistema JWT..."
if [ -f "scripts/test-types.ts" ]; then
    if npm run test-types > /dev/null 2>&1; then
        ((checks_passed++))
        print_color $GREEN "✅ Sistema JWT funcionando!"
    else
        print_color $YELLOW "⚠️  Teste JWT falhou - verifique JWT_SECRET no .env.local"
    fi
else
    print_color $YELLOW "⚠️  Script de teste não encontrado"
fi

# Verificação 8: Estrutura de pastas
print_color $BLUE "\n8️⃣ Verificando estrutura de pastas..."
required_dirs=(
    "src/app"
    "src/lib"
    "prisma"
)

all_dirs_exist=true
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_color $GREEN "   ✅ $dir/"
    else
        print_color $RED "   ❌ $dir/ não encontrado"
        all_dirs_exist=false
    fi
done

if [ "$all_dirs_exist" = true ]; then
    ((checks_passed++))
    print_color $GREEN "✅ Estrutura de pastas correta!"
else
    print_color $RED "❌ Estrutura de pastas incorreta!"
fi

# Resultado final
print_color $BLUE "\n📊 Resultado Final"
print_color $BLUE "=================="
print_color $GREEN "Verificações passou: $checks_passed/$total_checks"

if [ $checks_passed -eq $total_checks ]; then
    print_color $GREEN "\n🎉 SETUP COMPLETO! 🎉"
    print_color $GREEN "Tudo está funcionando corretamente!"
    print_color $BLUE "\n🚀 Próximos passos:"
    print_color $BLUE "   1. npm run db:migrate  # Se ainda não executou"
    print_color $BLUE "   2. npm run db:seed     # Para dados de teste"
    print_color $BLUE "   3. npm run dev         # Para iniciar o servidor"
    print_color $BLUE "\n🌐 Depois acesse: http://localhost:3000"
    print_color $BLUE "👤 Login: admin@demo.com | Senha: admin123"
elif [ $checks_passed -ge $((total_checks * 3 / 4)) ]; then
    print_color $YELLOW "\n⚠️  QUASE PRONTO!"
    print_color $YELLOW "Algumas verificações falharam, mas o básico está funcionando."
    print_color $YELLOW "Revise os itens marcados com ❌ acima."
else
    print_color $RED "\n❌ SETUP INCOMPLETO"
    print_color $RED "Muitas verificações falharam. Revise o setup."
    print_color $YELLOW "\n💡 Dicas:"
    print_color $YELLOW "   - Execute 'npm install' se não executou"
    print_color $YELLOW "   - Configure o .env.local corretamente"
    print_color $YELLOW "   - Execute 'npm run db:generate'"
fi

print_color $NC "\n"