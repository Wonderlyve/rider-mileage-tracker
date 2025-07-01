import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Calendar, Download, Eye, Search, UserPlus, FileText, Package, Settings } from 'lucide-react';
import { User, MileageEntry, EquipmentEntry } from '@/types';
import localForage from 'localforage';
import { RiderManagement } from '@/components/RiderManagement';
import { EquipmentManagement } from '@/components/EquipmentManagement';
import { AdminUserManagement } from '@/components/AdminUserManagement';
import { useLanguage } from '@/contexts/LanguageContext';

export function AdminDashboard() {
  const { t } = useLanguage();
  const [riders, setRiders] = useState<User[]>([]);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [equipmentEntries, setEquipmentEntries] = useState<EquipmentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'riders' | 'equipment' | 'admin-users'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      const entriesData = await localForage.getItem<MileageEntry[]>('mileageEntries') || [];
      const equipmentData = await localForage.getItem<EquipmentEntry[]>('equipmentEntries') || [];
      
      setRiders(ridersData);
      setEntries(entriesData);
      setEquipmentEntries(equipmentData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRiders = riders.filter(rider =>
    rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rider.matricule && rider.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRiderStats = (riderId: string) => {
    const riderEntries = entries.filter(entry => entry.riderId === riderId);
    return {
      totalEntries: riderEntries.length,
      lastEntry: riderEntries.length > 0 ? Math.max(...riderEntries.map(e => e.timestamp)) : null
    };
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const getRiderName = (riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    return rider ? rider.name : 'Rider inconnu';
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'ouverture': return t('opening');
      case 'fermeture': return t('closing');
      case 'carburant': return t('fuel');
      default: return type;
    }
  };

  const exportToCSV = () => {
    // Create detailed CSV with each entry on its own line
    const csvRows = [
      ['Type', 'Nom du Rider', 'Email', 'Matricule', 'Date', 'Heure', 'Vacation', 'Kilométrage', 'Montant (CDF)', 'Photo'].join(',')
    ];

    // Add mileage entries
    entries.forEach(entry => {
      const rider = riders.find(r => r.id === entry.riderId);
      csvRows.push([
        getEntryTypeLabel(entry.type),
        rider?.name || 'Inconnu',
        rider?.email || '',
        rider?.matricule || '',
        formatDate(entry.timestamp),
        new Date(entry.timestamp).toLocaleTimeString('fr-FR'),
        entry.shift.toString(),
        entry.kilometrage.toString(),
        entry.amount ? entry.amount.toString() : '',
        entry.photo ? 'Oui' : 'Non'
      ].join(','));
    });

    // Add equipment entries
    equipmentEntries.forEach(entry => {
      const rider = riders.find(r => r.id === entry.riderId);
      csvRows.push([
        'Équipement',
        rider?.name || 'Inconnu',
        rider?.email || '',
        rider?.matricule || '',
        formatDate(entry.timestamp),
        new Date(entry.timestamp).toLocaleTimeString('fr-FR'),
        entry.shift.toString(),
        '', // No mileage for equipment
        entry.hasExchangeMoney ? `USD: ${entry.exchangeMoneyUSD || 0}, CDF: ${entry.exchangeMoneyCDF || 0}` : '',
        (entry.matriculationPhoto && entry.mileagePhoto) ? 'Oui' : 'Non'
      ].join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_complet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('adminDashboard')}</h1>
          <p className="text-gray-600">{t('riderManagement')} et suivi des kilométrages</p>
        </div>

        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('overview')}
          </button>
          <button
            onClick={() => setActiveTab('riders')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'riders'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('riderManagement')}
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'equipment'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Équipements
          </button>
          <button
            onClick={() => setActiveTab('admin-users')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'admin-users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Administrateurs
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('totalRiders')}</p>
                    <p className="text-2xl font-bold text-gray-900">{riders.filter(r => r.type === 'rider').length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('totalEntries')}</p>
                    <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Équipements</p>
                    <p className="text-2xl font-bold text-gray-900">{equipmentEntries.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{t('today')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {entries.filter(e => {
                        const today = new Date().toDateString();
                        const entryDate = new Date(e.timestamp).toDateString();
                        return today === entryDate;
                      }).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <Link
                  to="/admin/reports"
                  className="flex items-center justify-center w-full p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t('viewReports')}
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <button
                  onClick={exportToCSV}
                  className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('exportCSV')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                    {t('ridersList')}
                  </h2>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder={t('searchRider')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rider
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('matricule')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relevés
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dernier relevé
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRiders.filter(rider => rider.type === 'rider').map((rider) => {
                      const stats = getRiderStats(rider.id);
                      return (
                        <tr key={rider.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {rider.photo && (
                                <img
                                  className="h-10 w-10 rounded-full object-cover mr-3"
                                  src={rider.photo}
                                  alt={rider.name}
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {rider.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{rider.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {rider.matricule || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.totalEntries}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.lastEntry ? formatDate(stats.lastEntry) : 'Aucun'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              to={`/admin/rider/${rider.id}`}
                              className="flex items-center text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('viewDetails')}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRiders.filter(rider => rider.type === 'rider').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucun rider trouvé pour cette recherche' : 'Aucun rider enregistré'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'riders' && <RiderManagement />}
        {activeTab === 'equipment' && <EquipmentManagement />}
        {activeTab === 'admin-users' && <AdminUserManagement />}
      </div>
    </div>
  );
}
