
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'rider' | 'admin';
  photo?: string;
  matricule?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MileageEntry {
  id: string;
  riderId: string;
  type: 'ouverture' | 'fermeture' | 'carburant';
  shift: 1 | 2;
  kilometrage: number;
  amount?: number; // Montant en CDF pour les relevés carburant
  photo: string;
  timestamp: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface EquipmentEntry {
  id: string;
  riderId: string;
  motorcycleMatricule: string;
  phoneId: string;
  hasHelmet: boolean;
  hasMotorcycleDocument: boolean;
  hasExchangeMoney: boolean;
  exchangeMoneyUSD?: number; // Montant en USD
  exchangeMoneyCDF?: number; // Montant en CDF
  matriculationPhoto: string;
  mileagePhoto: string;
  timestamp: number;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  riderId?: string;
  type?: 'ouverture' | 'fermeture' | 'carburant';
  shift?: 1 | 2;
}
