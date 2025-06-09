
import { useState, useEffect } from 'react';
import { Download, Eye, Search, Calendar } from 'lucide-react';
import { EquipmentEntry, User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageModal } from '@/components/ImageModal';
import localForage from 'localforage';

export function EquipmentManagement() {
  const [equipmentEntries, setEquipmentEntries] = useState<EquipmentEntry[]>([]);
  const [riders, setRiders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const equipmentData = await localForage.getItem<EquipmentEntry[]>('equipmentEntries') || [];
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      
      setEquipmentEntries(equipmentData);
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

  const filteredEntries = equipmentEntries.filter(entry => {
    const riderName = getRiderName(entry.riderId).toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      riderName.includes(search) ||
      entry.motorcycleMatricule.toLowerCase().includes(search) ||
      entry.phoneId.toLowerCase().includes(search)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        'Date',
        'Rider',
        'Matricule Moto',
        'ID Téléphone',
        'Casque',
        'Document Moto',
        'Monnaie d\'échange'
      ].join(','),
      ...filteredEntries.map(entry => [
        formatDate(entry.timestamp),
        getRiderName(entry.riderId),
        entry.motorcycleMatricule,
        entry.phoneId,
        entry.hasHelmet ? 'Oui' : 'Non',
        entry.hasMotorcycleDocument ? 'Oui' : 'Non',
        entry.hasExchangeMoney ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `equipments_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export réussi",
      description: "Les données ont été exportées en CSV"
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Gestion des Équipements</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <Button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm ? 'Aucun équipement trouvé pour cette recherche' : 'Aucun équipement enregistré'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Matricule Moto</TableHead>
                  <TableHead>ID Téléphone</TableHead>
                  <TableHead>Casque</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Monnaie</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(entry.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getRiderName(entry.riderId)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {entry.motorcycleMatricule}
                      </span>
                    </TableCell>
                    <TableCell>{entry.phoneId}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.hasHelmet 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.hasHelmet ? 'Oui' : 'Non'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.hasMotorcycleDocument 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.hasMotorcycleDocument ? 'Oui' : 'Non'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.hasExchangeMoney 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {entry.hasExchangeMoney ? 'Oui' : 'Non'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleImageClick(entry.matriculationPhoto)}
                          className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Matriculation
                        </button>
                        <button
                          onClick={() => handleImageClick(entry.mileagePhoto)}
                          className="flex items-center px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Kilométrage
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <ImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={selectedImage}
      />
    </div>
  );
}
