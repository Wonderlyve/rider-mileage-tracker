
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '@/utils/storage';
import { exportToCSV } from '@/utils/csv';
import { User, MileageEntry } from '@/types';
import { Users, Download, Calendar, Filter, BarChart3 } from 'lucide-react';

export function AdminDashboard() {
  const [riders, setRiders] = useState<User[]>([]);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MileageEntry[]>([]);
  const [filterType, setFilterType] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [entries, filterType, customDate]);

  const loadData = async () => {
    try {
      const [ridersData, entriesData] = await Promise.all([
        storage.getRiders(),
        storage.getEntries()
      ]);
      setRiders(ridersData);
      setEntries(entriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = () => {
    const now = new Date();
    let filtered = [...entries];

    switch (filterType) {
      case 'today':
        const today = now.toISOString().split('T')[0];
        filtered = entries.filter(entry => entry.date === today);
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = entries.filter(entry => new Date(entry.timestamp) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = entries.filter(entry => new Date(entry.timestamp) >= monthAgo);
        break;
      case 'custom':
        if (customDate) {
          filtered = entries.filter(entry => entry.date === customDate);
        }
        break;
    }

    setFilteredEntries(filtered.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleExport = () => {
    const filename = `kilometrage_${filterType}`;
    exportToCSV(filteredEntries, riders, filename);
  };

  const getTotalKilometers = () => {
    return filteredEntries.reduce((total, entry) => total + entry.kilometrage, 0);
  };

  const getEntriesCount = () => {
    return filteredEntries.length;
  };

  const getActiveRiders = () => {
    const activeRiderIds = new Set(filteredEntries.map(entry => entry.riderId));
    return activeRiderIds.size;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Tableau de bord administrateur
          </h1>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="custom">Date personnalisée</option>
            </select>

            {filterType === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Riders actifs</p>
                <p className="text-2xl font-bold text-gray-900">{getActiveRiders()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total KM</p>
                <p className="text-2xl font-bold text-gray-900">{getTotalKilometers().toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saisies</p>
                <p className="text-2xl font-bold text-gray-900">{getEntriesCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                <Filter className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Période</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{filterType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Riders Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Riders</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {riders.map((rider) => {
                const riderEntries = filteredEntries.filter(entry => entry.riderId === rider.id);
                const totalKm = riderEntries.reduce((sum, entry) => sum + entry.kilometrage, 0);
                
                return (
                  <Link
                    key={rider.id}
                    to={`/admin/rider/${rider.id}`}
                    className="block bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={rider.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'}
                        alt={rider.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {rider.name}
                        </h3>
                        <p className="text-sm text-gray-600">{rider.matricule}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-500">
                            {riderEntries.length} saisie{riderEntries.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {totalKm.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
</lov-page>

<lov-write file_path="src/pages/RiderDetails.tsx">
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '@/utils/storage';
import { User, MileageEntry } from '@/types';
import { ArrowLeft, Clock, Fuel, Calendar, Camera } from 'lucide-react';

export function RiderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rider, setRider] = useState<User | null>(null);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    loadRiderData();
  }, [id]);

  const loadRiderData = async () => {
    if (!id) return;

    try {
      const [riders, allEntries] = await Promise.all([
        storage.getRiders(),
        storage.getEntries()
      ]);

      const riderData = riders.find(r => r.id === id);
      setRider(riderData || null);

      const riderEntries = allEntries.filter(entry => entry.riderId === id);
      setEntries(riderEntries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading rider data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ouverture':
      case 'fermeture':
        return <Clock className="h-5 w-5" />;
      case 'carburant':
        return <Fuel className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ouverture':
        return 'text-green-600 bg-green-100';
      case 'fermeture':
        return 'text-red-600 bg-red-100';
      case 'carburant':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rider non trouvé</h2>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Détails du rider</h1>
        </div>

        {/* Rider Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <img
                src={rider.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face'}
                alt={rider.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-blue-100"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{rider.name}</h2>
                <p className="text-lg text-gray-600 mb-4">{rider.email}</p>
                <p className="text-blue-600 font-medium">Matricule: {rider.matricule}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                  <p className="text-sm text-gray-600">Saisies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {entries.reduce((sum, entry) => sum + entry.kilometrage, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">KM total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Entries History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Historique des saisies</h3>
          </div>
          
          <div className="p-6">
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune saisie trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{entry.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(entry.timestamp).toLocaleTimeString('fr-FR')} - Shift {entry.shift}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{entry.kilometrage.toLocaleString()} km</p>
                      </div>
                      <button
                        onClick={() => setSelectedPhoto(entry.photo)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Camera className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Photo Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Photo du compteur</h3>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <img
                  src={selectedPhoto}
                  alt="Photo du compteur"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
