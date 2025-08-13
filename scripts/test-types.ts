// scripts/test-types.ts
// Script para testar se todos os tipos estão funcionando corretamente

import { generateToken, verifyToken } from "../src/lib/auth";
import { UserSession } from "../src/lib/types";

async function testTypes() {
  console.log("🧪 Testando tipos e JWT...");

  // Dados de teste
  const testUser: UserSession = {
    userId: "test_user_123",
    email: "test@example.com",
    name: "Test User",
    companyId: "test_company_123",
    profileId: "test_profile_123",
  };

  try {
    // Teste 1: Gerar token
    console.log("1️⃣ Testando geração de token...");
    const token = await generateToken(testUser);
    console.log("✅ Token gerado com sucesso!");
    console.log(`Token: ${token.substring(0, 50)}...`);

    // Teste 2: Verificar token
    console.log("\n2️⃣ Testando verificação de token...");
    const verifiedUser = await verifyToken(token);

    if (verifiedUser) {
      console.log("✅ Token verificado com sucesso!");
      console.log("Dados do usuário:", verifiedUser);

      // Verificar se os dados coincidem
      const isValid =
        verifiedUser.userId === testUser.userId &&
        verifiedUser.email === testUser.email &&
        verifiedUser.name === testUser.name &&
        verifiedUser.companyId === testUser.companyId &&
        verifiedUser.profileId === testUser.profileId;

      if (isValid) {
        console.log("✅ Todos os dados coincidem!");
      } else {
        console.log("❌ Dados não coincidem!");
        console.log("Original:", testUser);
        console.log("Verificado:", verifiedUser);
      }
    } else {
      console.log("❌ Falha na verificação do token!");
    }

    // Teste 3: Token inválido
    console.log("\n3️⃣ Testando token inválido...");
    const invalidTokenResult = await verifyToken("token_invalido");
    if (invalidTokenResult === null) {
      console.log("✅ Token inválido rejeitado corretamente!");
    } else {
      console.log("❌ Token inválido aceito incorretamente!");
    }

    console.log("\n🎉 Todos os testes passaram!");
  } catch (error) {
    console.error("❌ Erro nos testes:", error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testTypes();
}

export { testTypes };
