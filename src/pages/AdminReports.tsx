
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Filter, Camera } from 'lucide-react';
import { User, MileageEntry } from '@/types';
import localForage from 'localforage';
import { ImageModal } from '@/components/ImageModal';

export function AdminReports() {
  const navigate = useNavigate();
  const [riders, setRiders] = useState<User[]>([]);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MileageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [selectedModal, setSelectedModal] = useState<{ imageUrl: string; alt: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [entries, selectedDate, selectedRider]);

  const loadData = async () => {
    try {
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      const entriesData = await localForage.getItem<MileageEntry[]>('mileageEntries') || [];
      
      setRiders(ridersData);
      setEntries(entriesData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = [...entries];

    if (selectedDate) {
      const filterDate = new Date(selectedDate).toDateString();
      filtered = filtered.filter(entry => 
        new Date(entry.timestamp).toDateString() === filterDate
      );
    }

    if (selectedRider) {
      filtered = filtered.filter(entry => entry.riderId === selectedRider);
    }

    setFilteredEntries(filtered);
  };

  const getRiderName = (riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    return rider ? rider.name : 'Rider inconnu';
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

  const openImageModal = (imageUrl: string, alt: string) => {
    setSelectedModal({ imageUrl, alt });
  };

  const closeImageModal = () => {
    setSelectedModal(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports des Relevés</h1>
          <p className="text-gray-600">Consultation de tous les relevés de kilométrage</p>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rider
                </label>
                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Tous les riders</option>
                  {riders.map(rider => (
                    <option key={rider.id} value={rider.id}>{rider.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Relevés ({filteredEntries.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredEntries.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Aucun relevé trouvé pour les critères sélectionnés
              </div>
            ) : (
              filteredEntries.map((entry) => (
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
                        <span className="text-sm font-medium text-gray-700">
                          {getRiderName(entry.riderId)}
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
                        <button
                          onClick={() => openImageModal(entry.photo, `Photo du compteur - ${getRiderName(entry.riderId)}`)}
                          className="relative group"
                        >
                          <img
                            src={entry.photo}
                            alt="Photo du compteur"
                            className="h-16 w-16 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedModal && (
        <ImageModal
          isOpen={true}
          onClose={closeImageModal}
          imageUrl={selectedModal.imageUrl}
          alt={selectedModal.alt}
        />
      )}
    </div>
  );
}
