
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Calendar, Download, Eye, Search } from 'lucide-react';
import { User, MileageEntry } from '@/types';
import localForage from 'localforage';

export function AdminDashboard() {
  const [riders, setRiders] = useState<User[]>([]);
  const [entries, setEntries] = useState<MileageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      const entriesData = await localForage.getItem<MileageEntry[]>('mileageEntries') || [];
      
      setRiders(ridersData);
      setEntries(entriesData);
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

  const exportToCSV = () => {
    const csvContent = [
      ['Nom', 'Email', 'Matricule', 'Nombre de relevés', 'Dernier relevé'].join(','),
      ...filteredRiders.map(rider => {
        const stats = getRiderStats(rider.id);
        return [
          rider.name,
          rider.email,
          rider.matricule || '',
          stats.totalEntries.toString(),
          stats.lastEntry ? formatDate(stats.lastEntry) : 'Aucun'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riders_report_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord administrateur</h1>
          <p className="text-gray-600">Gestion des riders et suivi des kilométrages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Riders</p>
                <p className="text-2xl font-bold text-gray-900">{riders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Relevés</p>
                <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
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
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
                Liste des Riders
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un rider..."
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
                    Matricule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relevés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier relevé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRiders.map((rider) => {
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
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRiders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'Aucun rider trouvé pour cette recherche' : 'Aucun rider enregistré'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
