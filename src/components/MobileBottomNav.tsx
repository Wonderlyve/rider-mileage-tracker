
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, User, Plus } from 'lucide-react';

export function MobileBottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (!user || user.type !== 'rider') return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-3 h-16">
        <Link
          to="/rider/home"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/rider/home')
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs font-medium">{t('home')}</span>
        </Link>
        
        <Link
          to="/rider/entry"
          className="flex flex-col items-center justify-center space-y-1 text-green-600 hover:text-green-700"
        >
          <div className="bg-green-600 rounded-full p-2">
            <Plus className="h-5 w-5 text-white" />
          </div>
          <span className="text-xs font-medium">{t('entry')}</span>
        </Link>
        
        <Link
          to="/rider/profile"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/rider/profile')
              ? 'text-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">{t('profile')}</span>
        </Link>
      </div>
    </div>
  );
}
