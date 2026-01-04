import { 
  BookOpen, 
  Video,
  GraduationCap,
  Clock,
} from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { STUDENT_ROUTES } from "@/lib/routes";
import { bookService } from "@/lib/services/book.service";
import { videoService } from "@/lib/services/video.service";

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }
  
  // Get available content stats
  const [bookStats, videoStats] = await Promise.all([
    bookService.getStats(),
    videoService.getStats(),
  ]);

  // Get recent books
  const recentBooks = await bookService.findAll({
    page: 1,
    limit: 4,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });

  // Get recent videos
  const recentVideos = await videoService.findAll({
    page: 1,
    limit: 4,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ops-primary">
            Bienvenue, {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-ops-secondary">
            Accédez à vos ressources éducatives pour préparer le concours 2BAC.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Livres Disponibles"
          value={bookStats.activeBooks}
          icon={BookOpen}
          color="blue"
          subtitle={`${bookStats.totalBooks} total`}
        />
        <MetricCard
          title="Vidéos Disponibles"
          value={videoStats.active}
          icon={Video}
          color="orange"
          subtitle={`${videoStats.total} total`}
        />
        <MetricCard
          title="Votre Progression"
          value="0%"
          icon={GraduationCap}
          color="mint"
          subtitle="Continuer à apprendre"
        />
        <MetricCard
          title="Temps d'étude"
          value="0h"
          icon={Clock}
          color="rose"
          subtitle="Cette semaine"
        />
      </div>

      {/* Recent Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Books */}
        <Card className="ops-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Livres Récents</CardTitle>
              <CardDescription>Derniers livres ajoutés</CardDescription>
            </div>
            <Link 
              href={STUDENT_ROUTES.BOOKS}
              className="text-sm text-metric-blue hover:underline"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBooks.books.length === 0 ? (
                <p className="text-sm text-ops-secondary">Aucun livre disponible</p>
              ) : (
                recentBooks.books.map((book) => (
                  <Link
                    key={book.id}
                    href={STUDENT_ROUTES.BOOK(book.id)}
                    className="flex items-center justify-between rounded-lg border border-ops bg-ops-card-secondary p-3 transition-colors hover:bg-ops-hover"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-blue-light">
                        <BookOpen className="h-5 w-5 text-metric-blue" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{book.title}</p>
                        <p className="text-xs text-ops-secondary">{book.author}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-metric-blue-light px-2 py-0.5 text-xs font-medium text-metric-blue">
                      {book.subject}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Videos */}
        <Card className="ops-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vidéos Récentes</CardTitle>
              <CardDescription>Dernières vidéos ajoutées</CardDescription>
            </div>
            <Link 
              href={STUDENT_ROUTES.VIDEOS}
              className="text-sm text-metric-orange hover:underline"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVideos.videos.length === 0 ? (
                <p className="text-sm text-ops-secondary">Aucune vidéo disponible</p>
              ) : (
                recentVideos.videos.map((video) => (
                  <Link
                    key={video.id}
                    href={STUDENT_ROUTES.VIDEO(video.id)}
                    className="flex items-center justify-between rounded-lg border border-ops bg-ops-card-secondary p-3 transition-colors hover:bg-ops-hover"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-orange-light">
                        <Video className="h-5 w-5 text-metric-orange" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{video.title}</p>
                        <p className="text-xs text-ops-secondary">
                          {video.duration ? `${Math.floor(video.duration / 60)} min` : "Vidéo"}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-metric-orange-light px-2 py-0.5 text-xs font-medium text-metric-orange">
                      {video.subject}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="ops-card">
        <CardHeader>
          <CardTitle className="text-lg">Accès Rapide</CardTitle>
          <CardDescription>Explorez votre contenu éducatif</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link 
              href={STUDENT_ROUTES.BOOKS}
              className="flex flex-col items-center justify-center rounded-lg border border-ops bg-ops-card-secondary p-6 transition-colors hover:bg-ops-hover"
            >
              <BookOpen className="h-8 w-8 text-metric-blue mb-3" />
              <span className="text-sm font-medium">Tous les Livres</span>
            </Link>
            <Link 
              href={STUDENT_ROUTES.VIDEOS}
              className="flex flex-col items-center justify-center rounded-lg border border-ops bg-ops-card-secondary p-6 transition-colors hover:bg-ops-hover"
            >
              <Video className="h-8 w-8 text-metric-orange mb-3" />
              <span className="text-sm font-medium">Toutes les Vidéos</span>
            </Link>
            <Link 
              href={STUDENT_ROUTES.PROFILE}
              className="flex flex-col items-center justify-center rounded-lg border border-ops bg-ops-card-secondary p-6 transition-colors hover:bg-ops-hover"
            >
              <GraduationCap className="h-8 w-8 text-metric-mint mb-3" />
              <span className="text-sm font-medium">Mon Profil</span>
            </Link>
            <Link 
              href={STUDENT_ROUTES.PROFILE}
              className="flex flex-col items-center justify-center rounded-lg border border-ops bg-ops-card-secondary p-6 transition-colors hover:bg-ops-hover"
            >
              <Clock className="h-8 w-8 text-metric-purple mb-3" />
              <span className="text-sm font-medium">Historique</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
