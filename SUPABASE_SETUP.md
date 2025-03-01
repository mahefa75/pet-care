# Configuration de Supabase pour Pet Care

Ce document explique comment configurer Supabase pour l'application Pet Care.

## Qu'est-ce que Supabase ?

Supabase est une alternative open source à Firebase qui fournit tous les services backend dont vous avez besoin pour créer un produit :
- Base de données PostgreSQL
- Authentification
- Stockage de fichiers
- API instantanée
- Fonctions Edge

## Étapes de configuration

### 1. Créer un compte Supabase

1. Rendez-vous sur [https://supabase.com/](https://supabase.com/) et créez un compte
2. Connectez-vous à votre compte Supabase

### 2. Créer un nouveau projet

1. Cliquez sur "New Project"
2. Donnez un nom à votre projet (par exemple "pet-care")
3. Choisissez une région proche de vos utilisateurs
4. Définissez un mot de passe pour la base de données
5. Cliquez sur "Create new project"

### 3. Créer les tables nécessaires

Une fois votre projet créé, vous devez créer les tables suivantes dans l'interface SQL de Supabase. Allez dans la section "SQL Editor" et exécutez les requêtes suivantes :

```sql
-- Table des animaux de compagnie
CREATE TABLE pets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  weight NUMERIC,
  status TEXT NOT NULL,
  owner_id INTEGER,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rendez-vous
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  type TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des traitements
CREATE TABLE treatments (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  next_due_date DATE,
  administered_by TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des mesures de poids
CREATE TABLE weight_measurements (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des toilettages
CREATE TABLE grooming (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  performed_by TEXT,
  notes TEXT,
  next_appointment DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des événements de santé
CREATE TABLE health_events (
  id SERIAL PRIMARY KEY,
  pet_id INTEGER NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolution_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des aliments
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  brand TEXT,
  ingredients TEXT,
  nutritional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des vétérinaires
CREATE TABLE veterinarians (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  speciality TEXT,
  clinic TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Configurer les variables d'environnement

1. Dans votre projet Supabase, allez dans "Settings" > "API"
2. Copiez l'URL du projet et la clé anon/public
3. Créez un fichier `.env` à la racine de votre projet Pet Care avec le contenu suivant :

```
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

Remplacez `votre_url_supabase` et `votre_cle_anon_supabase` par les valeurs copiées.

### 5. Migrer vos données

1. Lancez l'application Pet Care
2. Allez dans "Paramètres" > "Migration Supabase"
3. Cliquez sur "Vérifier la connexion" pour vous assurer que la connexion à Supabase fonctionne
4. Cliquez sur "Migrer les données vers Supabase" pour transférer toutes vos données locales vers Supabase

## Sécurité

Par défaut, Supabase utilise des politiques de sécurité Row Level Security (RLS) qui bloquent l'accès à toutes les tables. Pour simplifier l'utilisation initiale, vous pouvez désactiver temporairement RLS pour le développement :

1. Allez dans "Authentication" > "Policies"
2. Pour chaque table, cliquez sur les trois points (...) et sélectionnez "Edit table"
3. Désactivez "Enable Row Level Security"

**ATTENTION** : Cette configuration n'est pas recommandée pour la production. Pour un environnement de production, vous devriez configurer des politiques RLS appropriées.

## Ressources supplémentaires

- [Documentation Supabase](https://supabase.com/docs)
- [Tutoriels Supabase](https://supabase.com/docs/guides/getting-started)
- [Exemples de projets](https://github.com/supabase/supabase/tree/master/examples) 