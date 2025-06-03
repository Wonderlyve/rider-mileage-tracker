
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'rider' | 'admin';
  photo?: string;
  matricule?: string;
}

export interface MileageEntry {
  id: string;
  riderId: string;
  type: 'ouverture' | 'fermeture' | 'carburant';
  shift: 1 | 2;
  kilometrage: number;
  photo: string;
  timestamp: number;
  date: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}
