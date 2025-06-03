
import { useAuth } from '@/contexts/AuthContext';
import { User, Bike, Calendar, BarChart3 } from 'lucide-react';

export function RiderProfile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="relative">
                <img
                  src={user.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                  alt={user.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-blue-100"
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <p className="text-lg text-gray-600 mb-4">{user.email}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Bike className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Matricule: {user.matricule}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Rider</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Saisies ce mois</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">KM parcourus</p>
                <p className="text-2xl font-bold text-gray-900">2,450</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 text-orange-600 p-3 rounded-lg">
                <Bike className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Shifts terminés</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Informations du compte</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricule de la moto
                </label>
                <input
                  type="text"
                  value={user.matricule}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div className="pt-4">
                <p className="text-sm text-gray-500">
                  Pour modifier vos informations, contactez votre administrateur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
