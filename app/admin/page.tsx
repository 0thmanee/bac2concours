import {
  Users,
  BookOpen,
  Video,
  CreditCard,
  UserCheck,
  Clock,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DriveAccessManager } from "@/components/admin";
import { userService } from "@/lib/services/user.service";
import { bookService } from "@/lib/services/book.service";
import { videoService } from "@/lib/services/video.service";
import { qcmService } from "@/lib/services/qcm.service";
import prisma from "@/lib/prisma";
import { PAYMENT_STATUS } from "@/lib/constants";
import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/routes";

export default async function AdminDashboard() {
  // Fetch metrics
  const [userMetrics, bookStats, videoStats, paymentMetrics, qcmStats] = await Promise.all([
    userService.getMetrics(),
    bookService.getStats(),
    videoService.getStats(),
    getPaymentMetrics(),
    qcmService.getQuestionStats(),
  ]);
  
  // Get recent users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Bienvenue ! Voici un aperçu de votre plateforme éducative.
          </p>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Total Étudiants"
          value={userMetrics.studentCount}
          icon={Users}
          color="blue"
          subtitle={`${userMetrics.activeCount} actifs`}
        />
        <MetricCard
          title="Livres"
          value={bookStats.totalBooks}
          icon={BookOpen}
          color="orange"
          subtitle={`${bookStats.activeBooks} publiés`}
        />
        <MetricCard
          title="Vidéos"
          value={videoStats.total}
          icon={Video}
          color="mint"
          subtitle={`${videoStats.active} publiées`}
        />
        <MetricCard
          title="Questions QCM"
          value={qcmStats.totalQuestions}
          icon={HelpCircle}
          color="purple"
          subtitle={`${qcmStats.activeQuestions} actives`}
        />
        <MetricCard
          title="Paiements en attente"
          value={paymentMetrics.pendingCount}
          icon={Clock}
          color="rose"
          subtitle={`${paymentMetrics.approvedCount} approuvés`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Utilisateurs Vérifiés"
          value={userMetrics.verifiedCount}
          icon={UserCheck}
          subtitle={`Sur ${userMetrics.totalCount} total`}
        />
        <StatCard
          title="Paiements Approuvés"
          value={paymentMetrics.approvedCount}
          icon={CheckCircle2}
          subtitle="Accès complet accordé"
        />
        <StatCard
          title="Administrateurs"
          value={userMetrics.adminCount}
          icon={Users}
          subtitle="Gestionnaires de plateforme"
        />
      </div>

      {/* Quick Links & Drive Access */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Links */}
        <Card className="ops-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Actions Rapides</CardTitle>
            <CardDescription>Accès rapide aux fonctionnalités principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Link
                href={ADMIN_ROUTES.USERS}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-ops-card-secondary p-4 transition-colors hover:bg-ops-hover"
              >
                <Users className="h-6 w-6 text-metric-blue mb-2" />
                <span className="text-sm font-medium">Gérer Utilisateurs</span>
              </Link>
              <Link
                href={ADMIN_ROUTES.BOOKS}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-ops-card-secondary p-4 transition-colors hover:bg-ops-hover"
              >
                <BookOpen className="h-6 w-6 text-metric-orange mb-2" />
                <span className="text-sm font-medium">Gérer Livres</span>
              </Link>
              <Link
                href={ADMIN_ROUTES.VIDEOS}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-ops-card-secondary p-4 transition-colors hover:bg-ops-hover"
              >
                <Video className="h-6 w-6 text-metric-mint mb-2" />
                <span className="text-sm font-medium">Gérer Vidéos</span>
              </Link>
              <Link
                href={ADMIN_ROUTES.QCM}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-ops-card-secondary p-4 transition-colors hover:bg-ops-hover"
              >
                <HelpCircle className="h-6 w-6 text-metric-purple mb-2" />
                <span className="text-sm font-medium">Gérer QCM</span>
              </Link>
              <Link
                href="/admin/payments"
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-ops-card-secondary p-4 transition-colors hover:bg-ops-hover sm:col-span-2"
              >
                <CreditCard className="h-6 w-6 text-metric-rose mb-2" />
                <span className="text-sm font-medium">Paiements</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Google Drive Access Manager */}
        <DriveAccessManager />
      </div>

      {/* Recent Users */}
      <div className="grid gap-6 grid-cols-1">
        <Card className="ops-card">
          <CardHeader>
            <CardTitle className="text-lg">Utilisateurs Récents</CardTitle>
            <CardDescription>Dernières inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.length === 0 ? (
                <p className="text-sm text-ops-secondary">Aucun utilisateur récent</p>
              ) : (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-ops-card-secondary p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-ops-secondary">{user.email}</p>
                    </div>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-success-light text-success-dark dark:bg-success/30 dark:text-success-light"
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-900/30 dark:text-neutral-400"
                    }`}>
                      {user.status === "ACTIVE" ? "Actif" : "Inactif"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get payment metrics
async function getPaymentMetrics() {
  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.user.count({
      where: { paymentStatus: PAYMENT_STATUS.PENDING },
    }),
    prisma.user.count({
      where: { paymentStatus: PAYMENT_STATUS.APPROVED },
    }),
    prisma.user.count({
      where: { paymentStatus: PAYMENT_STATUS.REJECTED },
    }),
  ]);

  return {
    pendingCount,
    approvedCount,
    rejectedCount,
  };
}
