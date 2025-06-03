
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { storage } from '@/utils/storage';
import { MileageEntry } from '@/types';
import { Plus, Clock, Fuel, Calendar } from 'lucide-react';

export function RiderHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState<MileageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentEntries();
  }, [user]);

  const loadRecentEntries = async () => {
    if (!user) return;
    
    try {
      const entries = await storage.getEntriesByRider(user.id);
      const sorted = entries.sort((a, b) => b.timestamp - a.timestamp);
      setRecentEntries(sorted.slice(0, 5));
    } catch (error) {
      console.error('Error loading entries:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-8">
          <div className="flex items-center space-x-4">
            {user?.photo && (
              <img
                src={user.photo}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-white"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">Bonjour, {user?.name}</h1>
              <p className="text-blue-100">Matricule: {user?.matricule}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/rider/entry?type=shift')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Saisie Shift</h3>
                <p className="text-gray-600">Ouverture / Fermeture</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/rider/entry?type=carburant')}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Fuel className="h-6 w-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Ravitaillement</h3>
                <p className="text-gray-600">Avant carburant</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Entries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Saisies récentes</h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune saisie pour le moment</p>
                <button
                  onClick={() => navigate('/rider/entry')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Première saisie
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                        {getTypeIcon(entry.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{entry.type}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.timestamp).toLocaleDateString('fr-FR')} - Shift {entry.shift}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{entry.kilometrage.toLocaleString()} km</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
