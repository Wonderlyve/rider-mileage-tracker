
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { fr: 'Accueil', en: 'Home' },
  profile: { fr: 'Profil', en: 'Profile' },
  logout: { fr: 'Déconnexion', en: 'Logout' },
  back: { fr: 'Retour', en: 'Back' },
  
  // Login page
  appName: { fr: 'Kilométrage', en: 'Mileage' },
  loginSubtitle: { fr: 'Connectez-vous à votre compte', en: 'Sign in to your account' },
  connect: { fr: 'Se connecter', en: 'Sign in' },
  connecting: { fr: 'Connexion...', en: 'Signing in...' },
  incorrectCredentials: { fr: 'Email ou mot de passe incorrect', en: 'Incorrect email or password' },
  errorOccurred: { fr: 'Une erreur est survenue', en: 'An error occurred' },
  demoAccounts: { fr: 'Comptes de démonstration', en: 'Demo accounts' },
  
  // Mileage Form
  newEntry: { fr: 'Nouvelle saisie', en: 'New Entry' },
  entryType: { fr: 'Type de saisie', en: 'Entry Type' },
  opening: { fr: 'Ouverture', en: 'Opening' },
  closing: { fr: 'Fermeture', en: 'Closing' },
  fuel: { fr: 'Carburant', en: 'Fuel' },
  shiftStart: { fr: 'Début de shift', en: 'Shift start' },
  shiftEnd: { fr: 'Fin de shift', en: 'Shift end' },
  beforeRefuel: { fr: 'Avant ravitaillement', en: 'Before refueling' },
  shiftNumber: { fr: 'Numéro de shift', en: 'Shift Number' },
  morning: { fr: 'Matin', en: 'Morning' },
  afternoon: { fr: 'Après-midi', en: 'Afternoon' },
  currentMileage: { fr: 'Kilométrage actuel', en: 'Current Mileage' },
  amount: { fr: 'Montant', en: 'Amount' },
  amountCDF: { fr: 'Montant en CDF', en: 'Amount in CDF' },
  counterPhoto: { fr: 'Photo du compteur', en: 'Counter Photo' },
  takePhoto: { fr: 'Prendre une photo', en: 'Take a photo' },
  changePhoto: { fr: 'Changer la photo', en: 'Change photo' },
  ofMileageCounter: { fr: 'du compteur kilométrique', en: 'of the mileage counter' },
  saveEntry: { fr: 'Enregistrer la saisie', en: 'Save Entry' },
  saving: { fr: 'Enregistrement...', en: 'Saving...' },
  
  // Admin
  adminDashboard: { fr: 'Tableau de bord administrateur', en: 'Admin Dashboard' },
  riderManagement: { fr: 'Gestion des riders', en: 'Rider Management' },
  overview: { fr: 'Vue d\'ensemble', en: 'Overview' },
  totalRiders: { fr: 'Total Riders', en: 'Total Riders' },
  totalEntries: { fr: 'Total Relevés', en: 'Total Entries' },
  today: { fr: 'Aujourd\'hui', en: 'Today' },
  viewReports: { fr: 'Voir Rapports', en: 'View Reports' },
  exportCSV: { fr: 'Exporter CSV', en: 'Export CSV' },
  ridersList: { fr: 'Liste des Riders', en: 'Riders List' },
  searchRider: { fr: 'Rechercher un rider...', en: 'Search rider...' },
  newRider: { fr: 'Nouveau Rider', en: 'New Rider' },
  reports: { fr: 'Rapports', en: 'Reports' },
  filterByDate: { fr: 'Filtrer par date', en: 'Filter by date' },
  startDate: { fr: 'Date de début', en: 'Start date' },
  endDate: { fr: 'Date de fin', en: 'End date' },
  allRiders: { fr: 'Tous les riders', en: 'All riders' },
  riderDetails: { fr: 'Détails du rider', en: 'Rider details' },
  mileageEntries: { fr: 'Relevés kilométriques', en: 'Mileage entries' },
  noEntries: { fr: 'Aucun relevé trouvé', en: 'No entries found' },
  
  // Rider Profile
  myProfile: { fr: 'Mon Profil', en: 'My Profile' },
  personalInfo: { fr: 'Informations personnelles', en: 'Personal information' },
  statistics: { fr: 'Statistiques', en: 'Statistics' },
  totalEntriesCount: { fr: 'Total des relevés', en: 'Total entries' },
  lastEntry: { fr: 'Dernier relevé', en: 'Last entry' },
  never: { fr: 'Jamais', en: 'Never' },
  
  // Common fields
  name: { fr: 'Nom', en: 'Name' },
  email: { fr: 'Email', en: 'Email' },
  matricule: { fr: 'Matricule', en: 'ID Number' },
  password: { fr: 'Mot de passe', en: 'Password' },
  photo: { fr: 'Photo', en: 'Photo' },
  create: { fr: 'Créer', en: 'Create' },
  cancel: { fr: 'Annuler', en: 'Cancel' },
  save: { fr: 'Sauvegarder', en: 'Save' },
  delete: { fr: 'Supprimer', en: 'Delete' },
  edit: { fr: 'Modifier', en: 'Edit' },
  viewDetails: { fr: 'Voir détails', en: 'View details' },
  actions: { fr: 'Actions', en: 'Actions' },
  date: { fr: 'Date', en: 'Date' },
  time: { fr: 'Heure', en: 'Time' },
  type: { fr: 'Type', en: 'Type' },
  shift: { fr: 'Shift', en: 'Shift' },
  mileage: { fr: 'Kilométrage', en: 'Mileage' },
  
  // Common
  yes: { fr: 'Oui', en: 'Yes' },
  no: { fr: 'Non', en: 'No' },
  error: { fr: 'Erreur', en: 'Error' },
  success: { fr: 'Succès', en: 'Success' },
  loading: { fr: 'Chargement...', en: 'Loading...' },
  language: { fr: 'Langue', en: 'Language' },
  french: { fr: 'Français', en: 'French' },
  english: { fr: 'Anglais', en: 'English' },
  
  // Mobile navigation
  entry: { fr: 'Saisie', en: 'Entry' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
