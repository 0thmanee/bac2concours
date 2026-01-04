/**
 * Book Seeding Script for 2BAC Learning Platform
 * Seeds realistic Moroccan Baccalaureate books across different subjects and levels
 */
import "dotenv/config";
import { PrismaClient, BookStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("📚 Starting books database seed...");

  // Find an admin or student user to be the uploader
  let uploader = await prisma.user.findFirst({
    where: {
      OR: [{ role: "ADMIN" }, { role: "STUDENT" }],
    },
  });

  // If no user exists, create a default uploader
  if (!uploader) {
    console.log("⚠️  No admin/student found, creating default uploader...");
    const { hash } = await import("bcryptjs");
    const password = await hash("admin123456", 12);
    uploader = await prisma.user.create({
      data: {
        email: "admin@2bac.ma",
        password,
        name: "Admin 2BAC",
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });
    console.log("✅ Created default uploader:", uploader.email);
  }

  // Clear existing books (optional)
  console.log("🧹 Clearing existing books...");
  await prisma.book.deleteMany();

  // Create comprehensive book data for 2BAC
  const books = await Promise.all([
    // ========== MATHÉMATIQUES ==========
    prisma.book.create({
      data: {
        title: "Mathématiques - Analyse et Algèbre",
        author: "Mohammed Alami & Fatima Zahra Bennani",
        school: "Sciences Mathématiques",
        category: "Mathématiques",
        subject: "Mathématiques",
        level: "Terminale",
        description:
          "Cours complet couvrant l'analyse mathématique, l'algèbre linéaire, les fonctions complexes et la géométrie analytique. Conforme au programme officiel marocain 2BAC Sciences Mathématiques.",
        coverUrl:
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400",
        fileUrl: "/books/math-analyse-algebre.pdf",
        fileName: "math-analyse-algebre.pdf",
        fileSize: "28.5 MB",
        totalPages: 456,
        language: "fr",
        tags: [
          "analyse",
          "algèbre",
          "fonctions",
          "dérivées",
          "intégrales",
          "limites",
        ],
        downloads: 1247,
        views: 3421,
        rating: 4.8,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Exercices Corrigés de Mathématiques",
        author: "Hassan Tazi",
        school: "Sciences Mathématiques",
        category: "Mathématiques",
        subject: "Mathématiques",
        level: "Terminale",
        description:
          "Plus de 500 exercices corrigés en détail pour maîtriser tous les chapitres du programme de mathématiques 2BAC. Idéal pour la préparation aux examens.",
        coverUrl:
          "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400",
        fileUrl: "/books/math-exercices-corriges.pdf",
        fileName: "math-exercices-corriges.pdf",
        fileSize: "35.2 MB",
        totalPages: 612,
        language: "fr",
        tags: ["exercices", "corrigés", "pratique", "examens", "révision"],
        downloads: 2156,
        views: 5234,
        rating: 4.9,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Géométrie dans l'Espace - 2BAC",
        author: "Rachid Benkirane",
        school: "Sciences Mathématiques",
        category: "Mathématiques",
        subject: "Mathématiques",
        level: "Terminale",
        description:
          "Étude approfondie de la géométrie dans l'espace : droites, plans, vecteurs, produit scalaire et transformations géométriques.",
        coverUrl:
          "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400",
        fileUrl: "/books/geometrie-espace.pdf",
        fileName: "geometrie-espace.pdf",
        fileSize: "19.8 MB",
        totalPages: 298,
        language: "fr",
        tags: ["géométrie", "espace", "vecteurs", "plans", "transformations"],
        downloads: 892,
        views: 2145,
        rating: 4.6,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== PHYSIQUE-CHIMIE ==========
    prisma.book.create({
      data: {
        title: "Physique - Mécanique et Électricité",
        author: "Karim El Fassi & Nadia Idrissi",
        school: "Sciences Physiques",
        category: "Physique",
        subject: "Physique",
        level: "Terminale",
        description:
          "Manuel complet de physique 2BAC couvrant la mécanique newtonienne, l'électricité, le magnétisme et les ondes. Avec expériences et applications pratiques.",
        coverUrl:
          "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400",
        fileUrl: "/books/physique-mecanique-electricite.pdf",
        fileName: "physique-mecanique-electricite.pdf",
        fileSize: "32.4 MB",
        totalPages: 521,
        language: "fr",
        tags: ["physique", "mécanique", "électricité", "magnétisme", "ondes"],
        downloads: 1534,
        views: 3892,
        rating: 4.7,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Chimie Organique et Minérale",
        author: "Samira Benjelloun",
        school: "Sciences Physiques",
        category: "Chimie",
        subject: "Chimie",
        level: "Terminale",
        description:
          "Cours de chimie organique et minérale pour 2BAC : réactions chimiques, stéréochimie, cinétique, thermochimie et chimie des solutions.",
        coverUrl:
          "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=400",
        fileUrl: "/books/chimie-organique-minerale.pdf",
        fileName: "chimie-organique-minerale.pdf",
        fileSize: "26.7 MB",
        totalPages: 432,
        language: "fr",
        tags: ["chimie", "organique", "minérale", "réactions", "stéréochimie"],
        downloads: 1123,
        views: 2876,
        rating: 4.5,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Travaux Pratiques de Physique-Chimie",
        author: "Mehdi Alaoui",
        school: "Sciences Physiques",
        category: "Physique",
        subject: "Physique",
        level: "Terminale",
        description:
          "Guide complet des travaux pratiques de physique et chimie avec protocoles détaillés, mesures et analyses de résultats.",
        coverUrl:
          "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=400",
        fileUrl: "/books/tp-physique-chimie.pdf",
        fileName: "tp-physique-chimie.pdf",
        fileSize: "22.1 MB",
        totalPages: 347,
        language: "fr",
        tags: ["TP", "pratique", "expériences", "laboratoire", "mesures"],
        downloads: 987,
        views: 2341,
        rating: 4.4,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== SVT (SCIENCES DE LA VIE ET DE LA TERRE) ==========
    prisma.book.create({
      data: {
        title: "Biologie - Génétique et Évolution",
        author: "Laila Bennani & Ahmed Tazi",
        school: "Sciences de la Vie et de la Terre",
        category: "SVT",
        subject: "SVT",
        level: "Terminale",
        description:
          "Cours complet de biologie couvrant la génétique moléculaire, l'évolution, l'immunologie et la communication nerveuse.",
        coverUrl:
          "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400",
        fileUrl: "/books/biologie-genetique-evolution.pdf",
        fileName: "biologie-genetique-evolution.pdf",
        fileSize: "29.3 MB",
        totalPages: 478,
        language: "fr",
        tags: ["biologie", "génétique", "évolution", "immunologie", "ADN"],
        downloads: 1456,
        views: 3567,
        rating: 4.8,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Géologie et Écologie",
        author: "Youssef Chraibi",
        school: "Sciences de la Vie et de la Terre",
        category: "SVT",
        subject: "SVT",
        level: "Terminale",
        description:
          "Étude de la géologie dynamique, la tectonique des plaques, les écosystèmes et la gestion des ressources naturelles.",
        coverUrl:
          "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400",
        fileUrl: "/books/geologie-ecologie.pdf",
        fileName: "geologie-ecologie.pdf",
        fileSize: "31.5 MB",
        totalPages: 412,
        language: "fr",
        tags: [
          "géologie",
          "écologie",
          "tectonique",
          "écosystèmes",
          "environnement",
        ],
        downloads: 834,
        views: 1987,
        rating: 4.6,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== PHILOSOPHIE ==========
    prisma.book.create({
      data: {
        title: "Philosophie - Cours et Méthodologie",
        author: "Omar El Khatib",
        school: "Toutes Filières",
        category: "Philosophie",
        subject: "Philosophie",
        level: "Terminale",
        description:
          "Manuel de philosophie pour le baccalauréat : les grandes notions, les auteurs classiques, la méthodologie de la dissertation et du commentaire de texte.",
        coverUrl:
          "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400",
        fileUrl: "/books/philosophie-cours-methodologie.pdf",
        fileName: "philosophie-cours-methodologie.pdf",
        fileSize: "18.9 MB",
        totalPages: 356,
        language: "fr",
        tags: [
          "philosophie",
          "dissertation",
          "méthodologie",
          "auteurs",
          "notions",
        ],
        downloads: 1678,
        views: 4123,
        rating: 4.7,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Textes Philosophiques Commentés",
        author: "Zineb Fassi Fihri",
        school: "Toutes Filières",
        category: "Philosophie",
        subject: "Philosophie",
        level: "Terminale",
        description:
          "Recueil de textes philosophiques essentiels avec commentaires détaillés et analyses pour préparer l'épreuve du bac.",
        coverUrl:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400",
        fileUrl: "/books/textes-philosophiques-commentes.pdf",
        fileName: "textes-philosophiques-commentes.pdf",
        fileSize: "15.2 MB",
        totalPages: 289,
        language: "fr",
        tags: ["philosophie", "textes", "commentaires", "analyses", "auteurs"],
        downloads: 1234,
        views: 2987,
        rating: 4.6,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== FRANÇAIS ==========
    prisma.book.create({
      data: {
        title: "Français - Œuvres au Programme",
        author: "Amina Berrada",
        school: "Toutes Filières",
        category: "Français",
        subject: "Français",
        level: "Terminale",
        description:
          "Analyses détaillées des œuvres au programme : La Boîte à Merveilles, Antigone, Le Dernier jour d'un condamné, et autres œuvres classiques.",
        coverUrl:
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
        fileUrl: "/books/francais-oeuvres-programme.pdf",
        fileName: "francais-oeuvres-programme.pdf",
        fileSize: "21.4 MB",
        totalPages: 398,
        language: "fr",
        tags: ["français", "littérature", "œuvres", "analyses", "auteurs"],
        downloads: 2345,
        views: 5678,
        rating: 4.9,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Production Écrite - Techniques et Exemples",
        author: "Karim Ziani",
        school: "Toutes Filières",
        category: "Français",
        subject: "Français",
        level: "Terminale",
        description:
          "Guide pratique de la production écrite : argumentation, description, narration, avec des exemples concrets et des exercices corrigés.",
        coverUrl:
          "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
        fileUrl: "/books/production-ecrite-techniques.pdf",
        fileName: "production-ecrite-techniques.pdf",
        fileSize: "16.8 MB",
        totalPages: 267,
        language: "fr",
        tags: [
          "français",
          "production écrite",
          "rédaction",
          "méthodologie",
          "exemples",
        ],
        downloads: 1876,
        views: 4234,
        rating: 4.7,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== ARABE ==========
    prisma.book.create({
      data: {
        title: "اللغة العربية - المؤلفات المقررة",
        author: "محمد العلمي و فاطمة الزهراء",
        school: "جميع الشعب",
        category: "Arabe",
        subject: "Arabe",
        level: "Terminale",
        description:
          "دراسة شاملة للمؤلفات المقررة في اللغة العربية للباكالوريا مع تحليلات نقدية ومنهجية للتعبير والإنشاء",
        coverUrl:
          "https://images.unsplash.com/photo-1509266272358-7701da638078?w=400",
        fileUrl: "/books/arabe-oeuvres-programme.pdf",
        fileName: "arabe-oeuvres-programme.pdf",
        fileSize: "24.3 MB",
        totalPages: 421,
        language: "ar",
        tags: ["عربية", "أدب", "مؤلفات", "تحليل", "إنشاء"],
        downloads: 1987,
        views: 4567,
        rating: 4.8,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== ANGLAIS ==========
    prisma.book.create({
      data: {
        title: "English - Grammar and Writing Skills",
        author: "Sarah Thompson & Mohammed Alami",
        school: "All Branches",
        category: "Anglais",
        subject: "Anglais",
        level: "Terminale",
        description:
          "Comprehensive English course for Moroccan Baccalaureate: grammar, vocabulary, writing techniques, and exam preparation.",
        coverUrl:
          "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
        fileUrl: "/books/english-grammar-writing.pdf",
        fileName: "english-grammar-writing.pdf",
        fileSize: "19.6 MB",
        totalPages: 334,
        language: "en",
        tags: ["english", "grammar", "writing", "vocabulary", "exam prep"],
        downloads: 1654,
        views: 3876,
        rating: 4.6,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== HISTOIRE-GÉOGRAPHIE ==========
    prisma.book.create({
      data: {
        title: "Histoire - Le Monde Contemporain",
        author: "Hassan Ouazzani",
        school: "Sciences Humaines",
        category: "Histoire",
        subject: "Histoire",
        level: "Terminale",
        description:
          "Cours d'histoire contemporaine : les deux guerres mondiales, la décolonisation, la guerre froide et le nouvel ordre mondial.",
        coverUrl:
          "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400",
        fileUrl: "/books/histoire-monde-contemporain.pdf",
        fileName: "histoire-monde-contemporain.pdf",
        fileSize: "27.9 MB",
        totalPages: 445,
        language: "fr",
        tags: [
          "histoire",
          "contemporain",
          "guerres mondiales",
          "décolonisation",
        ],
        downloads: 1123,
        views: 2654,
        rating: 4.5,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Géographie - Mondialisation et Enjeux",
        author: "Fatima Bennis",
        school: "Sciences Humaines",
        category: "Géographie",
        subject: "Géographie",
        level: "Terminale",
        description:
          "Étude géographique de la mondialisation, des flux économiques, des inégalités de développement et des enjeux environnementaux.",
        coverUrl:
          "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400",
        fileUrl: "/books/geographie-mondialisation.pdf",
        fileName: "geographie-mondialisation.pdf",
        fileSize: "30.2 MB",
        totalPages: 398,
        language: "fr",
        tags: [
          "géographie",
          "mondialisation",
          "économie",
          "développement",
          "environnement",
        ],
        downloads: 945,
        views: 2234,
        rating: 4.4,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== ÉCONOMIE ==========
    prisma.book.create({
      data: {
        title: "Économie Générale et Statistiques",
        author: "Driss Tahiri",
        school: "Sciences Économiques",
        category: "Économie",
        subject: "Économie",
        level: "Terminale",
        description:
          "Cours d'économie générale et de statistiques : microéconomie, macroéconomie, politiques économiques et analyses statistiques.",
        coverUrl:
          "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
        fileUrl: "/books/economie-generale-statistiques.pdf",
        fileName: "economie-generale-statistiques.pdf",
        fileSize: "25.6 MB",
        totalPages: 412,
        language: "fr",
        tags: [
          "économie",
          "statistiques",
          "microéconomie",
          "macroéconomie",
          "analyses",
        ],
        downloads: 1287,
        views: 3145,
        rating: 4.7,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== SCIENCES DE L'INGÉNIEUR ==========
    prisma.book.create({
      data: {
        title: "Sciences de l'Ingénieur - Systèmes Techniques",
        author: "Abdelaziz El Amrani",
        school: "Sciences et Technologies",
        category: "Sciences de l'Ingénieur",
        subject: "Sciences de l'Ingénieur",
        level: "Terminale",
        description:
          "Étude des systèmes techniques : mécanique, électronique, automatique et analyse fonctionnelle des systèmes.",
        coverUrl:
          "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
        fileUrl: "/books/sciences-ingenieur-systemes.pdf",
        fileName: "sciences-ingenieur-systemes.pdf",
        fileSize: "33.7 MB",
        totalPages: 534,
        language: "fr",
        tags: [
          "sciences de l'ingénieur",
          "mécanique",
          "électronique",
          "automatique",
          "systèmes",
        ],
        downloads: 876,
        views: 2012,
        rating: 4.6,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== INFORMATIQUE ==========
    prisma.book.create({
      data: {
        title: "Informatique - Algorithmique et Programmation",
        author: "Rachid Benjelloun & Nadia El Fassi",
        school: "Sciences Mathématiques",
        category: "Informatique",
        subject: "Informatique",
        level: "Terminale",
        description:
          "Introduction à l'algorithmique et à la programmation : structures de données, algorithmes de tri et de recherche, programmation Python.",
        coverUrl:
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400",
        fileUrl: "/books/informatique-algorithmique-programmation.pdf",
        fileName: "informatique-algorithmique-programmation.pdf",
        fileSize: "22.8 MB",
        totalPages: 367,
        language: "fr",
        tags: [
          "informatique",
          "algorithmique",
          "programmation",
          "python",
          "structures de données",
        ],
        downloads: 1543,
        views: 3421,
        rating: 4.8,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    // ========== ANNALES ET EXAMENS ==========
    prisma.book.create({
      data: {
        title: "Annales du Baccalauréat - Mathématiques (2015-2024)",
        author: "Collectif d'Enseignants",
        school: "Sciences Mathématiques",
        category: "Mathématiques",
        subject: "Mathématiques",
        level: "Terminale",
        description:
          "Recueil complet des sujets et corrigés du baccalauréat marocain en mathématiques de 2015 à 2024. Toutes les sessions nationales et régionales.",
        coverUrl:
          "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400",
        fileUrl: "/books/annales-bac-maths-2015-2024.pdf",
        fileName: "annales-bac-maths-2015-2024.pdf",
        fileSize: "42.3 MB",
        totalPages: 678,
        language: "fr",
        tags: [
          "annales",
          "examens",
          "bac",
          "corrigés",
          "sujets",
          "mathématiques",
        ],
        downloads: 3456,
        views: 7891,
        rating: 5.0,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),

    prisma.book.create({
      data: {
        title: "Sujets Corrigés - Physique-Chimie (2018-2024)",
        author: "Équipe Pédagogique",
        school: "Sciences Physiques",
        category: "Physique",
        subject: "Physique",
        level: "Terminale",
        description:
          "Collection de sujets d'examens de physique-chimie avec corrections détaillées pour une préparation optimale au baccalauréat.",
        coverUrl:
          "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=400",
        fileUrl: "/books/sujets-corriges-physique-chimie.pdf",
        fileName: "sujets-corriges-physique-chimie.pdf",
        fileSize: "38.9 MB",
        totalPages: 589,
        language: "fr",
        tags: ["sujets", "examens", "corrigés", "physique", "chimie", "bac"],
        downloads: 2789,
        views: 6234,
        rating: 4.9,
        status: BookStatus.ACTIVE,
        isPublic: true,
        uploadedById: uploader.id,
      },
    }),
  ]);

  console.log(`✅ Created ${books.length} books successfully!`);

  // Display summary statistics
  const totalDownloads = books.reduce((sum, book) => sum + book.downloads, 0);
  const totalViews = books.reduce((sum, book) => sum + book.views, 0);
  const averageRating =
    books.reduce((sum, book) => sum + book.rating, 0) / books.length;

  console.log("\n📊 Books Library Statistics:");
  console.log(`   Total Books: ${books.length}`);
  console.log(`   Total Downloads: ${totalDownloads.toLocaleString()}`);
  console.log(`   Total Views: ${totalViews.toLocaleString()}`);
  console.log(`   Average Rating: ${averageRating.toFixed(2)} ⭐`);

  // Display books by category
  const categories = [...new Set(books.map((b) => b.category))];
  console.log(`\n📚 Books by Category:`);
  categories.forEach((cat) => {
    const count = books.filter((b) => b.category === cat).length;
    console.log(`   ${cat}: ${count} book(s)`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding books:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
