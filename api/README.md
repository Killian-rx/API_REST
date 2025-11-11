# API Backend

API REST pour le projet Leboncoin-like.

## Installation

```bash
npm install
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `api/` en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Puis modifiez les valeurs selon votre configuration locale.

## Base de données

### Configuration

Le projet utilise **Prisma** comme ORM avec **PostgreSQL**.

1. **Configurer la connexion à la base de données**

   Dans le fichier `.env`, configurez la variable `DATABASE_URL` :

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
   ```

   Remplacez :
   - `user` : votre nom d'utilisateur PostgreSQL
   - `password` : votre mot de passe PostgreSQL
   - `localhost:5432` : l'adresse et le port de votre serveur PostgreSQL
   - `dbname` : le nom de votre base de données

2. **Générer le client Prisma**

   Après avoir installé les dépendances, générez le client Prisma :

   ```bash
   npm run prisma:generate
   ```

3. **Lancer les migrations**

   Pour créer les tables dans la base de données :

   ```bash
   npm run prisma:migrate
   ```

   Cette commande va :
   - Créer une nouvelle migration basée sur les changements du schéma
   - Appliquer la migration à la base de données
   - Régénérer le client Prisma

### Utilisation de Prisma dans le code

Le client Prisma est configuré dans `src/config/prisma.js` et peut être importé dans vos fichiers :

```javascript
import prisma from './config/prisma.js';

// Exemple d'utilisation
const users = await prisma.user.findMany();
```

## Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:4000` (ou le port défini dans `.env`).

## Production

```bash
npm start
```

