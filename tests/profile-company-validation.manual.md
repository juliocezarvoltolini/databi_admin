# Testes Manuais - Validação de Perfil e Empresa

## Cenários de Teste para Nova Estrutura de Perfis

### 1. Teste de Criação de Perfil
**Cenário**: Criar perfil vinculado a uma empresa específica
**Passos**:
1. Fazer login como administrador de uma empresa
2. Acessar API POST `/api/profiles`
3. Enviar dados: `{ "name": "Gerente Vendas", "companyId": "empresa_id" }`

**Resultado Esperado**: 
- ✅ Perfil criado com sucesso
- ✅ Perfil vinculado à empresa especificada
- ✅ Não há registro na tabela `profile_companies` (removida)

### 2. Teste de Listagem de Perfis por Empresa
**Cenário**: Listar apenas perfis da empresa do usuário
**Passos**:
1. Fazer login como usuário da Empresa A
2. Acessar API GET `/api/profiles`

**Resultado Esperado**:
- ✅ Retorna apenas perfis da Empresa A
- ❌ Não retorna perfis de outras empresas

### 3. Teste de Acesso a Dashboards
**Cenário**: Verificar se usuário só acessa dashboards da sua empresa
**Passos**:
1. Usuário com perfil da Empresa A tenta acessar dashboard da Empresa B
2. Chamar `canAccessDashboard(userId, dashboardId)`

**Resultado Esperado**:
- ✅ Retorna `false` para dashboard de outra empresa
- ✅ Retorna `true` para dashboard da mesma empresa

### 4. Teste de Listagem de Dashboards
**Cenário**: Listar dashboards baseado na empresa do perfil
**Passos**:
1. Fazer login como usuário da Empresa A
2. Acessar API GET `/api/dashboards`

**Resultado Esperado**:
- ✅ Retorna apenas dashboards da Empresa A
- ❌ Não retorna dashboards de outras empresas

### 5. Teste de Migração de Dados
**Cenário**: Verificar se migração preservou dados corretamente
**Passos**:
1. Executar query: `SELECT * FROM profiles WHERE companyId IS NULL`
2. Executar query: `SELECT COUNT(*) FROM profile_companies`

**Resultado Esperado**:
- ✅ Nenhum perfil sem empresa (companyId NOT NULL)
- ✅ Tabela `profile_companies` não existe

### 6. Teste de Validação de Empresa
**Cenário**: Tentar criar perfil sem empresa
**Passos**:
1. Enviar POST `/api/profiles` sem `companyId`

**Resultado Esperado**:
- ✅ Usa empresa do usuário logado como padrão
- ✅ Perfil criado com empresa definida

### 7. Teste de Atualização de Perfil
**Cenário**: Tentar mover perfil para outra empresa
**Passos**:
1. Usuário da Empresa A tenta atualizar perfil para Empresa B
2. Enviar PUT `/api/profiles/[id]` com `companyId` diferente

**Resultado Esperado**:
- ❌ Retorna erro 403 - "Não é possível mover perfil para outra empresa"

## Casos de Uso Validados

### ✅ Regra 1: Dashboard vinculado à empresa
- Implementado corretamente no schema Prisma
- Validado nas APIs de dashboard

### ✅ Regra 2: Perfil vinculado a apenas uma empresa
- ✅ Schema atualizado: `Profile.companyId` obrigatório
- ✅ Tabela `ProfileCompany` removida
- ✅ Migração implementada

### ✅ Regra 3: Perfil acessa apenas dashboards da sua empresa
- ✅ Função `canAccessDashboard` atualizada
- ✅ APIs de dashboard filtram por empresa do perfil
- ✅ Validação implementada em todas as queries

## Comandos para Teste Manual

### Verificar estrutura do banco:
```sql
-- Verificar se perfis têm empresa
SELECT id, name, companyId FROM profiles;

-- Verificar se tabela profile_companies foi removida
SELECT * FROM profile_companies; -- Deve dar erro

-- Verificar dashboards por empresa
SELECT d.name, c.name as company FROM dashboards d 
JOIN companies c ON d.companyId = c.id;
```

### Testar APIs:
```bash
# Listar perfis (deve retornar apenas da empresa do usuário)
curl -X GET http://localhost:3000/api/profiles -H "Authorization: Bearer TOKEN"

# Listar dashboards (deve retornar apenas da empresa do perfil)
curl -X GET http://localhost:3000/api/dashboards -H "Authorization: Bearer TOKEN"

# Criar perfil (deve vincular à empresa automaticamente)
curl -X POST http://localhost:3000/api/profiles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Teste Perfil", "description": "Perfil de teste"}'
```

## Status dos Testes
- ✅ Migração de dados executada
- ✅ Schema atualizado
- ✅ APIs atualizadas
- ✅ Validações implementadas
- 🔄 Testes manuais pendentes de execução