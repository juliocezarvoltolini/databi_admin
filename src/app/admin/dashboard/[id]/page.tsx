// src/app/dashboard/[id]/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardViewer from "./dashboard-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DashboardPage({ params }: Props) {
  const resolvedParams = await params;
  
  // Verificar autenticação
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await verifyToken(token);
  if (!session) {
    redirect("/login");
  }

  // Buscar dados do usuário
  const user = await getCurrentUser(session.userId);
  if (!user) {
    redirect("/login");
  }

  // Buscar o dashboard
  const dashboard = await prisma.dashboard.findFirst({
    where: {
      id: resolvedParams.id,
      isActive: true,
      // Se o usuário tem empresa, verificar se o dashboard pertence à empresa
      ...(user.company ? { companyId: user.company.id } : {}),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!dashboard) {
    redirect("/admin");
  }

  return (
    <DashboardViewer
      dashboard={dashboard}
      user={user}
    />
  );
}