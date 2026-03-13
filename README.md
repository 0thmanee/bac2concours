# 2BAConcours

> **Plateforme de préparation aux concours pour les étudiants marocains du baccalauréat. Préparez-vous aux concours de MÉDECINE, DENTAIRE, PHARMACIE, ENCG, ENA, ENSA avec notre plateforme complète.**

---

## 📋 Table des Matières

- [Vision du Produit](#vision-du-produit)
- [Spécification MVP](#spécification-mvp)
- [État Actuel](#état-actuel)
- [Stack Technique](#stack-technique)
- [Démarrage Rapide](#démarrage-rapide)
- [Structure du Projet](#structure-du-projet)
- [Guide de Marque & Design](#guide-de-marque--design)
- [Documentation API](#documentation-api)
- [Déploiement](#déploiement)

---

## 🎯 Vision du Produit

### Vision en Une Phrase

2BAConcours est une plateforme éducative qui aide les étudiants marocains du baccalauréat à se préparer aux concours des grandes écoles avec des ressources structurées, des QCM interactifs et un suivi personnalisé.

### Marché Cible

**Utilisateurs Principaux :**

- **Administrateurs** : Gestionnaires de contenu qui créent et gèrent les ressources éducatives
- **Étudiants** : Élèves de 2BAC préparant les concours des grandes écoles

**Concours Ciblés :**

- MÉDECINE, DENTAIRE, PHARMACIE
- ENCG (Écoles Nationales de Commerce et de Gestion)
- ENA (École Nationale d'Architecture)
- ENSA (Écoles Nationales des Sciences Appliquées)
- ENSIAS, EMI, et autres écoles d'ingénieurs

---

## 📐 Spécification MVP

### Objectif MVP

Le MVP doit :

1. Fournir une bibliothèque de ressources (livres PDF, vidéos)
2. Offrir des QCM interactifs pour l'entraînement
3. Permettre le suivi de progression des étudiants
4. Donner aux admins les outils de gestion de contenu

### Fonctionnalités Principales (Scope MVP)

#### ✅ 1. Authentification & Contrôle d'Accès

- Authentification email + mot de passe
- Accès basé sur les rôles (ADMIN, STUDENT)
- Réinitialisation de mot de passe par email
- Vérification d'email

#### ✅ 2. Gestion des Écoles (Admin)

- Créer et gérer les fiches écoles
- Informations : nom, type, localisation, programmes
- Statistiques d'admission
- Informations sur les concours

#### ✅ 3. Bibliothèque de Livres (Core Feature)

- Admin : Upload et gestion des PDFs
  - Titre, auteur, catégorie, école ciblée
  - Tags et niveau de difficulté
- Étudiant : Consultation et téléchargement
  - Filtrage par école, matière, catégorie
  - Système de favoris

#### ✅ 4. Bibliothèque de Vidéos (Core Feature)

- Admin : Gestion des vidéos éducatives
  - Liens YouTube/Vimeo
  - Organisation par matière et école
- Étudiant : Visionnage et organisation
  - Historique de visionnage
  - Playlists personnalisées

#### ✅ 5. Système de QCM (Core Feature)

- Admin : Création et gestion des questions
  - Question, options, réponse correcte
  - Matière, école, difficulté, points
  - Tags pour catégorisation
- Étudiant : Passage des quiz
  - Quiz par matière ou école
  - Correction instantanée
  - Score et explications

#### ✅ 6. Historique & Progression (Étudiant)

- Historique des quiz passés
- Scores et évolution dans le temps
- Points forts et points à améliorer
- Statistiques de performance

#### ✅ 7. Dashboard Étudiant

- Métriques clés :
  - Quiz complétés
  - Score moyen
  - Ressources consultées
  - Progression globale
- Recommandations personnalisées
- Activité récente

#### ✅ 8. Dashboard Admin

- Métriques clés :
  - Total étudiants
  - Ressources disponibles
  - Quiz créés
  - Activité plateforme
- Gestion rapide du contenu
- Vue d'ensemble

### Hors Scope (MVP)

❌ **NE PAS CONSTRUIRE :**

- Application mobile
- Système de messagerie/chat
- Forums de discussion
- Système de paiement
- Cours en direct
- Mentorat individuel
- Intégrations tierces

### Critères de Succès

Le MVP est réussi quand :

- Des étudiants utilisent activement la plateforme
- Les ressources sont consultées régulièrement
- Les quiz sont complétés avec engagement
- Le taux de retour des utilisateurs est positif

---

## 🚧 État Actuel

### ✅ Infrastructure Complétée

- [x] Next.js 16 (App Router) avec TypeScript
- [x] Base de données PostgreSQL avec Prisma ORM
- [x] Auth.js (NextAuth v5) authentification
- [x] Contrôle d'accès basé sur les rôles (RBAC)
- [x] Validation (React Hook Form + Zod)
- [x] Bibliothèque UI (shadcn/ui)
- [x] Structure des routes API
- [x] Système de vérification email
- [x] Flux de réinitialisation mot de passe

### 🚧 À Implémenter

- [ ] Schéma base de données (Schools, Books, Videos, QCM)
- [ ] Services et validations pour nouvelles entités
- [ ] Pages Admin (gestion écoles, livres, vidéos, QCM)
- [ ] Pages Étudiant (bibliothèque, quiz, historique)
- [ ] Système de progression et statistiques

---

## 🛠️ Stack Technique

### Frontend

- **Next.js 16** (App Router) - Framework React avec SSR
- **TypeScript** (Mode strict) - Développement type-safe
- **Tailwind CSS v4** - Framework CSS utility-first
- **shadcn/ui** - Composants UI accessibles et personnalisables
- **React Hook Form** - Gestion performante des formulaires
- **Zod** - Validation de schémas (client/serveur)
- **TanStack Query** - Gestion d'état serveur

### Backend

- **Next.js API Routes** - Endpoints API serverless
- **Prisma** - ORM type-safe
- **PostgreSQL** - Base de données relationnelle
- **Auth.js (NextAuth v5)** - Authentification avec sessions JWT
- **bcryptjs** - Hashage de mots de passe

### Infrastructure

- **Vercel** - Hébergement & déploiement
- **Neon/Supabase** - Hébergement PostgreSQL
- **Resend** - Emails transactionnels

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm/pnpm
- PostgreSQL (local ou hébergé)
- Compte Resend pour les emails

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-repo/2baconcours.git
cd 2baconcours

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Seeder la base de données (optionnel)
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="votre-secret-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@2baconcours.ma"
```

---

## 📁 Structure du Projet

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages d'authentification
│   ├── admin/             # Dashboard et pages admin
│   ├── student/           # Dashboard et pages étudiant (à créer)
│   └── api/               # Routes API
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants shadcn/ui
│   ├── layouts/          # Layouts (header, sidebar)
│   └── shared/           # Composants partagés
├── lib/                   # Utilitaires et configuration
│   ├── services/         # Services métier
│   ├── validations/      # Schémas Zod
│   ├── hooks/            # Hooks personnalisés
│   └── utils/            # Fonctions utilitaires
├── prisma/               # Schéma et migrations
└── public/               # Assets statiques
```

---

## 🎨 Guide de Marque & Design

### Couleurs Principales

| Couleur      | Hex       | Utilisation                               |
| ------------ | --------- | ----------------------------------------- |
| Brand Purple | `#b02d94` | Couleur principale, boutons, liens actifs |
| Brand Light  | `#f7d6ee` | Backgrounds subtils, hover states         |
| Brand Dark   | `#6b1b5e` | Texte sur fond clair, accents forts       |
| Pink Accent  | `#ec4899` | Actions secondaires, notifications        |
| Teal         | `#14b8a6` | Succès, progression, complémentaire       |

### Palette Complète

```css
--brand-50: #fbebf7; /* Backgrounds très légers */
--brand-100: #f7d6ee; /* Hover states */
--brand-200: #efaddf; /* Borders subtils */
--brand-300: #e37ac9; /* Icônes désactivées */
--brand-400: #d247ad; /* Texte secondaire */
--brand-500: #bd2d98; /* Liens, hover */
--brand-600: #b02d94; /* PRIMARY - Boutons, liens actifs */
--brand-700: #8b2277; /* Hover sur primary */
--brand-800: #6b1b5e; /* Texte fort */
--brand-900: #54154b; /* Headings */
--brand-950: #380a30; /* Plus sombre */
```

### Typographie

- **Font Family** : Inter (Google Fonts)
- **Headings** : Semi-bold (600)
- **Body** : Regular (400)
- **Labels** : Medium (500)

### Style Général

- Design moderne et épuré
- Interface en français
- Responsive (mobile-first)
- Accessible (WCAG 2.1 AA)

---

## 📖 Documentation API

La documentation API interactive est disponible à `/api-docs` en mode développement.

### Endpoints Principaux

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/schools` - Liste des écoles
- `GET /api/books` - Liste des livres
- `GET /api/videos` - Liste des vidéos
- `GET /api/quizzes` - Liste des quiz
- `POST /api/quiz-attempts` - Soumettre un quiz

---

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connecter le dépôt GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement sur chaque push

### Variables de Production

```env
DATABASE_URL="postgresql://..." # URL Neon/Supabase
NEXTAUTH_SECRET="..." # Secret fort
NEXTAUTH_URL="https://2baconcours.ma"
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@2baconcours.ma"
```

---

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

---

## 🤝 Contact

Pour toute question ou suggestion :

- Email : support@2baconcours.ma
- Site : https://2baconcours.ma
