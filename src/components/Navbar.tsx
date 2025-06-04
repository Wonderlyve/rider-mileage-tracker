
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Home, FileText } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user.type === 'admin' ? '/admin/dashboard' : '/rider/home'} className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/7c91dcb6-ae80-4998-9cbb-565facfffb57.png" 
                alt="Logo Kilométrage" 
                className="h-8 w-8"
              />
              <span className="text-xl font-bold text-gray-900">Kilométrage</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user.type === 'rider' && (
              <div className="hidden md:flex space-x-4">
                <Link
                  to="/rider/home"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/rider/home')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Home className="h-4 w-4 inline mr-1" />
                  Accueil
                </Link>
                <Link
                  to="/rider/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/rider/profile')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-1" />
                  Profil
                </Link>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {user.photo && (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {user.type === 'rider' && (
        <div className="md:hidden bg-gray-50 border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/rider/home"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/rider/home')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home className="h-4 w-4 inline mr-2" />
              Accueil
            </Link>
            <Link
              to="/rider/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/rider/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              Profil
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
