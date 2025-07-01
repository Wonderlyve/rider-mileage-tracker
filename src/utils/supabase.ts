
import { supabase } from '@/integrations/supabase/client';
import { User, MileageEntry, EquipmentEntry } from '@/types';

// User/Profile operations
export const createProfile = async (userData: {
  id: string;
  name: string;
  email: string;
  type: 'rider' | 'admin';
  matricule?: string;
  photo_url?: string;
}) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([userData])
    .select()
    .single();

  return { data, error };
};

export const updateProfile = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      email: updates.email,
      matricule: updates.matricule,
      photo_url: updates.photo,
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const getAllRiders = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('type', 'rider')
    .order('name');

  return { data, error };
};

// Mileage operations
export const createMileageEntry = async (entry: {
  rider_id: string;
  type: 'ouverture' | 'fermeture' | 'carburant';
  shift: 1 | 2;
  kilometrage: number;
  amount?: number;
  photo_url: string;
  date: string;
}) => {
  const { data, error } = await supabase
    .from('mileage_entries')
    .insert([entry])
    .select()
    .single();

  return { data, error };
};

export const getMileageEntries = async (riderId?: string) => {
  let query = supabase
    .from('mileage_entries')
    .select(`
      *,
      profiles:rider_id (
        name,
        matricule
      )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (riderId) {
    query = query.eq('rider_id', riderId);
  }

  const { data, error } = await query;
  return { data, error };
};

// Equipment operations
export const createEquipmentEntry = async (entry: {
  rider_id: string;
  motorcycle_matricule: string;
  phone_id: string;
  shift: 1 | 2;
  has_helmet: boolean;
  has_motorcycle_document: boolean;
  has_exchange_money: boolean;
  exchange_money_usd?: number;
  exchange_money_cdf?: number;
  matriculation_photo_url?: string;
  mileage_photo_url?: string;
  date: string;
}) => {
  const { data, error } = await supabase
    .from('equipment_entries')
    .insert([entry])
    .select()
    .single();

  return { data, error };
};

export const getEquipmentEntries = async (riderId?: string) => {
  let query = supabase
    .from('equipment_entries')
    .select(`
      *,
      profiles:rider_id (
        name,
        matricule
      )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (riderId) {
    query = query.eq('rider_id', riderId);
  }

  const { data, error } = await query;
  return { data, error };
};

// File upload operations
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
): Promise<{ data: { path: string } | null; error: any }> => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  return { data, error };
};

export const getFileUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  return { data, error };
};

// Statistics and reports
export const getStatistics = async () => {
  const { data: totalRiders, error: ridersError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('type', 'rider');

  const { data: totalEntries, error: entriesError } = await supabase
    .from('mileage_entries')
    .select('id', { count: 'exact' });

  const today = new Date().toISOString().split('T')[0];
  const { data: todayEntries, error: todayError } = await supabase
    .from('mileage_entries')
    .select('id', { count: 'exact' })
    .eq('date', today);

  return {
    totalRiders: totalRiders?.length || 0,
    totalEntries: totalEntries?.length || 0,
    todayEntries: todayEntries?.length || 0,
    errors: { ridersError, entriesError, todayError }
  };
};
