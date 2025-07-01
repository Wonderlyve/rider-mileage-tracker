
-- Phase 1: Tables utilisateurs et données principales

-- Table des profils utilisateurs (riders et admins)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(10) CHECK (type IN ('rider', 'admin')) NOT NULL DEFAULT 'rider',
  photo_url TEXT,
  matricule VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des relevés kilométriques
CREATE TABLE public.mileage_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) CHECK (type IN ('ouverture', 'fermeture', 'carburant')) NOT NULL,
  shift INTEGER CHECK (shift IN (1, 2)) NOT NULL,
  kilometrage INTEGER NOT NULL,
  amount DECIMAL(10, 2), -- Montant en CDF pour carburant
  photo_url TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des équipements
CREATE TABLE public.equipment_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  motorcycle_matricule VARCHAR(100) NOT NULL,
  phone_id VARCHAR(100) NOT NULL,
  shift INTEGER CHECK (shift IN (1, 2)) NOT NULL,
  has_helmet BOOLEAN NOT NULL DEFAULT FALSE,
  has_motorcycle_document BOOLEAN NOT NULL DEFAULT FALSE,
  has_exchange_money BOOLEAN NOT NULL DEFAULT FALSE,
  exchange_money_usd DECIMAL(10, 2),
  exchange_money_cdf DECIMAL(12, 2),
  matriculation_photo_url TEXT,
  mileage_photo_url TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 2: Configuration du stockage de fichiers

-- Créer les buckets de stockage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('mileage-photos', 'mileage-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('equipment-photos', 'equipment-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('profile-photos', 'profile-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- Index pour optimiser les performances
CREATE INDEX idx_mileage_entries_rider_id ON public.mileage_entries(rider_id);
CREATE INDEX idx_mileage_entries_date ON public.mileage_entries(date);
CREATE INDEX idx_mileage_entries_type ON public.mileage_entries(type);
CREATE INDEX idx_equipment_entries_rider_id ON public.equipment_entries(rider_id);
CREATE INDEX idx_equipment_entries_date ON public.equipment_entries(date);
CREATE INDEX idx_profiles_type ON public.profiles(type);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_matricule ON public.profiles(matricule);

-- Activer Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mileage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_entries ENABLE ROW LEVEL SECURITY;

-- Fonction de sécurité pour vérifier le rôle admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND type = 'admin'
  );
$$;

-- Politiques RLS pour les profils
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- Politiques RLS pour les relevés kilométriques
CREATE POLICY "Riders can view their own mileage entries" ON public.mileage_entries
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "Admins can view all mileage entries" ON public.mileage_entries
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Riders can insert their own mileage entries" ON public.mileage_entries
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their own mileage entries" ON public.mileage_entries
  FOR UPDATE USING (auth.uid() = rider_id);

CREATE POLICY "Admins can manage all mileage entries" ON public.mileage_entries
  FOR ALL USING (public.is_admin());

-- Politiques RLS pour les équipements
CREATE POLICY "Riders can view their own equipment entries" ON public.equipment_entries
  FOR SELECT USING (auth.uid() = rider_id);

CREATE POLICY "Admins can view all equipment entries" ON public.equipment_entries
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Riders can insert their own equipment entries" ON public.equipment_entries
  FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their own equipment entries" ON public.equipment_entries
  FOR UPDATE USING (auth.uid() = rider_id);

CREATE POLICY "Admins can manage all equipment entries" ON public.equipment_entries
  FOR ALL USING (public.is_admin());

-- Politiques de stockage pour les photos de kilométrage
CREATE POLICY "Users can upload their own mileage photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'mileage-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view mileage photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'mileage-photos');

CREATE POLICY "Users can update their own mileage photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'mileage-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own mileage photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'mileage-photos' AND
    auth.role() = 'authenticated'
  );

-- Politiques de stockage pour les photos d'équipement
CREATE POLICY "Users can upload their own equipment photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'equipment-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view equipment photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'equipment-photos');

CREATE POLICY "Users can update their own equipment photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'equipment-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own equipment photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'equipment-photos' AND
    auth.role() = 'authenticated'
  );

-- Politiques de stockage pour les photos de profil
CREATE POLICY "Users can upload their own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos' AND
    auth.role() = 'authenticated'
  );

-- Triggers pour mettre à jour les timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mileage_entries_updated_at 
  BEFORE UPDATE ON public.mileage_entries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_entries_updated_at 
  BEFORE UPDATE ON public.equipment_entries 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'type', 'rider')
  );
  RETURN NEW;
END;
$$;

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
