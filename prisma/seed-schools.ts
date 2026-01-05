/**
 * Seed script for Schools
 * Run with: npx tsx prisma/seed-schools.ts
 *
 * This script seeds Moroccan educational institutions (universities, engineering schools, etc.)
 * It requires at least one admin user to exist.
 */
import "dotenv/config";
import { PrismaClient, SchoolStatus, SchoolType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// School seed data - Moroccan universities and schools
const schoolsData = [
  {
    name: "École Nationale Supérieure d'Informatique et d'Analyse des Systèmes",
    shortName: "ENSIAS",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'ENSIAS est une grande école d'ingénieurs marocaine spécialisée dans l'informatique et l'analyse des systèmes, rattachée à l'Université Mohammed V de Rabat.",
    longDescription: `L'École Nationale Supérieure d'Informatique et d'Analyse des Systèmes (ENSIAS) est l'une des écoles d'ingénieurs les plus prestigieuses du Maroc dans le domaine de l'informatique et des technologies de l'information.

Fondée en 1992, l'ENSIAS forme des ingénieurs hautement qualifiés dans les domaines de l'informatique, des systèmes d'information, de la cybersécurité, de l'intelligence artificielle et du big data.

L'école offre un environnement d'apprentissage moderne avec des laboratoires équipés des dernières technologies, des partenariats avec des entreprises de renommée internationale et un réseau d'anciens élèves très actif.

Les diplômés de l'ENSIAS sont très recherchés sur le marché du travail national et international, avec un taux d'insertion professionnelle supérieur à 95%.`,
    city: "Rabat",
    address: "Avenue Mohammed Ben Abdellah Regragui, Madinat Al Irfane",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 30 72",
    email: "contact@ensias.ma",
    website: "https://www.ensias.um5.ac.ma",
    seuilDeSelection: 16.5,
    documentsRequis: [
      "Baccalauréat scientifique ou équivalent",
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
        requirements: ["Bac+2 (CPGE, DUT, DEUG)", "Concours CNC"],
      },
      {
        id: "ing-si",
        name: "Ingénierie des Systèmes d'Information",
        description:
          "Spécialisation en systèmes d'information et gouvernance IT",
        duration: "3 ans",
        requirements: ["Bac+2 (CPGE, DUT, DEUG)", "Concours CNC"],
      },
      {
        id: "ing-ia",
        name: "Intelligence Artificielle et Data Science",
        description: "Formation en IA, machine learning et big data",
        duration: "3 ans",
        requirements: ["Bac+2 (CPGE, DUT, DEUG)", "Concours CNC"],
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
      "Opportunités de stages à l'international",
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

Reconnue pour l'excellence de sa formation et la qualité de ses diplômés, l'EMI jouit d'une réputation nationale et internationale. Ses anciens élèves occupent des postes de responsabilité dans les plus grandes entreprises marocaines et internationales.

L'école dispose de laboratoires de recherche reconnus et entretient des partenariats avec de nombreuses universités et écoles étrangères prestigieuses.`,
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
      "Photos d'identité",
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
        requirements: ["Bac+2 CPGE", "Concours CNC"],
      },
      {
        id: "ge",
        name: "Génie Électrique",
        description: "Spécialisation en systèmes électriques et électroniques",
        duration: "3 ans",
        requirements: ["Bac+2 CPGE", "Concours CNC"],
      },
      {
        id: "gi",
        name: "Génie Informatique",
        description: "Formation en informatique et systèmes",
        duration: "3 ans",
        requirements: ["Bac+2 CPGE", "Concours CNC"],
      },
      {
        id: "gm",
        name: "Génie Mécanique",
        description: "Formation en mécanique et conception",
        duration: "3 ans",
        requirements: ["Bac+2 CPGE", "Concours CNC"],
      },
    ],
    specializations: [
      "Génie Civil",
      "Génie Électrique",
      "Génie Mécanique",
      "Génie Informatique",
      "Génie Industriel",
      "Modélisation Mathématique",
    ],
    avantages: [
      "Doyenne des écoles d'ingénieurs marocaines",
      "Formation polyvalente et complète",
      "Réseau d'anciens très influent",
      "Partenariats internationaux prestigieux",
      "Laboratoires de recherche reconnus",
    ],
    services: [
      "Bibliothèque",
      "Centre sportif",
      "Résidence universitaire",
      "Restaurant universitaire",
      "Service médical",
    ],
    infrastructures: [
      "Laboratoires de génie civil",
      "Ateliers mécaniques",
      "Salles informatiques",
      "Amphithéâtres",
      "Terrains de sport",
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
    longDescription: `L'Institut National des Postes et Télécommunications (INPT) est un établissement d'enseignement supérieur public créé en 1961, rattaché à l'Agence Nationale de Réglementation des Télécommunications (ANRT).

L'INPT forme des ingénieurs de haut niveau dans les domaines des télécommunications, des réseaux, de l'informatique et des technologies de l'information et de la communication.

L'institut dispose d'équipements de pointe et de laboratoires modernes permettant aux étudiants de se former sur les dernières technologies du secteur.

Les diplômés de l'INPT sont très prisés par les opérateurs télécoms et les entreprises du secteur IT au Maroc et à l'international.`,
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
      "Photos d'identité",
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
        requirements: ["Bac+2 CPGE/DUT", "Concours"],
      },
      {
        id: "ing-cloud",
        name: "Cloud Computing et Sécurité",
        description: "Spécialisation cloud et cybersécurité",
        duration: "3 ans",
        requirements: ["Bac+2 CPGE/DUT", "Concours"],
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
      "Stages garantis chez les leaders du secteur",
    ],
    services: [
      "Bibliothèque spécialisée",
      "Laboratoires télécoms",
      "Club networking",
      "Service stages",
    ],
    infrastructures: [
      "Laboratoires télécoms",
      "Data center",
      "Salles de TP réseau",
      "Amphithéâtres équipés",
    ],
    partenariats: ["Maroc Telecom", "Orange", "Inwi", "Huawei", "Ericsson"],
    establishedYear: 1961,
    featured: true,
  },
  {
    name: "Université Mohammed V de Rabat",
    shortName: "UM5",
    type: SchoolType.UNIVERSITE,
    description:
      "L'Université Mohammed V est la plus grande université publique du Maroc, offrant une large gamme de formations.",
    longDescription: `L'Université Mohammed V de Rabat est la plus ancienne et la plus grande université moderne du Maroc. Fondée en 1957, elle regroupe aujourd'hui plusieurs facultés et écoles couvrant l'ensemble des domaines du savoir.

L'université offre des formations de licence, master et doctorat dans des domaines variés : sciences, lettres, droit, économie, médecine, pharmacie, sciences de l'éducation, et bien d'autres.

Avec plus de 80 000 étudiants, l'UM5 est un pôle majeur de l'enseignement supérieur au Maroc. Elle dispose de nombreux laboratoires de recherche et entretient des partenariats avec des universités du monde entier.

L'université s'engage dans une démarche d'excellence académique et de recherche scientifique, contribuant activement au développement du pays.`,
    city: "Rabat",
    address: "Avenue des Nations Unies, Agdal",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 27 27 27",
    email: "presidence@um5.ac.ma",
    website: "https://www.um5.ac.ma",
    seuilDeSelection: 12.0,
    documentsRequis: [
      "Baccalauréat",
      "Relevés de notes",
      "Copie de la CIN",
      "Photos d'identité",
    ],
    datesConcours: "Septembre",
    fraisInscription: 300,
    bourses: true,
    nombreEtudiants: 85000,
    tauxReussite: 75,
    classementNational: 1,
    programs: [
      {
        id: "licence",
        name: "Licences Fondamentales et Professionnelles",
        description: "Formations Bac+3 dans tous les domaines",
        duration: "3 ans",
        requirements: ["Baccalauréat"],
      },
      {
        id: "master",
        name: "Masters et Masters Spécialisés",
        description: "Formations Bac+5 spécialisées",
        duration: "2 ans",
        requirements: ["Licence ou équivalent"],
      },
      {
        id: "doctorat",
        name: "Doctorat",
        description: "Formation à la recherche",
        duration: "3-4 ans",
        requirements: ["Master ou équivalent"],
      },
    ],
    specializations: [
      "Sciences",
      "Lettres et Sciences Humaines",
      "Droit",
      "Économie",
      "Médecine",
      "Pharmacie",
      "Sciences de l'Éducation",
    ],
    avantages: [
      "Université la plus prestigieuse du Maroc",
      "Large choix de formations",
      "Recherche scientifique de qualité",
      "Partenariats internationaux",
      "Campus modernes",
    ],
    services: [
      "Bibliothèques",
      "Restaurants universitaires",
      "Résidences universitaires",
      "Services médicaux",
      "Services sportifs",
    ],
    infrastructures: [
      "Facultés et écoles",
      "Laboratoires de recherche",
      "Bibliothèques",
      "Amphithéâtres",
      "Complexes sportifs",
    ],
    partenariats: [
      "Sorbonne",
      "Sciences Po Paris",
      "Université de Montréal",
      "MIT",
      "Oxford",
    ],
    establishedYear: 1957,
    featured: true,
  },
  {
    name: "École Nationale de Commerce et de Gestion de Casablanca",
    shortName: "ENCG Casa",
    type: SchoolType.ECOLE_COMMERCE,
    description:
      "L'ENCG de Casablanca forme des managers et des cadres supérieurs en commerce, gestion et marketing.",
    longDescription: `L'École Nationale de Commerce et de Gestion de Casablanca (ENCG Casa) est un établissement public d'enseignement supérieur rattaché à l'Université Hassan II de Casablanca.

L'école offre une formation de qualité en commerce, gestion, marketing, finance et ressources humaines. Elle prépare ses étudiants à devenir des managers et des cadres supérieurs capables d'évoluer dans un environnement économique complexe et mondialisé.

L'ENCG Casa dispose d'un corps professoral qualifié, de partenariats avec des entreprises leaders et d'un réseau d'anciens élèves actif dans les secteurs économiques clés du pays.

La formation allie théorie et pratique grâce aux stages obligatoires et aux projets en entreprise.`,
    city: "Casablanca",
    address: "Route El Jadida, Km 8",
    region: "Casablanca-Settat",
    phone: "+212 522 23 08 92",
    email: "contact@encg-casa.ma",
    website: "https://www.encg-casablanca.ma",
    seuilDeSelection: 15.0,
    documentsRequis: [
      "Baccalauréat économique ou scientifique",
      "Relevés de notes",
      "Test d'admissibilité (TAFEM)",
      "Entretien oral",
      "Copie de la CIN",
    ],
    datesConcours: "Juin - Juillet",
    fraisInscription: 800,
    bourses: true,
    nombreEtudiants: 2000,
    tauxReussite: 88,
    classementNational: 5,
    programs: [
      {
        id: "commerce",
        name: "Commerce et Marketing",
        description: "Formation en commerce international et marketing",
        duration: "5 ans",
        requirements: ["Baccalauréat", "TAFEM"],
      },
      {
        id: "gestion",
        name: "Gestion des Entreprises",
        description: "Formation en management et gestion",
        duration: "5 ans",
        requirements: ["Baccalauréat", "TAFEM"],
      },
      {
        id: "finance",
        name: "Finance et Comptabilité",
        description: "Spécialisation finance et audit",
        duration: "5 ans",
        requirements: ["Baccalauréat", "TAFEM"],
      },
    ],
    specializations: [
      "Marketing Digital",
      "Finance d'Entreprise",
      "Audit et Contrôle de Gestion",
      "Commerce International",
      "Ressources Humaines",
    ],
    avantages: [
      "Formation professionnalisante",
      "Stages en entreprise obligatoires",
      "Partenariats avec les grandes entreprises",
      "Réseau alumni actif",
    ],
    services: [
      "Centre de documentation",
      "Bureau des stages",
      "Club entrepreneuriat",
      "Junior entreprise",
    ],
    infrastructures: [
      "Salles de cours modernes",
      "Laboratoire informatique",
      "Salle de marché simulée",
      "Amphithéâtres",
    ],
    partenariats: [
      "CGEM",
      "Bank of Africa",
      "Attijariwafa Bank",
      "Marjane",
      "Lydec",
    ],
    establishedYear: 1994,
    featured: false,
  },
  {
    name: "École Nationale des Sciences Appliquées de Marrakech",
    shortName: "ENSA Marrakech",
    type: SchoolType.ECOLE_INGENIEUR,
    description:
      "L'ENSA de Marrakech forme des ingénieurs dans les domaines de l'informatique, du génie civil et du génie industriel.",
    longDescription: `L'École Nationale des Sciences Appliquées de Marrakech (ENSA Marrakech) est un établissement d'enseignement supérieur public rattaché à l'Université Cadi Ayyad.

L'école offre des formations d'ingénieurs en 5 ans (cycle préparatoire intégré + cycle ingénieur) dans plusieurs filières : génie informatique, génie civil, génie industriel et génie des réseaux et télécommunications.

L'ENSA Marrakech met l'accent sur une formation équilibrée entre théorie et pratique, avec des projets industriels et des stages en entreprise.

L'école bénéficie d'un environnement privilégié à Marrakech et de partenariats avec des entreprises régionales et nationales.`,
    city: "Marrakech",
    address: "Boulevard Abdelkrim El Khattabi, Guéliz",
    region: "Marrakech-Safi",
    phone: "+212 524 43 47 45",
    email: "contact@ensa.ac.ma",
    website: "https://www.ensa-marrakech.ac.ma",
    seuilDeSelection: 14.5,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes",
      "Concours d'entrée",
      "Copie de la CIN",
      "Photos d'identité",
    ],
    datesConcours: "Juillet",
    fraisInscription: 1000,
    bourses: true,
    nombreEtudiants: 1500,
    tauxReussite: 85,
    classementNational: 8,
    programs: [
      {
        id: "gi",
        name: "Génie Informatique",
        description: "Formation en développement et systèmes informatiques",
        duration: "5 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
      {
        id: "gc",
        name: "Génie Civil",
        description: "Formation en construction et BTP",
        duration: "5 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
      {
        id: "gind",
        name: "Génie Industriel",
        description: "Formation en management industriel et logistique",
        duration: "5 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
    ],
    specializations: [
      "Génie Informatique",
      "Génie Civil",
      "Génie Industriel",
      "Réseaux et Télécommunications",
    ],
    avantages: [
      "Cycle préparatoire intégré",
      "Formation en 5 ans post-bac",
      "Stages obligatoires",
      "Environnement dynamique à Marrakech",
    ],
    services: [
      "Bibliothèque",
      "Laboratoires",
      "Service des stages",
      "Clubs étudiants",
    ],
    infrastructures: [
      "Laboratoires informatiques",
      "Ateliers de génie civil",
      "Salles de TP",
      "Amphithéâtres",
    ],
    partenariats: ["ONCF", "OCP", "Managem", "Entreprises locales"],
    establishedYear: 2000,
    featured: false,
  },
  {
    name: "Faculté des Sciences de Rabat",
    shortName: "FSR",
    type: SchoolType.FACULTE,
    description:
      "La Faculté des Sciences de Rabat offre des formations en sciences fondamentales et appliquées de la licence au doctorat.",
    longDescription: `La Faculté des Sciences de Rabat (FSR) est l'une des facultés les plus importantes de l'Université Mohammed V. Elle offre des formations de qualité dans les domaines des mathématiques, de la physique, de la chimie, de la biologie et des sciences de la terre.

La FSR dispose de nombreux laboratoires de recherche reconnus au niveau national et international. Elle forme des licenciés, des masters et des docteurs dans les différentes disciplines scientifiques.

La faculté contribue activement à la recherche scientifique et au développement technologique du pays à travers ses projets de recherche et ses partenariats avec le secteur industriel.`,
    city: "Rabat",
    address: "Avenue Ibn Battouta, Agdal",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 19 58",
    email: "fsr@um5.ac.ma",
    website: "https://www.fsr.ac.ma",
    seuilDeSelection: 12.0,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes",
      "Inscription via Tawjihi",
      "Copie de la CIN",
    ],
    datesConcours: "Septembre",
    fraisInscription: 200,
    bourses: true,
    nombreEtudiants: 12000,
    tauxReussite: 70,
    classementNational: 4,
    programs: [
      {
        id: "licence-maths",
        name: "Licence Mathématiques",
        description: "Formation en mathématiques fondamentales et appliquées",
        duration: "3 ans",
        requirements: ["Baccalauréat scientifique"],
      },
      {
        id: "licence-physique",
        name: "Licence Physique",
        description: "Formation en physique fondamentale",
        duration: "3 ans",
        requirements: ["Baccalauréat scientifique"],
      },
      {
        id: "licence-chimie",
        name: "Licence Chimie",
        description: "Formation en chimie fondamentale et appliquée",
        duration: "3 ans",
        requirements: ["Baccalauréat scientifique"],
      },
      {
        id: "licence-bio",
        name: "Licence Biologie",
        description: "Formation en sciences de la vie",
        duration: "3 ans",
        requirements: ["Baccalauréat scientifique"],
      },
    ],
    specializations: [
      "Mathématiques",
      "Physique",
      "Chimie",
      "Biologie",
      "Géologie",
      "Informatique",
    ],
    avantages: [
      "Formation scientifique de qualité",
      "Laboratoires de recherche reconnus",
      "Accès aux études supérieures (Master, Doctorat)",
      "Frais d'inscription abordables",
    ],
    services: [
      "Bibliothèque scientifique",
      "Laboratoires de TP",
      "Service social",
      "Orientation et insertion",
    ],
    infrastructures: [
      "Laboratoires de recherche",
      "Salles de TP",
      "Amphithéâtres",
      "Bibliothèque",
    ],
    partenariats: ["CNRS", "IRD", "Universités françaises", "OCP"],
    establishedYear: 1959,
    featured: false,
  },
  {
    name: "Institut Agronomique et Vétérinaire Hassan II",
    shortName: "IAV Hassan II",
    type: SchoolType.INSTITUT,
    description:
      "L'IAV Hassan II est le premier établissement d'enseignement supérieur agricole et vétérinaire au Maroc.",
    longDescription: `L'Institut Agronomique et Vétérinaire Hassan II (IAV Hassan II) est un établissement d'enseignement supérieur et de recherche spécialisé dans les sciences agronomiques, vétérinaires et agroalimentaires.

Fondé en 1966, l'IAV forme des ingénieurs agronomes, des docteurs vétérinaires et des ingénieurs en industries agroalimentaires. L'institut joue un rôle majeur dans le développement du secteur agricole marocain.

L'IAV dispose d'un campus moderne à Rabat avec des fermes expérimentales, des laboratoires de recherche et un hôpital vétérinaire universitaire.

Ses diplômés occupent des postes clés dans l'agriculture, l'élevage, l'agroalimentaire et les organisations internationales liées à ces domaines.`,
    city: "Rabat",
    address: "Avenue Hassan II, Rabat-Instituts",
    region: "Rabat-Salé-Kénitra",
    phone: "+212 537 77 17 59",
    email: "contact@iav.ac.ma",
    website: "https://www.iav.ac.ma",
    seuilDeSelection: 15.5,
    documentsRequis: [
      "Baccalauréat scientifique",
      "Relevés de notes",
      "Concours national",
      "Visite médicale",
      "Copie de la CIN",
    ],
    datesConcours: "Juin - Juillet",
    fraisInscription: 1500,
    bourses: true,
    nombreEtudiants: 3000,
    tauxReussite: 88,
    classementNational: 6,
    programs: [
      {
        id: "agro",
        name: "Ingénieur Agronome",
        description: "Formation en sciences agronomiques",
        duration: "6 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
      {
        id: "veto",
        name: "Docteur Vétérinaire",
        description: "Formation en médecine vétérinaire",
        duration: "6 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
      {
        id: "iaa",
        name: "Ingénieur en Industries Agroalimentaires",
        description: "Formation en transformation alimentaire",
        duration: "5 ans",
        requirements: ["Baccalauréat scientifique", "Concours"],
      },
    ],
    specializations: [
      "Agronomie",
      "Médecine Vétérinaire",
      "Industries Agroalimentaires",
      "Économie Rurale",
      "Horticulture",
      "Zootechnie",
    ],
    avantages: [
      "Formation unique au Maroc",
      "Fermes expérimentales",
      "Hôpital vétérinaire",
      "Débouchés garantis dans le secteur agricole",
    ],
    services: [
      "Bibliothèque spécialisée",
      "Fermes d'application",
      "Clinique vétérinaire",
      "Centre de recherche",
    ],
    infrastructures: [
      "Fermes expérimentales",
      "Hôpital vétérinaire",
      "Laboratoires de recherche",
      "Usine pilote agroalimentaire",
    ],
    partenariats: [
      "FAO",
      "Ministère de l'Agriculture",
      "AgroParisTech",
      "Coopératives agricoles",
    ],
    establishedYear: 1966,
    featured: true,
  },
];

async function main() {
  console.log("🏫 Starting school seed...\n");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    throw new Error(
      "No admin user found. Please run the main seed first: npx tsx prisma/seed.ts"
    );
  }

  console.log(`Found admin user: ${admin.email}\n`);

  // Check existing schools
  const existingCount = await prisma.school.count();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing schools.`);
    console.log("   Skipping seed to avoid duplicates.\n");
    console.log("   To reseed, run: npx tsx prisma/clean.ts first\n");
    return;
  }

  // Seed Schools
  console.log("🏫 Seeding schools...\n");
  for (const school of schoolsData) {
    const created = await prisma.school.create({
      data: {
        ...school,
        uploadedById: admin.id,
        status: SchoolStatus.ACTIVE,
        isPublic: true,
        views: Math.floor(Math.random() * 2000) + 500,
      },
    });
    console.log(`  ✓ ${created.shortName || created.name}`);
  }
  console.log(`\n✅ Created ${schoolsData.length} schools\n`);

  // Summary
  const schoolCount = await prisma.school.count();
  const featuredCount = await prisma.school.count({
    where: { featured: true },
  });

  console.log("📊 Summary:");
  console.log(`  - Total schools: ${schoolCount}`);
  console.log(`  - Featured schools: ${featuredCount}`);
  console.log("\n🎉 School seed completed successfully!");
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
