/**
 * Seed script for Books and Videos
 * Run with: npx tsx prisma/seed-books-videos.ts
 *
 * This script seeds educational content (books and videos) without media files
 * to prevent upload errors. It requires at least one admin user to exist.
 */
import "dotenv/config";
import { PrismaClient, BookStatus, VideoStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to extract YouTube ID from URL
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Book seed data
const booksData = [
  {
    title: "Mathématiques - Analyse et Algèbre",
    author: "Mohammed Alami",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subject: "Mathématiques",
    description:
      "Un manuel complet couvrant l'analyse mathématique et l'algèbre linéaire pour les élèves de terminale sciences mathématiques. Inclut des exercices corrigés et des problèmes de révision.",
    fileUrl: "https://drive.google.com/file/d/example1/view",
    fileName: "maths-analyse-algebre.pdf",
    fileSize: "25.4 MB",
    totalPages: 320,
    tags: ["analyse", "algèbre", "exercices", "corrigés", "bac"],
  },
  {
    title: "Physique - Mécanique et Ondes",
    author: "Fatima Zahra Bennani",
    school: "Sciences Physiques",
    category: "Physique",
    level: "Terminale",
    subject: "Physique",
    description:
      "Cours de physique couvrant la mécanique newtonienne et les phénomènes ondulatoires. Exercices pratiques et applications concrètes inclus.",
    fileUrl: "https://drive.google.com/file/d/example2/view",
    fileName: "physique-mecanique-ondes.pdf",
    fileSize: "18.7 MB",
    totalPages: 245,
    tags: ["mécanique", "ondes", "physique", "exercices"],
  },
  {
    title: "Chimie Organique - Fondamentaux",
    author: "Ahmed El Mansouri",
    school: "Sciences Physiques",
    category: "Chimie",
    level: "Terminale",
    subject: "Chimie",
    description:
      "Introduction complète à la chimie organique. Réactions, mécanismes et synthèse organique expliqués avec clarté.",
    fileUrl: "https://drive.google.com/file/d/example3/view",
    fileName: "chimie-organique.pdf",
    fileSize: "15.2 MB",
    totalPages: 198,
    tags: ["chimie", "organique", "réactions", "synthèse"],
  },
  {
    title: "Sciences de la Vie et de la Terre",
    author: "Khadija Tazi",
    school: "Sciences de la Vie et de la Terre",
    category: "SVT",
    level: "Terminale",
    subject: "SVT",
    description:
      "Manuel complet de SVT couvrant la génétique, l'écologie et la géologie. Préparation au baccalauréat incluse.",
    fileUrl: "https://drive.google.com/file/d/example4/view",
    fileName: "svt-terminale.pdf",
    fileSize: "32.1 MB",
    totalPages: 412,
    tags: ["génétique", "écologie", "géologie", "svt", "bac"],
  },
  {
    title: "Philosophie - Introduction à la Pensée",
    author: "Youssef Amrani",
    school: "Toutes Filières",
    category: "Philosophie",
    level: "Terminale",
    subject: "Philosophie",
    description:
      "Introduction à la philosophie pour les élèves de terminale. Courants de pensée, auteurs majeurs et dissertations guidées.",
    fileUrl: "https://drive.google.com/file/d/example5/view",
    fileName: "philosophie-intro.pdf",
    fileSize: "12.8 MB",
    totalPages: 176,
    tags: ["philosophie", "dissertation", "penseurs", "bac"],
  },
  {
    title: "Français - Littérature et Expression",
    author: "Marie Dupont",
    school: "Toutes Filières",
    category: "Français",
    level: "Terminale",
    subject: "Français",
    description:
      "Cours de français axé sur la littérature française et les techniques d'expression écrite et orale.",
    fileUrl: "https://drive.google.com/file/d/example6/view",
    fileName: "francais-litterature.pdf",
    fileSize: "14.5 MB",
    totalPages: 210,
    tags: ["français", "littérature", "expression", "écrit"],
  },
  {
    title: "Économie et Gestion",
    author: "Rachid Benjelloun",
    school: "Sciences Économiques",
    category: "Économie",
    level: "Terminale",
    subject: "Économie",
    description:
      "Manuel d'économie et gestion pour les élèves de sciences économiques. Microéconomie, macroéconomie et comptabilité.",
    fileUrl: "https://drive.google.com/file/d/example7/view",
    fileName: "economie-gestion.pdf",
    fileSize: "20.3 MB",
    totalPages: 285,
    tags: ["économie", "gestion", "comptabilité", "bac"],
  },
  {
    title: "Anglais - Advanced English",
    author: "Sarah Johnson",
    school: "Toutes Filières",
    category: "Anglais",
    level: "Terminale",
    subject: "Anglais",
    description:
      "Cours d'anglais avancé pour les élèves de terminale. Grammaire, vocabulaire et compréhension écrite et orale.",
    fileUrl: "https://drive.google.com/file/d/example8/view",
    fileName: "anglais-advanced.pdf",
    fileSize: "11.2 MB",
    totalPages: 156,
    tags: ["anglais", "grammaire", "vocabulaire", "bac"],
  },
];

// Video seed data (using real YouTube educational videos)
const videosData = [
  {
    title: "Cours Complet - Limites et Continuité",
    description:
      "Cours complet sur les limites et la continuité des fonctions. Définitions, théorèmes et exemples pratiques pour bien comprendre ces concepts fondamentaux.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder - replace with real math video
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subject: "Mathématiques",
    duration: 2400, // 40 minutes
    tags: ["limites", "continuité", "analyse", "cours"],
  },
  {
    title: "Les Dérivées - Méthode Complète",
    description:
      "Apprenez à calculer les dérivées de toutes les fonctions. Règles de dérivation, dérivées composées et applications.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subject: "Mathématiques",
    duration: 1800, // 30 minutes
    tags: ["dérivées", "calcul", "fonctions", "cours"],
  },
  {
    title: "Intégrales - Du Zéro au Héros",
    description:
      "Maîtrisez les intégrales ! Ce cours couvre les primitives, intégrales définies et techniques d'intégration.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subject: "Mathématiques",
    duration: 3600, // 60 minutes
    tags: ["intégrales", "primitives", "calcul", "cours"],
  },
  {
    title: "Mécanique du Point - Cours Complet",
    description:
      "Cours de mécanique du point matériel. Cinématique, dynamique et énergie mécanique expliquées simplement.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Physiques",
    category: "Physique",
    level: "Terminale",
    subject: "Physique",
    duration: 2700, // 45 minutes
    tags: ["mécanique", "cinématique", "dynamique", "physique"],
  },
  {
    title: "Électromagnétisme - Les Bases",
    description:
      "Introduction à l'électromagnétisme. Champs électriques et magnétiques, forces de Lorentz et applications.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Physiques",
    category: "Physique",
    level: "Terminale",
    subject: "Physique",
    duration: 2100, // 35 minutes
    tags: ["électromagnétisme", "champs", "physique", "cours"],
  },
  {
    title: "Réactions Chimiques - Équilibrage et Stœchiométrie",
    description:
      "Apprenez à équilibrer les réactions chimiques et à effectuer des calculs stœchiométriques.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Physiques",
    category: "Chimie",
    level: "Terminale",
    subject: "Chimie",
    duration: 1500, // 25 minutes
    tags: ["chimie", "réactions", "stœchiométrie", "équilibrage"],
  },
  {
    title: "Génétique - ADN et Hérédité",
    description:
      "Cours de génétique couvrant la structure de l'ADN, la réplication et les lois de l'hérédité mendélienne.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences de la Vie et de la Terre",
    category: "SVT",
    level: "Terminale",
    subject: "SVT",
    duration: 2400, // 40 minutes
    tags: ["génétique", "ADN", "hérédité", "svt"],
  },
  {
    title: "Dissertation de Philosophie - Méthodologie",
    description:
      "Méthodologie complète de la dissertation de philosophie. Introduction, développement et conclusion parfaits.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Toutes Filières",
    category: "Philosophie",
    level: "Terminale",
    subject: "Philosophie",
    duration: 1800, // 30 minutes
    tags: ["philosophie", "dissertation", "méthodologie", "bac"],
  },
  {
    title: "Analyse Économique - Microéconomie",
    description:
      "Introduction à la microéconomie. Offre, demande, équilibre du marché et élasticités expliqués.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Économiques",
    category: "Économie",
    level: "Terminale",
    subject: "Économie",
    duration: 2100, // 35 minutes
    tags: ["économie", "microéconomie", "marché", "cours"],
  },
  {
    title: "English Grammar - Tenses Made Easy",
    description:
      "Master all English tenses in this comprehensive lesson. Present, past, future and perfect tenses explained.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Toutes Filières",
    category: "Anglais",
    level: "Terminale",
    subject: "Anglais",
    duration: 1500, // 25 minutes
    tags: ["anglais", "grammaire", "tenses", "english"],
  },
];

async function main() {
  console.log("🌱 Starting Books and Videos seed...\n");

  // Find an admin user to use as uploader
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.error("❌ No admin user found. Please run the main seed first.");
    process.exit(1);
  }

  console.log(`📚 Using admin user: ${admin.email}\n`);

  // Clear existing books and videos
  console.log("🧹 Clearing existing books and videos...");
  await prisma.book.deleteMany();
  await prisma.video.deleteMany();
  console.log("✅ Cleared existing data\n");

  // Seed Books
  console.log("📖 Seeding books...");
  for (const book of booksData) {
    const created = await prisma.book.create({
      data: {
        ...book,
        uploadedById: admin.id,
        status: BookStatus.ACTIVE,
        isPublic: true,
        language: "fr",
        views: Math.floor(Math.random() * 500) + 50,
        downloads: Math.floor(Math.random() * 200) + 20,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      },
    });
    console.log(`  ✓ ${created.title}`);
  }
  console.log(`\n✅ Created ${booksData.length} books\n`);

  // Seed Videos
  console.log("🎬 Seeding videos...");
  for (const video of videosData) {
    const youtubeId = extractYouTubeId(video.url);
    const created = await prisma.video.create({
      data: {
        ...video,
        youtubeId,
        uploadedById: admin.id,
        status: VideoStatus.ACTIVE,
        isPublic: true,
        views: Math.floor(Math.random() * 1000) + 100,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      },
    });
    console.log(`  ✓ ${created.title}`);
  }
  console.log(`\n✅ Created ${videosData.length} videos\n`);

  // Summary
  const bookCount = await prisma.book.count();
  const videoCount = await prisma.video.count();

  console.log("📊 Summary:");
  console.log(`  - Books: ${bookCount}`);
  console.log(`  - Videos: ${videoCount}`);
  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
