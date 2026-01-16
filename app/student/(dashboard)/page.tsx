import {
  BookOpen,
  Video,
  GraduationCap,
  HelpCircle,
  ArrowRight,
  Play,
  TrendingUp,
  Target,
  Sparkles,
  Eye,
  ChevronRight,
  Flame,
  School,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { STUDENT_ROUTES } from "@/lib/routes";
import { bookService } from "@/lib/services/book.service";
import { videoService } from "@/lib/services/video.service";
import { qcmService } from "@/lib/services/qcm.service";
import { SupabaseImage } from "@/components/ui/supabase-image";

// Helper to get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

// Helper to get motivational message
function getMotivationalMessage(): string {
  const messages = [
    "Chaque jour est une nouvelle opportunité d'apprendre.",
    "La persévérance est la clé du succès.",
    "Votre avenir se construit aujourd'hui.",
    "Un pas de plus vers vos objectifs.",
    "Le savoir est votre meilleur investissement.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Helper to format duration
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}min`;
}

// Helper to get YouTube thumbnail
function getYouTubeThumbnail(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
  }
  return null;
}

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Get available content stats
  const [bookStats, videoStats, qcmStats] = await Promise.all([
    bookService.getStats(),
    videoService.getStats(),
    qcmService.getQuestionStats(),
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
    limit: 6,
    sortBy: "createdAt",
    sortOrder: "desc",
    status: "ACTIVE",
  });

  const greeting = getGreeting();
  const motivationalMessage = getMotivationalMessage();
  const firstName = session.user.name?.split(" ")[0] || "Étudiant";

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Welcome Section */}
      <Card className="border border-border">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">{motivationalMessage}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {greeting}, {firstName} !
                </h1>
                <p className="mt-1 text-muted-foreground max-w-lg">
                  Continuez votre préparation au concours 2BAC. Explorez nos ressources et testez vos connaissances.
                </p>
              </div>
            </div>

            <Link href={STUDENT_ROUTES.QUIZ}>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Target className="mr-2 h-4 w-4" />
                Lancer un Quiz
              </Button>
            </Link>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-blue-light">
                  <BookOpen className="h-5 w-5 text-metric-blue" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{bookStats.activeBooks}</p>
                  <p className="text-xs text-muted-foreground">Livres</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-orange-light">
                  <Video className="h-5 w-5 text-metric-orange" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{videoStats.active}</p>
                  <p className="text-xs text-muted-foreground">Vidéos</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-purple-light">
                  <HelpCircle className="h-5 w-5 text-metric-purple" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{qcmStats.activeQuestions}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metric-mint-light">
                  <TrendingUp className="h-5 w-5 text-metric-mint" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{qcmStats.averageSuccessRate}%</p>
                  <p className="text-xs text-muted-foreground">Réussite</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={STUDENT_ROUTES.BOOKS} className="group">
          <Card className="h-full border border-border hover:border-metric-blue transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-metric-blue-light">
                  <BookOpen className="h-6 w-6 text-metric-blue" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-metric-blue transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Bibliothèque</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Accédez à {bookStats.activeBooks} livres et documents de préparation
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={STUDENT_ROUTES.VIDEOS} className="group">
          <Card className="h-full border border-border hover:border-metric-orange transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-metric-orange-light">
                  <Video className="h-6 w-6 text-metric-orange" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-metric-orange transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Vidéothèque</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Regardez {videoStats.active} vidéos explicatives et cours
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={STUDENT_ROUTES.QUIZ} className="group">
          <Card className="h-full border border-border hover:border-metric-purple transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-metric-purple-light">
                  <HelpCircle className="h-6 w-6 text-metric-purple" />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-metric-purple transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Quiz QCM</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Testez vos connaissances avec {qcmStats.activeQuestions} questions
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Videos Section */}
      {recentVideos.videos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Vidéos récentes</h2>
              <p className="text-sm text-muted-foreground">Les dernières vidéos ajoutées</p>
            </div>
            <Link href={STUDENT_ROUTES.VIDEOS}>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.videos.map((video) => {
              const thumbnail = video.thumbnailFile?.publicUrl || getYouTubeThumbnail(video.url);
              return (
                <Link key={video.id} href={STUDENT_ROUTES.VIDEO(video.id)} className="group">
                  <Card className="h-full overflow-hidden border border-border hover:border-metric-orange transition-colors">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      {thumbnail ? (
                        <Image
                          src={thumbnail}
                          alt={video.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-metric-orange-light">
                          <Video className="h-12 w-12 text-metric-orange/50" />
                        </div>
                      )}
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-5 w-5 text-metric-orange ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-foreground/80 text-background text-xs font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="font-medium line-clamp-2 group-hover:text-metric-orange transition-colors">
                        {video.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views || 0} vues
                        </span>
                        {video.subjects?.length > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-metric-orange-light text-metric-orange font-medium">
                            {video.subjects[0]}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Books Section */}
      {recentBooks.books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Livres récents</h2>
              <p className="text-sm text-muted-foreground">Les derniers documents ajoutés</p>
            </div>
            <Link href={STUDENT_ROUTES.BOOKS}>
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                Voir tout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentBooks.books.map((book) => (
              <Link key={book.id} href={STUDENT_ROUTES.BOOK(book.id)} className="group">
                <Card className="overflow-hidden border border-border hover:border-metric-blue transition-colors">
                  {/* Cover */}
                  <div className="relative aspect-3/4 bg-muted overflow-hidden">
                    {book.coverFile?.publicUrl ? (
                      <SupabaseImage
                        src={book.coverFile.publicUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-metric-blue-light">
                        <BookOpen className="h-10 w-10 text-metric-blue/50" />
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <CardContent className="p-3 flex-1 flex flex-col justify-between">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-metric-blue transition-colors">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {book.author}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Schools Card */}
        <Link href={STUDENT_ROUTES.SCHOOLS} className="group">
          <Card className="h-full overflow-hidden border border-border hover:border-metric-cyan transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-metric-cyan-light">
                <School className="h-7 w-7 text-metric-cyan" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold group-hover:text-metric-cyan transition-colors">Explorer les Écoles</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Découvrez les écoles et universités pour votre orientation
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-metric-cyan transition-colors" />
            </CardContent>
          </Card>
        </Link>

        {/* Profile Card */}
        <Link href={STUDENT_ROUTES.PROFILE} className="group">
          <Card className="h-full overflow-hidden border border-border hover:border-metric-mint transition-colors">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-metric-mint-light">
                <GraduationCap className="h-7 w-7 text-metric-mint" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold group-hover:text-metric-mint transition-colors">Mon Profil</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  Gérez vos informations et suivez votre progression
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-metric-mint transition-colors" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Motivation Footer */}
      <Card className="border-dashed border-border">
        <CardContent className="py-6 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Flame className="h-5 w-5 text-metric-orange" />
            <span className="text-sm">
              Continuez vos efforts ! La régularité est la clé de la réussite.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
