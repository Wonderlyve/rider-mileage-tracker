
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  // App name
  appName: { fr: 'Gestion de Riders', en: 'Rider Management' },
  appSubtitle: { fr: 'Système de gestion des riders', en: 'Rider management system' },
  
  // Navigation
  home: { fr: 'Accueil', en: 'Home' },
  profile: { fr: 'Profil', en: 'Profile' },
  logout: { fr: 'Déconnexion', en: 'Logout' },
  back: { fr: 'Retour', en: 'Back' },
  
  // Login page
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
  
  // Equipment
  equipment: { fr: 'Équipements', en: 'Equipment' },
  equipmentForm: { fr: 'Formulaire d\'équipement', en: 'Equipment Form' },
  motorcycleRegistration: { fr: 'Matricule de la moto', en: 'Motorcycle Registration' },
  phoneId: { fr: 'ID du téléphone', en: 'Phone ID' },
  helmet: { fr: 'Casque', en: 'Helmet' },
  motorcycleDocuments: { fr: 'Documents de la moto', en: 'Motorcycle Documents' },
  exchangeMoney: { fr: 'Monnaie d\'échange', en: 'Exchange Money' },
  exchangeMoneyUSD: { fr: 'Montant en USD', en: 'Amount in USD' },
  exchangeMoneyCDF: { fr: 'Montant en CDF', en: 'Amount in CDF' },
  registrationPhoto: { fr: 'Photo de matriculation', en: 'Registration Photo' },
  mileagePhoto: { fr: 'Photo de kilométrage', en: 'Mileage Photo' },
  saveEquipment: { fr: 'Enregistrer l\'équipement', en: 'Save Equipment' },
  
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
  administrators: { fr: 'Administrateurs', en: 'Administrators' },
  adminUserManagement: { fr: 'Gestion des comptes administrateurs', en: 'Administrator Account Management' },
  newAdministrator: { fr: 'Nouvel administrateur', en: 'New Administrator' },
  editAdministrator: { fr: 'Modifier administrateur', en: 'Edit Administrator' },
  confirmPassword: { fr: 'Confirmer le mot de passe', en: 'Confirm Password' },
  passwordsDontMatch: { fr: 'Les mots de passe ne correspondent pas', en: 'Passwords do not match' },
  saveError: { fr: 'Erreur lors de la sauvegarde', en: 'Error while saving' },
  deleteConfirm: { fr: 'Êtes-vous sûr de vouloir supprimer cet administrateur ?', en: 'Are you sure you want to delete this administrator?' },
  deleteError: { fr: 'Erreur lors de la suppression', en: 'Error while deleting' },
  creationDate: { fr: 'Date de création', en: 'Creation Date' },
  noAdministrators: { fr: 'Aucun administrateur enregistré', en: 'No administrators registered' },
  
  // Rider Profile
  myProfile: { fr: 'Mon Profil', en: 'My Profile' },
  personalInfo: { fr: 'Informations personnelles', en: 'Personal information' },
  statistics: { fr: 'Statistiques', en: 'Statistics' },
  totalEntriesCount: { fr: 'Total des relevés', en: 'Total entries' },
  lastEntry: { fr: 'Dernier relevé', en: 'Last entry' },
  never: { fr: 'Jamais', en: 'Never' },
  
  // Common fields
  name: { fr: 'Nom', en: 'Name' },
  fullName: { fr: 'Nom complet', en: 'Full Name' },
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
  contact: { fr: 'Contact', en: 'Contact' },
  rider: { fr: 'Rider', en: 'Rider' },
  
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
  entry: { fr: 'Saisie', en: 'Entry' },
  
  // Filters and search
  filters: { fr: 'Filtres', en: 'Filters' },
  search: { fr: 'Recherche', en: 'Search' },
  searchPlaceholder: { fr: 'Nom, matricule, téléphone...', en: 'Name, registration, phone...' },
  allRidersFilter: { fr: 'Tous les riders', en: 'All riders' },
  noResultsFound: { fr: 'Aucun résultat trouvé', en: 'No results found' },
  noEquipmentFound: { fr: 'Aucun enregistrement d\'équipement trouvé', en: 'No equipment records found' },
  noSearchResults: { fr: 'Aucun rider trouvé pour cette recherche', en: 'No rider found for this search' },
  noRidersRegistered: { fr: 'Aucun rider enregistré', en: 'No riders registered' },
  
  // Equipment specific
  equipmentRecords: { fr: 'Équipements enregistrés', en: 'Equipment Records' },
  equipmentFilters: { fr: 'Filtres des équipements', en: 'Equipment Filters' },
  motorcycleInfo: { fr: 'Informations moto', en: 'Motorcycle Information' },
  phoneInfo: { fr: 'Informations téléphone', en: 'Phone Information' },
  documents: { fr: 'Documents', en: 'Documents' },
  
  // Status and states
  recorded: { fr: 'Enregistré', en: 'Recorded' },
  pending: { fr: 'En attente', en: 'Pending' },
  completed: { fr: 'Terminé', en: 'Completed' },
  active: { fr: 'Actif', en: 'Active' },
  inactive: { fr: 'Inactif', en: 'Inactive' },
  
  // Time periods
  morning: { fr: 'Matin', en: 'Morning' },
  afternoon: { fr: 'Après-midi', en: 'Afternoon' },
  vacation: { fr: 'Vacation', en: 'Shift' },
  
  // Messages
  entrySavedSuccessfully: { fr: 'Saisie enregistrée avec succès', en: 'Entry saved successfully' },
  equipmentSavedSuccessfully: { fr: 'Équipement enregistré avec succès', en: 'Equipment saved successfully' },
  dataLoadError: { fr: 'Erreur lors du chargement des données', en: 'Error loading data' },
  
  // WhatsApp and reporting
  whatsappReport: { fr: 'Rapport WhatsApp', en: 'WhatsApp Report' },
  sendReport: { fr: 'Envoyer le rapport', en: 'Send Report' },
  reportGenerated: { fr: 'Rapport généré', en: 'Report generated' }
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
