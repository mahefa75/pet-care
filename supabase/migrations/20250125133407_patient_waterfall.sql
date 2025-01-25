/*
  # Création des tables pour l'application Pet Care

  1. Nouvelles Tables
    - `pets`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `name` (text)
      - `species` (text)
      - `breed` (text)
      - `birth_date` (date)
      - `created_at` (timestamp)
    
    - `medical_records`
      - `id` (uuid, clé primaire)
      - `pet_id` (uuid, référence à pets)
      - `type` (text) - type de soin (vaccination, vermifuge, etc.)
      - `date` (date)
      - `next_due_date` (date)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour permettre aux utilisateurs de gérer leurs propres données
*/

-- Création de la table des animaux
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  birth_date date,
  created_at timestamptz DEFAULT now()
);

-- Création de la table des soins médicaux
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  next_due_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Activation de la RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table pets
CREATE POLICY "Users can view their own pets"
  ON pets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pets"
  ON pets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON pets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON pets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques pour la table medical_records
CREATE POLICY "Users can view their pets' medical records"
  ON medical_records FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = medical_records.pet_id
    AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can create medical records for their pets"
  ON medical_records FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = medical_records.pet_id
    AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their pets' medical records"
  ON medical_records FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = medical_records.pet_id
    AND pets.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = medical_records.pet_id
    AND pets.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their pets' medical records"
  ON medical_records FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM pets
    WHERE pets.id = medical_records.pet_id
    AND pets.user_id = auth.uid()
  ));