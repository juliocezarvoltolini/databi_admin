// prisma/seed.js
import { PrismaClient } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // 1. Criar permissões básicas
    console.log("📋 Criando permissões...");
    const permissions = [
      {
        name: "VIEW_DASHBOARD",
        description: "Visualizar dashboards",
        category: "DASHBOARD",
      },
      {
        name: "MANAGE_DASHBOARDS",
        description: "Gerenciar dashboards",
        category: "DASHBOARD",
      },
      {
        name: "VIEW_USERS",
        description: "Visualizar usuários",
        category: "USER",
      },
      { name: "CREATE_USERS", description: "Criar usuários", category: "USER" },
      { name: "EDIT_USERS", description: "Editar usuários", category: "USER" },
      {
        name: "DELETE_USERS",
        description: "Excluir usuários",
        category: "USER",
      },
      {
        name: "VIEW_PROFILES",
        description: "Visualizar perfis",
        category: "PROFILE",
      },
      {
        name: "CREATE_PROFILES",
        description: "Criar perfis",
        category: "PROFILE",
      },
      {
        name: "EDIT_PROFILES",
        description: "Editar perfis",
        category: "PROFILE",
      },
      {
        name: "DELETE_PROFILES",
        description: "Excluir perfis",
        category: "PROFILE",
      },
      {
        name: "ADMIN_COMPANY",
        description: "Administração da empresa",
        category: "SYSTEM",
      },
    ];

    for (const perm of permissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      });
    }
    console.log(`✅ ${permissions.length} permissões criadas/atualizadas`);

    // 2. Criar empresa demo
    console.log("🏢 Criando empresa demo...");
    const demoCompany = await prisma.company.upsert({
      where: { slug: "demo-empresa" },
      update: {},
      create: {
        name: "Demo Empresa",
        slug: "demo-empresa",
        logo: null,
      },
    });
    console.log(`✅ Empresa criada: ${demoCompany.name}`);

    // 3. Criar perfis para a empresa demo
    console.log("👥 Criando perfis...");

    // Verificar se o perfil já existe antes de criar
    let adminProfile = await prisma.profile.findFirst({
      where: {
        name: "Administrador",
        companyId: demoCompany.id,
      },
    });

    if (!adminProfile) {
      adminProfile = await prisma.profile.create({
        data: {
          name: "Administrador",
          description: "Acesso total ao sistema da empresa",
          companyId: demoCompany.id,
        },
      });
      console.log("✅ Perfil Administrador criado");
    } else {
      console.log("ℹ️  Perfil Administrador já existe");
    }

    let viewerProfile = await prisma.profile.findFirst({
      where: {
        name: "Visualizador",
        companyId: demoCompany.id,
      },
    });

    if (!viewerProfile) {
      viewerProfile = await prisma.profile.create({
        data: {
          name: "Visualizador",
          description: "Apenas visualização de dashboards",
          companyId: demoCompany.id,
        },
      });
      console.log("✅ Perfil Visualizador criado");
    } else {
      console.log("ℹ️  Perfil Visualizador já existe");
    }

    // 4. Atribuir permissões aos perfis
    console.log("🔑 Atribuindo permissões...");
    const allPermissions = await prisma.permission.findMany();

    // Limpar permissões existentes para evitar duplicatas
    await prisma.profilePermission.deleteMany({
      where: {
        profileId: {
          in: [adminProfile.id, viewerProfile.id],
        },
      },
    });

    // Admin tem todas as permissões
    let adminPermissionsCount = 0;
    for (const permission of allPermissions) {
      await prisma.profilePermission.create({
        data: {
          profileId: adminProfile.id,
          permissionId: permission.id,
          dashboardId: null,
        },
      });
      adminPermissionsCount++;
    }
    console.log(
      `✅ ${adminPermissionsCount} permissões atribuídas ao Administrador`
    );

    // Visualizador só pode ver dashboards
    const viewPermission = allPermissions.find(
      (p) => p.name === "VIEW_DASHBOARD"
    );
    if (viewPermission) {
      await prisma.profilePermission.create({
        data: {
          profileId: viewerProfile.id,
          permissionId: viewPermission.id,
          dashboardId: null,
        },
      });
      console.log("✅ Permissão VIEW_DASHBOARD atribuída ao Visualizador");
    }

    // 5. Criar usuário admin
    console.log("👤 Criando usuário admin...");
    const hashedPassword = await hash("admin123", 10);

    const adminUser = await prisma.user.upsert({
      where: { email: "admin@demo.com" },
      update: {},
      create: {
        email: "admin@demo.com",
        name: "Admin Demo",
        password: hashedPassword,
        companyId: demoCompany.id,
        profileId: adminProfile.id,
      },
    });
    console.log(`✅ Usuário admin criado: ${adminUser.email}`);

    // 6. Criar dashboard demo
    console.log("📊 Criando dashboard demo...");

    // Verificar se já existe um dashboard com esse nome na empresa
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        name: "Dashboard Vendas",
        companyId: demoCompany.id,
      },
    });

    if (!existingDashboard) {
      const dashboard = await prisma.dashboard.create({
        data: {
          name: "Dashboard Vendas",
          description: "Dashboard de vendas mensais",
          powerbiUrl: "https://app.powerbi.com/view?r=exemplo123",
          companyId: demoCompany.id,
        },
      });
      console.log(`✅ Dashboard criado: ${dashboard.name}`);
    } else {
      console.log("ℹ️  Dashboard Vendas já existe");
    }

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("==========================================");
    console.log("📧 Email: admin@demo.com");
    console.log("🔒 Senha: admin123");
    console.log("🏢 Empresa: Demo Empresa");
    console.log("👤 Perfil: Administrador");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Erro detalhado no seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
