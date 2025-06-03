
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Camera, MapPin, Clock } from 'lucide-react';
import { User, MileageEntry } from '@/types';
import localForage from 'localforage';

export function RiderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rider, setRider] = useState<User | null>(null);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiderData();
  }, [id]);

  const loadRiderData = async () => {
    try {
      if (!id) return;
      
      const riders = await localForage.getItem<User[]>('riders') || [];
      const foundRider = riders.find(r => r.id === id);
      setRider(foundRider || null);

      const allEntries = await localForage.getItem<MileageEntry[]>('mileageEntries') || [];
      const riderEntries = allEntries.filter(entry => entry.riderId === id);
      setEntries(riderEntries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading rider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'ouverture': return 'Ouverture';
      case 'fermeture': return 'Fermeture';
      case 'carburant': return 'Carburant';
      default: return type;
    }
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'ouverture': return 'bg-green-100 text-green-800';
      case 'fermeture': return 'bg-red-100 text-red-800';
      case 'carburant': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
            className="text-blue-600 hover:text-blue-800"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              {rider.photo && (
                <img
                  src={rider.photo}
                  alt={rider.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{rider.name}</h1>
                <p className="text-gray-600">{rider.email}</p>
                {rider.matricule && (
                  <p className="text-sm text-gray-500">Matricule: {rider.matricule}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Historique des relevés ({entries.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {entries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun relevé de kilométrage trouvé
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEntryTypeColor(entry.type)}`}>
                          {getEntryTypeLabel(entry.type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Vacation {entry.shift}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {entry.kilometrage.toLocaleString()} km
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(entry.timestamp)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    {entry.photo && (
                      <div className="ml-4">
                        <img
                          src={entry.photo}
                          alt="Photo du compteur"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
