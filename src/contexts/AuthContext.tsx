
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types';
import localForage from 'localforage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'shoppirideradmin@shoppi.cd',
  password: 'Myadminriders'
};

const mockRiders: User[] = [
  {
    id: '1',
    name: 'Jean-Claude Mulumba',
    email: 'jc.mulumba@shoppi.cd',
    type: 'rider',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    matricule: 'KIN-001'
  },
  {
    id: '2',
    name: 'Marie Kabila',
    email: 'marie.kabila@shoppi.cd',
    type: 'rider',
    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b814?w=100&h=100&fit=crop&crop=face',
    matricule: 'KIN-002'
  },
  {
    id: '3',
    name: 'Pascal Mokoko',
    email: 'pascal.mokoko@shoppi.cd',
    type: 'rider',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    matricule: 'KIN-003'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const savedUser = await localForage.getItem<User>('currentUser');
      if (savedUser) {
        setUser(savedUser);
      }
      
      // Initialize riders in storage
      const existingRiders = await localForage.getItem<User[]>('riders');
      if (!existingRiders) {
        await localForage.setItem('riders', mockRiders);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          name: 'Administrateur',
          email: email,
          type: 'admin'
        };
        await localForage.setItem('currentUser', adminUser);
        setUser(adminUser);
        return true;
      }

      // Check rider credentials
      const riders = await localForage.getItem<User[]>('riders') || [];
      const rider = riders.find(r => r.email === email);
      
      if (rider && password === 'rider123') { // Simple password for demo
        await localForage.setItem('currentUser', rider);
        setUser(rider);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await localForage.removeItem('currentUser');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
