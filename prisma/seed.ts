/**
 * Comprehensive Seed Script - Full Demo Data
 * Run with: npx tsx prisma/seed.ts
 *
 * Seeding order (respecting dependencies):
 * 1. IncubatorSettings (no dependencies)
 * 2. Categories, Levels, Matieres (no dependencies)
 * 3. Users (no dependencies)
 * 4. Schools (depends on Users)
 * 5. Books (depends on Users)
 * 6. Videos (depends on Users)
 * 7. Questions (depends on Users)
 * 8. QuizAttempts & QuizAnswers (depends on Users, Questions)
 */

import "dotenv/config";
import { hash } from "bcryptjs";
import {
  PrismaClient,
  BookStatus,
  VideoStatus,
  SchoolStatus,
  SchoolType,
  QuestionDifficulty,
  QuestionStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Constants (duplicated to avoid import issues)
const UserRole = {
  ADMIN: "ADMIN" as const,
  STUDENT: "STUDENT" as const,
};

const UserStatus = {
  ACTIVE: "ACTIVE" as const,
  INACTIVE: "INACTIVE" as const,
};

const PaymentStatus = {
  NOT_SUBMITTED: "NOT_SUBMITTED" as const,
  PENDING: "PENDING" as const,
  APPROVED: "APPROVED" as const,
  REJECTED: "REJECTED" as const,
};

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// HELPER FUNCTIONS
// ============================================================

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

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

// ============================================================
// SEED DATA
// ============================================================

// Categories
const categoriesData = [
  {
    name: "Mathématiques",
    description: "Cours et exercices de mathématiques",
    order: 1,
  },
  { name: "Physique", description: "Cours et exercices de physique", order: 2 },
  { name: "Chimie", description: "Cours et exercices de chimie", order: 3 },
  { name: "SVT", description: "Sciences de la Vie et de la Terre", order: 4 },
  { name: "Philosophie", description: "Cours de philosophie", order: 5 },
  {
    name: "Français",
    description: "Langue et littérature française",
    order: 6,
  },
  { name: "Anglais", description: "Langue anglaise", order: 7 },
  {
    name: "Économie",
    description: "Sciences économiques et gestion",
    order: 8,
  },
  {
    name: "Histoire-Géographie",
    description: "Histoire et géographie",
    order: 9,
  },
  { name: "Informatique", description: "Sciences informatiques", order: 10 },
];

// Levels
const levelsData = [
  { name: "Terminale", description: "Niveau baccalauréat", order: 1 },
  { name: "Première", description: "Première année du lycée", order: 2 },
  { name: "Seconde", description: "Seconde année du lycée", order: 3 },
  { name: "Bac+1", description: "Première année post-bac", order: 4 },
  {
    name: "Bac+2",
    description: "Deuxième année post-bac (CPGE, DUT)",
    order: 5,
  },
];

// Matieres (Subjects)
const matieresData = [
  { name: "Analyse", description: "Analyse mathématique", order: 1 },
  { name: "Algèbre", description: "Algèbre linéaire et bilinéaire", order: 2 },
  {
    name: "Géométrie",
    description: "Géométrie plane et dans l'espace",
    order: 3,
  },
  {
    name: "Mécanique",
    description: "Mécanique du point et du solide",
    order: 4,
  },
  {
    name: "Électricité",
    description: "Électricité et électromagnétisme",
    order: 5,
  },
  {
    name: "Optique",
    description: "Optique géométrique et ondulatoire",
    order: 6,
  },
  {
    name: "Chimie Organique",
    description: "Chimie des composés organiques",
    order: 7,
  },
  {
    name: "Chimie Générale",
    description: "Chimie générale et minérale",
    order: 8,
  },
  {
    name: "Génétique",
    description: "Génétique et biologie moléculaire",
    order: 9,
  },
  { name: "Écologie", description: "Écologie et environnement", order: 10 },
  {
    name: "Probabilités",
    description: "Probabilités et statistiques",
    order: 11,
  },
  {
    name: "Thermodynamique",
    description: "Thermodynamique et transferts thermiques",
    order: 12,
  },
];

// Users
const usersData = [
  {
    email: "admin@2baconcours.com",
    password: "Admin123!",
    name: "Administrateur",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.APPROVED,
  },
  {
    email: "prof.alami@2baconcours.com",
    password: "Prof123!",
    name: "Mohammed Alami",
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.APPROVED,
  },
  {
    email: "student@example.com",
    password: "Student123!",
    name: "Ahmed Benali",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.APPROVED,
  },
  {
    email: "fatima.zahrae@example.com",
    password: "Student123!",
    name: "Fatima Zahra El Idrissi",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.APPROVED,
  },
  {
    email: "youssef.k@example.com",
    password: "Student123!",
    name: "Youssef Karimi",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.APPROVED,
  },
  {
    email: "sara.m@example.com",
    password: "Student123!",
    name: "Sara Mansouri",
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    paymentStatus: PaymentStatus.PENDING,
  },
  {
    email: "omar.t@example.com",
    password: "Student123!",
    name: "Omar Tazi",
    role: UserRole.STUDENT,
    status: UserStatus.INACTIVE,
    paymentStatus: PaymentStatus.NOT_SUBMITTED,
  },
];

// Schools
const schoolsData = [
  {
    name: "École Nationale Supérieure d'Informatique et d'Analyse des Systèmes",
    shortName: "ENSIAS",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'ENSIAS est une grande école d'ingénieurs marocaine spécialisée dans l'informatique et l'analyse des systèmes, rattachée à l'Université Mohammed V de Rabat.",
    longDescription: `L'École Nationale Supérieure d'Informatique et d'Analyse des Systèmes (ENSIAS) est l'une des écoles d'ingénieurs les plus prestigieuses du Maroc dans le domaine de l'informatique et des technologies de l'information.

Fondée en 1992, l'ENSIAS forme des ingénieurs hautement qualifiés dans les domaines de l'informatique, des systèmes d'information, de la cybersécurité, de l'intelligence artificielle et du big data.

L'école offre un environnement d'apprentissage moderne avec des laboratoires équipés des dernières technologies, des partenariats avec des entreprises de renommée internationale et un réseau d'anciens élèves très actif.`,
    city: "Rabat",
    address: "Avenue Mohammed Ben Abdellah Regragui, Madinat Al Irfane",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 30 72",
    email: "contact@ensias.ma",
    website: "https://www.ensias.um5.ac.ma",
    seuilDeSelection: 16.5,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes du baccalauréat",
      "Copie de la CIN",
      "Photos d'identité",
      "Attestation de préinscription CNC",
    ],
    datesConcours: "Juin - Juillet",
    fraisInscription: 1500,
    bourses: true,
    nombreEtudiants: 1200,
    tauxReussite: 92,
    classementNational: 1,
    programs: [
      {
        id: "ing-info",
        name: "Ingénierie Informatique",
        description: "Formation d'ingénieurs en informatique générale",
        duration: "3 ans",
      },
      {
        id: "ing-si",
        name: "Ingénierie des Systèmes d'Information",
        description:
          "Spécialisation en systèmes d'information et gouvernance IT",
        duration: "3 ans",
      },
      {
        id: "ing-ia",
        name: "Intelligence Artificielle et Data Science",
        description: "Formation en IA, machine learning et big data",
        duration: "3 ans",
      },
    ],
    specializations: [
      "Intelligence Artificielle",
      "Cybersécurité",
      "Big Data",
      "Cloud Computing",
      "Développement Mobile",
      "IoT",
    ],
    avantages: [
      "Formation d'excellence reconnue internationalement",
      "Partenariats avec des entreprises leaders du secteur IT",
      "Laboratoires de recherche de pointe",
      "Réseau d'alumni actif et influent",
    ],
    services: [
      "Bibliothèque numérique",
      "Centre de carrière",
      "Incubateur de startups",
      "Club d'entrepreneuriat",
      "Résidence universitaire",
    ],
    infrastructures: [
      "Laboratoires informatiques",
      "Amphithéâtres équipés",
      "Salles de TD modernes",
      "Espace de coworking",
      "Cafétéria",
    ],
    partenariats: ["Microsoft", "IBM", "Orange", "Capgemini", "Atos", "CGI"],
    establishedYear: 1992,
    featured: true,
  },
  {
    name: "École Mohammadia d'Ingénieurs",
    shortName: "EMI",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'EMI est la doyenne des écoles d'ingénieurs au Maroc, formant des ingénieurs polyvalents depuis 1959.",
    longDescription: `L'École Mohammadia d'Ingénieurs (EMI) est la plus ancienne école d'ingénieurs du Maroc, fondée en 1959. Elle est rattachée à l'Université Mohammed V de Rabat.

L'EMI offre une formation pluridisciplinaire de haut niveau dans les domaines du génie civil, génie électrique, génie mécanique, génie informatique et génie industriel.

Reconnue pour l'excellence de sa formation et la qualité de ses diplômés, l'EMI jouit d'une réputation nationale et internationale.`,
    city: "Rabat",
    address: "Avenue Ibn Sina, Agdal",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 68 71 50",
    email: "contact@emi.ac.ma",
    website: "https://www.emi.ac.ma",
    seuilDeSelection: 17.0,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes des deux années de prépa",
      "Attestation de réussite aux concours",
      "Copie de la CIN",
    ],
    datesConcours: "Juin - Juillet",
    fraisInscription: 1200,
    bourses: true,
    nombreEtudiants: 2500,
    tauxReussite: 95,
    classementNational: 2,
    programs: [
      {
        id: "gc",
        name: "Génie Civil",
        description: "Formation en construction et infrastructure",
        duration: "3 ans",
      },
      {
        id: "ge",
        name: "Génie Électrique",
        description: "Spécialisation en systèmes électriques et électroniques",
        duration: "3 ans",
      },
      {
        id: "gi",
        name: "Génie Informatique",
        description: "Formation en informatique et systèmes",
        duration: "3 ans",
      },
      {
        id: "gm",
        name: "Génie Mécanique",
        description: "Formation en mécanique et conception",
        duration: "3 ans",
      },
    ],
    specializations: [
      "Génie Civil",
      "Génie Électrique",
      "Génie Mécanique",
      "Génie Informatique",
      "Génie Industriel",
    ],
    avantages: [
      "Doyenne des écoles d'ingénieurs marocaines",
      "Formation polyvalente et complète",
      "Réseau d'anciens très influent",
    ],
    services: [
      "Bibliothèque",
      "Centre sportif",
      "Résidence universitaire",
      "Restaurant universitaire",
    ],
    infrastructures: [
      "Laboratoires de génie civil",
      "Ateliers mécaniques",
      "Salles informatiques",
      "Amphithéâtres",
    ],
    partenariats: [
      "Polytechnique Paris",
      "INSA Lyon",
      "Mines ParisTech",
      "OCP",
      "ONCF",
    ],
    establishedYear: 1959,
    featured: true,
  },
  {
    name: "Institut National des Postes et Télécommunications",
    shortName: "INPT",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'INPT forme des ingénieurs spécialisés dans les télécommunications, les réseaux et les technologies de l'information.",
    longDescription: `L'Institut National des Postes et Télécommunications (INPT) est un établissement d'enseignement supérieur public créé en 1961.

L'INPT forme des ingénieurs de haut niveau dans les domaines des télécommunications, des réseaux, de l'informatique et des TIC.

Les diplômés de l'INPT sont très prisés par les opérateurs télécoms et les entreprises du secteur IT.`,
    city: "Rabat",
    address: "Avenue Allal Al Fassi, Madinat Al Irfane",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 30 79",
    email: "contact@inpt.ac.ma",
    website: "https://www.inpt.ac.ma",
    seuilDeSelection: 16.0,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes",
      "Attestation de préinscription",
      "Copie de la CIN",
    ],
    datesConcours: "Juin - Juillet",
    fraisInscription: 2000,
    bourses: true,
    nombreEtudiants: 800,
    tauxReussite: 90,
    classementNational: 3,
    programs: [
      {
        id: "ing-telecom",
        name: "Ingénierie Télécommunications",
        description: "Formation en télécommunications et réseaux",
        duration: "3 ans",
      },
      {
        id: "ing-cloud",
        name: "Cloud Computing et Sécurité",
        description: "Spécialisation cloud et cybersécurité",
        duration: "3 ans",
      },
    ],
    specializations: [
      "Télécommunications",
      "Réseaux",
      "Cloud Computing",
      "Cybersécurité",
      "5G et IoT",
    ],
    avantages: [
      "Formation spécialisée en télécoms",
      "Équipements de pointe",
      "Partenariats avec les opérateurs télécoms",
    ],
    services: [
      "Bibliothèque spécialisée",
      "Laboratoires télécoms",
      "Club networking",
    ],
    infrastructures: [
      "Laboratoires télécoms",
      "Data center",
      "Salles de TP réseau",
    ],
    partenariats: ["Maroc Telecom", "Orange", "Inwi", "Huawei", "Ericsson"],
    establishedYear: 1961,
    featured: true,
  },
  {
    name: "École Nationale Supérieure des Arts et Métiers",
    shortName: "ENSAM",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'ENSAM forme des ingénieurs en génie mécanique et génie industriel avec une forte composante pratique.",
    longDescription: `L'École Nationale Supérieure des Arts et Métiers (ENSAM) de Meknès est une école d'ingénieurs spécialisée dans le génie mécanique et industriel.

Fondée en 1997, l'ENSAM offre une formation alliant théorie et pratique avec des ateliers équipés de machines-outils modernes.`,
    city: "Meknès",
    address: "Marjane II, Route de Zigoura",
    region: "Fès-Meknès",
    phone: "+212 535 46 71 63",
    email: "contact@ensam-umi.ac.ma",
    website: "https://www.ensam-umi.ac.ma",
    seuilDeSelection: 15.5,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes",
      "Copie de la CIN",
    ],
    datesConcours: "Juillet",
    fraisInscription: 1000,
    bourses: true,
    nombreEtudiants: 600,
    tauxReussite: 88,
    classementNational: 5,
    programs: [
      {
        id: "gm-ensam",
        name: "Génie Mécanique",
        description: "Conception et fabrication mécanique",
        duration: "3 ans",
      },
      {
        id: "gi-ensam",
        name: "Génie Industriel",
        description: "Organisation et gestion de production",
        duration: "3 ans",
      },
    ],
    specializations: [
      "Conception Mécanique",
      "Fabrication",
      "Automatisation",
      "Gestion de Production",
    ],
    avantages: [
      "Formation pratique intensive",
      "Ateliers équipés",
      "Partenariats industriels",
    ],
    services: ["Bibliothèque", "Ateliers", "Club robotique"],
    infrastructures: [
      "Ateliers de fabrication",
      "Laboratoires CAO",
      "Salles de TP",
    ],
    partenariats: ["Renault", "PSA", "Safran"],
    establishedYear: 1997,
    featured: false,
  },
  {
    name: "École Nationale de Commerce et de Gestion",
    shortName: "ENCG",
    type: SchoolType.ECOLE_COMMERCE,
    description:
      "L'ENCG forme des cadres supérieurs en commerce, gestion et management avec un fort ancrage pratique.",
    longDescription: `L'École Nationale de Commerce et de Gestion (ENCG) est un réseau d'écoles de commerce publiques au Maroc offrant des formations de niveau bac+5.

Les ENCG forment des managers et cadres dans les domaines du commerce, marketing, finance, audit et ressources humaines.`,
    city: "Casablanca",
    address: "Km 8, Route d'El Jadida",
    region: "Casablanca-Settat",
    phone: "+212 522 23 08 70",
    email: "contact@encg-casa.ma",
    website: "https://www.encg-casa.ma",
    seuilDeSelection: 14.5,
    documentsRequis: [
      "Baccalauréat",
      "Relevés de notes",
      "Lettre de motivation",
      "CV",
    ],
    datesConcours: "Septembre",
    fraisInscription: 800,
    bourses: true,
    nombreEtudiants: 2000,
    tauxReussite: 85,
    classementNational: 8,
    programs: [
      {
        id: "gc-encg",
        name: "Gestion Commerciale",
        description: "Marketing et vente",
        duration: "5 ans",
      },
      {
        id: "fc",
        name: "Finance-Comptabilité",
        description: "Finance d'entreprise et comptabilité",
        duration: "5 ans",
      },
      {
        id: "audit",
        name: "Audit et Contrôle de Gestion",
        description: "Audit interne et contrôle",
        duration: "5 ans",
      },
    ],
    specializations: [
      "Marketing",
      "Finance",
      "Audit",
      "Ressources Humaines",
      "Commerce International",
    ],
    avantages: [
      "Formation publique gratuite",
      "Large réseau d'alumni",
      "Stages obligatoires",
    ],
    services: ["Centre de carrière", "Bibliothèque", "Club entreprise"],
    infrastructures: ["Amphithéâtres", "Salles de TD", "Salle informatique"],
    partenariats: ["Banques marocaines", "Multinationales", "Big 4"],
    establishedYear: 1988,
    featured: false,
  },
  {
    name: "Faculté des Sciences Rabat",
    shortName: "FSR",
    type: SchoolType.FACULTE,
    description:
      "La Faculté des Sciences de Rabat offre des formations en sciences fondamentales et appliquées.",
    longDescription: `La Faculté des Sciences de Rabat (FSR), rattachée à l'Université Mohammed V, est l'une des plus grandes facultés de sciences au Maroc.

Elle offre des formations en mathématiques, physique, chimie, biologie, géologie et informatique de la licence au doctorat.`,
    city: "Rabat",
    address: "Avenue Ibn Battouta, Agdal",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 18 34",
    email: "contact@fsr.ac.ma",
    website: "https://www.fsr.ac.ma",
    seuilDeSelection: 12.0,
    documentsRequis: ["Baccalauréat scientifique", "Relevés de notes"],
    datesConcours: "Inscription ouverte",
    fraisInscription: 300,
    bourses: true,
    nombreEtudiants: 15000,
    tauxReussite: 65,
    classementNational: 10,
    programs: [
      {
        id: "lf-maths",
        name: "Licence Mathématiques",
        description: "Mathématiques fondamentales",
        duration: "3 ans",
      },
      {
        id: "lf-physique",
        name: "Licence Physique",
        description: "Physique générale",
        duration: "3 ans",
      },
      {
        id: "lf-info",
        name: "Licence Informatique",
        description: "Sciences informatiques",
        duration: "3 ans",
      },
    ],
    specializations: [
      "Mathématiques",
      "Physique",
      "Chimie",
      "Biologie",
      "Informatique",
      "Géologie",
    ],
    avantages: [
      "Accès ouvert",
      "Formations diversifiées",
      "Recherche scientifique",
    ],
    services: ["Bibliothèque universitaire", "Laboratoires de recherche"],
    infrastructures: ["Amphithéâtres", "Laboratoires de TP", "Salles de cours"],
    partenariats: ["Universités françaises", "CNRS", "IRD"],
    establishedYear: 1957,
    featured: false,
  },
];

// Books
const booksData = [
  {
    title: "Mathématiques - Analyse et Algèbre",
    author: "Mohammed Alami",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subjects: ["Mathématiques"],
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
    subjects: ["Physique"],
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
    subjects: ["Chimie"],
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
    subjects: ["SVT"],
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
    subjects: ["Philosophie"],
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
    subjects: ["Français"],
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
    subjects: ["Économie"],
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
    subjects: ["Anglais"],
    description:
      "Cours d'anglais avancé pour les élèves de terminale. Grammaire, vocabulaire et compréhension.",
    fileUrl: "https://drive.google.com/file/d/example8/view",
    fileName: "anglais-advanced.pdf",
    fileSize: "11.2 MB",
    totalPages: 156,
    tags: ["anglais", "grammaire", "vocabulaire", "bac"],
  },
  {
    title: "Mathématiques CPGE - Algèbre",
    author: "Hassan Lahlou",
    school: "CPGE",
    category: "Mathématiques",
    level: "Bac+2",
    subjects: ["Mathématiques"],
    description:
      "Cours d'algèbre pour les classes préparatoires. Espaces vectoriels, matrices et applications linéaires.",
    fileUrl: "https://drive.google.com/file/d/example9/view",
    fileName: "maths-cpge-algebre.pdf",
    fileSize: "28.6 MB",
    totalPages: 380,
    tags: ["cpge", "algèbre", "matrices", "prépa"],
  },
  {
    title: "Physique CPGE - Électromagnétisme",
    author: "Nadia Berrada",
    school: "CPGE",
    category: "Physique",
    level: "Bac+2",
    subjects: ["Physique"],
    description:
      "Cours complet d'électromagnétisme pour les classes préparatoires. Champs, ondes et applications.",
    fileUrl: "https://drive.google.com/file/d/example10/view",
    fileName: "physique-cpge-em.pdf",
    fileSize: "22.1 MB",
    totalPages: 295,
    tags: ["cpge", "électromagnétisme", "physique", "prépa"],
  },
];

// Videos
const videosData = [
  {
    title: "Cours Complet - Limites et Continuité",
    description:
      "Cours complet sur les limites et la continuité des fonctions. Définitions, théorèmes et exemples pratiques.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subjects: ["Mathématiques"],
    duration: 2400,
    year: 2024,
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
    subjects: ["Mathématiques"],
    duration: 1800,
    year: 2024,
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
    subjects: ["Mathématiques"],
    duration: 3600,
    year: 2023,
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
    subjects: ["Physique"],
    duration: 2700,
    year: 2024,
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
    subjects: ["Physique"],
    duration: 2100,
    year: 2023,
    tags: ["électromagnétisme", "champs", "physique", "cours"],
  },
  {
    title: "Réactions Chimiques - Équilibrage",
    description:
      "Apprenez à équilibrer les réactions chimiques et à effectuer des calculs stœchiométriques.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Physiques",
    category: "Chimie",
    level: "Terminale",
    subjects: ["Chimie"],
    duration: 1500,
    year: 2024,
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
    subjects: ["SVT"],
    duration: 2400,
    year: 2023,
    tags: ["génétique", "ADN", "hérédité", "svt"],
  },
  {
    title: "Dissertation de Philosophie - Méthodologie",
    description:
      "Méthodologie complète de la dissertation de philosophie. Introduction, développement et conclusion.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Toutes Filières",
    category: "Philosophie",
    level: "Terminale",
    subjects: ["Philosophie"],
    duration: 1800,
    year: 2024,
    tags: ["philosophie", "dissertation", "méthodologie", "bac"],
  },
  {
    title: "Probabilités - Lois Continues",
    description:
      "Cours sur les lois de probabilité continues. Loi normale, loi exponentielle et applications.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "Sciences Mathématiques",
    category: "Mathématiques",
    level: "Terminale",
    subjects: ["Mathématiques"],
    duration: 2200,
    year: 2023,
    tags: ["probabilités", "loi normale", "statistiques"],
  },
  {
    title: "Algèbre Linéaire - Espaces Vectoriels",
    description:
      "Introduction aux espaces vectoriels. Bases, dimensions et applications linéaires.",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    school: "CPGE",
    category: "Mathématiques",
    level: "Bac+2",
    subjects: ["Mathématiques"],
    duration: 5000,
    year: 2024,
    tags: ["algèbre", "espaces vectoriels", "cpge"],
  },
];

// QCM Questions
const questionsData = [
  // Mathématiques
  {
    text: "Quelle est la dérivée de la fonction f(x) = x³ + 2x² - 5x + 3 ?",
    options: [
      { id: "a", text: "f'(x) = 3x² + 4x - 5" },
      { id: "b", text: "f'(x) = 3x² + 2x - 5" },
      { id: "c", text: "f'(x) = x² + 4x - 5" },
      { id: "d", text: "f'(x) = 3x² + 4x + 5" },
    ],
    correctIds: ["a"],
    explanation:
      "La dérivée de xⁿ est nxⁿ⁻¹. Donc: (x³)' = 3x², (2x²)' = 4x, (-5x)' = -5, (3)' = 0",
    school: "Sciences Mathématiques",
    matiere: "Analyse",
    chapter: "Dérivation",
    difficulty: QuestionDifficulty.EASY,
    tags: ["dérivées", "polynômes"],
    points: 1,
  },
  {
    text: "Calculer la limite de (x² - 1)/(x - 1) quand x tend vers 1.",
    options: [
      { id: "a", text: "0" },
      { id: "b", text: "1" },
      { id: "c", text: "2" },
      { id: "d", text: "La limite n'existe pas" },
    ],
    correctIds: ["c"],
    explanation:
      "(x² - 1)/(x - 1) = (x-1)(x+1)/(x-1) = x + 1. Quand x → 1, x + 1 → 2",
    school: "Sciences Mathématiques",
    matiere: "Analyse",
    chapter: "Limites",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["limites", "formes indéterminées"],
    points: 2,
  },
  {
    text: "Soit A une matrice 2×2 telle que A² = A. Que peut-on dire de A ?",
    options: [
      { id: "a", text: "A est inversible" },
      { id: "b", text: "A est idempotente" },
      { id: "c", text: "A est nilpotente" },
      { id: "d", text: "A est orthogonale" },
    ],
    correctIds: ["b"],
    explanation:
      "Une matrice A vérifiant A² = A est appelée matrice idempotente ou projecteur.",
    school: "Sciences Mathématiques",
    matiere: "Algèbre",
    chapter: "Matrices",
    difficulty: QuestionDifficulty.HARD,
    tags: ["matrices", "algèbre linéaire"],
    points: 3,
  },
  {
    text: "Quelle est la primitive de f(x) = cos(x) ?",
    options: [
      { id: "a", text: "F(x) = sin(x) + C" },
      { id: "b", text: "F(x) = -sin(x) + C" },
      { id: "c", text: "F(x) = cos(x) + C" },
      { id: "d", text: "F(x) = -cos(x) + C" },
    ],
    correctIds: ["a"],
    explanation:
      "La dérivée de sin(x) est cos(x), donc la primitive de cos(x) est sin(x) + C.",
    school: "Sciences Mathématiques",
    matiere: "Analyse",
    chapter: "Intégration",
    difficulty: QuestionDifficulty.EASY,
    tags: ["primitives", "trigonométrie"],
    points: 1,
  },
  // Physique
  {
    text: "Un objet de masse m = 2 kg est soumis à une force F = 10 N. Quelle est son accélération ?",
    options: [
      { id: "a", text: "a = 2 m/s²" },
      { id: "b", text: "a = 5 m/s²" },
      { id: "c", text: "a = 10 m/s²" },
      { id: "d", text: "a = 20 m/s²" },
    ],
    correctIds: ["b"],
    explanation:
      "D'après la deuxième loi de Newton: F = ma, donc a = F/m = 10/2 = 5 m/s²",
    school: "Sciences Physiques",
    matiere: "Mécanique",
    chapter: "Dynamique",
    difficulty: QuestionDifficulty.EASY,
    tags: ["newton", "forces"],
    points: 1,
  },
  {
    text: "Quelle est l'énergie cinétique d'un objet de masse 4 kg se déplaçant à 3 m/s ?",
    options: [
      { id: "a", text: "Ec = 6 J" },
      { id: "b", text: "Ec = 12 J" },
      { id: "c", text: "Ec = 18 J" },
      { id: "d", text: "Ec = 36 J" },
    ],
    correctIds: ["c"],
    explanation: "Ec = ½mv² = ½ × 4 × 3² = ½ × 4 × 9 = 18 J",
    school: "Sciences Physiques",
    matiere: "Mécanique",
    chapter: "Énergie",
    difficulty: QuestionDifficulty.EASY,
    tags: ["énergie", "cinétique"],
    points: 1,
  },
  {
    text: "Un condensateur de capacité C = 10 μF est chargé sous une tension U = 100 V. Quelle est l'énergie stockée ?",
    options: [
      { id: "a", text: "E = 0.05 J" },
      { id: "b", text: "E = 0.5 J" },
      { id: "c", text: "E = 5 J" },
      { id: "d", text: "E = 50 J" },
    ],
    correctIds: ["a"],
    explanation: "E = ½CU² = ½ × 10×10⁻⁶ × 100² = ½ × 10⁻⁵ × 10⁴ = 0.05 J",
    school: "Sciences Physiques",
    matiere: "Électricité",
    chapter: "Condensateurs",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["condensateur", "énergie"],
    points: 2,
  },
  // Chimie
  {
    text: "Quel est le nombre d'oxydation du soufre dans H₂SO₄ ?",
    options: [
      { id: "a", text: "+2" },
      { id: "b", text: "+4" },
      { id: "c", text: "+6" },
      { id: "d", text: "-2" },
    ],
    correctIds: ["c"],
    explanation:
      "Dans H₂SO₄: H = +1 (×2 = +2), O = -2 (×4 = -8). Pour neutralité: 2 + S - 8 = 0, donc S = +6",
    school: "Sciences Physiques",
    matiere: "Chimie Générale",
    chapter: "Oxydoréduction",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["oxydation", "chimie"],
    points: 2,
  },
  {
    text: "Quelle est la formule semi-développée du propan-2-ol ?",
    options: [
      { id: "a", text: "CH₃-CH₂-CH₂-OH" },
      { id: "b", text: "CH₃-CHOH-CH₃" },
      { id: "c", text: "CH₃-CO-CH₃" },
      { id: "d", text: "CH₃-CH₂-CHO" },
    ],
    correctIds: ["b"],
    explanation:
      "Le propan-2-ol est un alcool secondaire avec le groupe OH sur le carbone 2.",
    school: "Sciences Physiques",
    matiere: "Chimie Organique",
    chapter: "Alcools",
    difficulty: QuestionDifficulty.EASY,
    tags: ["alcools", "nomenclature"],
    points: 1,
  },
  // SVT
  {
    text: "Quelle est la phase de la mitose où les chromosomes s'alignent sur le plan équatorial ?",
    options: [
      { id: "a", text: "Prophase" },
      { id: "b", text: "Métaphase" },
      { id: "c", text: "Anaphase" },
      { id: "d", text: "Télophase" },
    ],
    correctIds: ["b"],
    explanation:
      "En métaphase, les chromosomes s'alignent sur le plan équatorial (plaque métaphasique).",
    school: "Sciences de la Vie et de la Terre",
    matiere: "Génétique",
    chapter: "Division cellulaire",
    difficulty: QuestionDifficulty.EASY,
    tags: ["mitose", "cellule"],
    points: 1,
  },
  {
    text: "Chez l'homme, combien de paires de chromosomes possède une cellule somatique ?",
    options: [
      { id: "a", text: "22 paires" },
      { id: "b", text: "23 paires" },
      { id: "c", text: "46 paires" },
      { id: "d", text: "44 paires" },
    ],
    correctIds: ["b"],
    explanation:
      "Les cellules somatiques humaines contiennent 23 paires de chromosomes (2n = 46).",
    school: "Sciences de la Vie et de la Terre",
    matiere: "Génétique",
    chapter: "Chromosomes",
    difficulty: QuestionDifficulty.EASY,
    tags: ["chromosomes", "génétique"],
    points: 1,
  },
  {
    text: "Quel est le rôle principal de l'ADN polymérase ?",
    options: [
      { id: "a", text: "Transcrire l'ADN en ARN" },
      { id: "b", text: "Traduire l'ARN en protéines" },
      { id: "c", text: "Répliquer l'ADN" },
      { id: "d", text: "Dégrader l'ADN endommagé" },
    ],
    correctIds: ["c"],
    explanation:
      "L'ADN polymérase est l'enzyme responsable de la réplication de l'ADN.",
    school: "Sciences de la Vie et de la Terre",
    matiere: "Génétique",
    chapter: "Réplication",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["ADN", "enzymes"],
    points: 2,
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================

async function main() {
  console.log("🌱 Starting comprehensive database seeding...\n");
  console.log("=".repeat(60));

  // ============================================================
  // 1. SETTINGS
  // ============================================================
  console.log("\n📋 1. Creating default settings...");
  await prisma.incubatorSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      incubatorName: "2BAConcours",
    },
  });
  console.log("   ✓ Settings created");

  // ============================================================
  // 2. CATEGORIES, LEVELS, MATIERES
  // ============================================================
  console.log("\n📂 2. Creating categories, levels, and matieres...");

  // Clear existing
  await prisma.category.deleteMany();
  await prisma.level.deleteMany();
  await prisma.matiere.deleteMany();

  // Categories
  for (const cat of categoriesData) {
    await prisma.category.create({ data: { ...cat, isActive: true } });
  }
  console.log(`   ✓ ${categoriesData.length} categories created`);

  // Levels
  for (const level of levelsData) {
    await prisma.level.create({ data: { ...level, isActive: true } });
  }
  console.log(`   ✓ ${levelsData.length} levels created`);

  // Matieres
  for (const matiere of matieresData) {
    await prisma.matiere.create({ data: { ...matiere, isActive: true } });
  }
  console.log(`   ✓ ${matieresData.length} matieres created`);

  // ============================================================
  // 3. USERS
  // ============================================================
  console.log("\n👥 3. Creating users...");

  // Clear existing users (and cascaded data)
  await prisma.quizAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.question.deleteMany();
  await prisma.book.deleteMany();
  await prisma.video.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers: Record<string, string> = {};

  for (const userData of usersData) {
    const hashedPassword = await hash(userData.password, 12);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        emailVerified:
          userData.status === UserStatus.ACTIVE ? new Date() : null,
        paymentStatus: userData.paymentStatus,
        paymentSubmittedAt:
          userData.paymentStatus !== PaymentStatus.NOT_SUBMITTED
            ? new Date()
            : null,
        paymentReviewedAt:
          userData.paymentStatus === PaymentStatus.APPROVED ? new Date() : null,
      },
    });
    createdUsers[userData.email] = user.id;
    console.log(`   ✓ ${user.name} (${user.role})`);
  }

  const adminId = createdUsers["admin@2baconcours.com"];

  // ============================================================
  // 4. SCHOOLS
  // ============================================================
  console.log("\n🏫 4. Creating schools...");

  for (const schoolData of schoolsData) {
    await prisma.school.create({
      data: {
        ...schoolData,
        programs: schoolData.programs,
        uploadedById: adminId,
        status: SchoolStatus.ACTIVE,
        isPublic: true,
        views: randomInt(500, 5000),
      },
    });
    console.log(`   ✓ ${schoolData.shortName || schoolData.name}`);
  }

  // ============================================================
  // 5. BOOKS
  // ============================================================
  console.log("\n📚 5. Creating books...");

  for (const bookData of booksData) {
    await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        school: bookData.school,
        category: bookData.category,
        level: bookData.level,
        subjects: bookData.subjects,
        description: bookData.description,
        fileUrl: bookData.fileUrl,
        fileName: bookData.fileName,
        fileSize: bookData.fileSize,
        totalPages: bookData.totalPages,
        tags: bookData.tags,
        uploadedById: adminId,
        status: BookStatus.ACTIVE,
        isPublic: true,
        language: "fr",
        views: randomInt(50, 500),
        downloads: randomInt(20, 200),
      },
    });
    console.log(`   ✓ ${bookData.title}`);
  }

  // ============================================================
  // 6. VIDEOS
  // ============================================================
  console.log("\n🎬 6. Creating videos...");

  for (const videoData of videosData) {
    const youtubeId = extractYouTubeId(videoData.url);
    await prisma.video.create({
      data: {
        title: videoData.title,
        description: videoData.description,
        url: videoData.url,
        school: videoData.school,
        category: videoData.category,
        level: videoData.level,
        subjects: videoData.subjects,
        duration: videoData.duration,
        year: videoData.year ?? new Date().getFullYear(),
        tags: videoData.tags,
        youtubeId,
        uploadedById: adminId,
        status: VideoStatus.ACTIVE,
        isPublic: true,
        views: randomInt(100, 1000),
      },
    });
    console.log(`   ✓ ${videoData.title}`);
  }

  // ============================================================
  // 7. QCM QUESTIONS
  // ============================================================
  console.log("\n❓ 7. Creating QCM questions...");

  const createdQuestions: string[] = [];

  for (const questionData of questionsData) {
    const question = await prisma.question.create({
      data: {
        text: questionData.text,
        options: questionData.options,
        correctIds: questionData.correctIds,
        explanation: questionData.explanation,
        school: questionData.school,
        matiere: questionData.matiere,
        chapter: questionData.chapter,
        difficulty: questionData.difficulty,
        tags: questionData.tags,
        points: questionData.points,
        status: QuestionStatus.ACTIVE,
        isPublic: true,
        uploadedById: adminId,
        timesAnswered: randomInt(10, 100),
        timesCorrect: randomInt(5, 50),
      },
    });
    createdQuestions.push(question.id);
    console.log(`   ✓ ${questionData.text.substring(0, 50)}...`);
  }

  // ============================================================
  // 8. QUIZ ATTEMPTS (Sample data for students)
  // ============================================================
  console.log("\n📝 8. Creating sample quiz attempts...");

  const studentId = createdUsers["student@example.com"];
  const mathQuestions = createdQuestions.slice(0, 4); // First 4 are math questions

  // Create a completed quiz attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: studentId,
      school: "Sciences Mathématiques",
      matiere: "Analyse",
      totalQuestions: 4,
      score: 3,
      totalPoints: 5,
      maxPoints: 7,
      percentage: 71.4,
      timeSpent: 480, // 8 minutes
      completedAt: new Date(),
    },
  });

  // Create answers for the attempt
  const answerResults = [true, true, false, true];
  for (let i = 0; i < mathQuestions.length; i++) {
    await prisma.quizAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: mathQuestions[i],
        selectedIds: answerResults[i] ? ["a"] : ["b"], // Simplified
        isCorrect: answerResults[i],
        pointsEarned: answerResults[i] ? (i === 2 ? 3 : i === 1 ? 2 : 1) : 0,
        timeSpent: randomInt(60, 180),
      },
    });
  }
  console.log("   ✓ Sample quiz attempt created for student");

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 SEED SUMMARY:");
  console.log("─".repeat(40));

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    levels: await prisma.level.count(),
    matieres: await prisma.matiere.count(),
    schools: await prisma.school.count(),
    books: await prisma.book.count(),
    videos: await prisma.video.count(),
    questions: await prisma.question.count(),
    quizAttempts: await prisma.quizAttempt.count(),
  };

  console.log(`   Users:        ${counts.users}`);
  console.log(`   Categories:   ${counts.categories}`);
  console.log(`   Levels:       ${counts.levels}`);
  console.log(`   Matieres:     ${counts.matieres}`);
  console.log(`   Schools:      ${counts.schools}`);
  console.log(`   Books:        ${counts.books}`);
  console.log(`   Videos:       ${counts.videos}`);
  console.log(`   Questions:    ${counts.questions}`);
  console.log(`   Quiz Attempts: ${counts.quizAttempts}`);

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 Seeding completed successfully!\n");
  console.log("📝 TEST ACCOUNTS:");
  console.log("─".repeat(40));
  console.log("   Admin:   admin@2baconcours.com / Admin123!");
  console.log("   Student: student@example.com / Student123!");
  console.log("");
}

main()
  .catch((e) => {
    console.error("\n❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
