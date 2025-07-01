
import { useState, useEffect } from 'react';
import { User, EquipmentEntry } from '@/types';
import localForage from 'localforage';
import { ImageModal } from '@/components/ImageModal';
import { Camera, Search, Filter, Eye, Calendar, Clock, MapPin } from 'lucide-react';

export function EquipmentManagement() {
  const [equipmentEntries, setEquipmentEntries] = useState<EquipmentEntry[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRider, setSelectedRider] = useState('');
  const [selectedModal, setSelectedModal] = useState<{ imageUrl: string; alt: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const entriesData = await localForage.getItem<EquipmentEntry[]>('equipmentEntries') || [];
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      
      setEquipmentEntries(entriesData.sort((a, b) => b.timestamp - a.timestamp));
      setRiders(ridersData);
    } catch (error) {
      console.error('Error loading equipment data:', error);
    } finally {
      setLoading(false);
    }
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

  const openImageModal = (imageUrl: string, alt: string) => {
    setSelectedModal({ imageUrl, alt });
  };

  const closeImageModal = () => {
    setSelectedModal(null);
  };

  const filteredEntries = equipmentEntries.filter(entry => {
    const riderName = getRiderName(entry.riderId).toLowerCase();
    const matchesSearch = riderName.includes(searchTerm.toLowerCase()) ||
                         entry.motorcycleMatricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.phoneId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || 
                       new Date(entry.timestamp).toDateString() === new Date(selectedDate).toDateString();
    
    const matchesRider = !selectedRider || entry.riderId === selectedRider;

    return matchesSearch && matchesDate && matchesRider;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filtres des équipements</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nom, matricule, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
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
            Équipements enregistrés ({filteredEntries.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucun enregistrement d'équipement trouvé
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-medium text-gray-900">
                        {getRiderName(entry.riderId)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Vacation {entry.shift}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(entry.timestamp)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(entry.timestamp)}
                        </div>
                        <div>
                          <strong>Moto:</strong> {entry.motorcycleMatricule}
                        </div>
                        <div>
                          <strong>Téléphone:</strong> {entry.phoneId}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${entry.hasHelmet ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          Casque: {entry.hasHelmet ? 'Oui' : 'Non'}
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${entry.hasMotorcycleDocument ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          Documents: {entry.hasMotorcycleDocument ? 'Oui' : 'Non'}
                        </div>
                        <div className="flex items-center">
                          <span className={`w-3 h-3 rounded-full mr-2 ${entry.hasExchangeMoney ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          Monnaie d'échange: {entry.hasExchangeMoney ? 'Oui' : 'Non'}
                        </div>
                        {entry.hasExchangeMoney && (
                          <div className="ml-5">
                            {entry.exchangeMoneyUSD && (
                              <div>USD: ${entry.exchangeMoneyUSD}</div>
                            )}
                            {entry.exchangeMoneyCDF && (
                              <div>CDF: {entry.exchangeMoneyCDF.toLocaleString()}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  {entry.matriculationPhoto && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Photo matriculation</p>
                      <button
                        onClick={() => openImageModal(entry.matriculationPhoto, 'Photo matriculation')}
                        className="relative group"
                      >
                        <img
                          src={entry.matriculationPhoto}
                          alt="Photo matriculation"
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {entry.mileagePhoto && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Photo kilométrage</p>
                      <button
                        onClick={() => openImageModal(entry.mileagePhoto, 'Photo kilométrage')}
                        className="relative group"
                      >
                        <img
                          src={entry.mileagePhoto}
                          alt="Photo kilométrage"
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
