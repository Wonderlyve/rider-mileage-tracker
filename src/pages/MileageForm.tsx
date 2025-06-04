
import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storage } from '@/utils/storage';
import { MileageEntry } from '@/types';
import { Camera, Upload, Save, ArrowLeft } from 'lucide-react';

export function MileageForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultType = searchParams.get('type') === 'carburant' ? 'carburant' : 'ouverture';

  const [formData, setFormData] = useState({
    type: defaultType as 'ouverture' | 'fermeture' | 'carburant',
    shift: 1 as 1 | 2,
    kilometrage: '',
    amount: '',
    photo: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, photo: result }));
        setPreviewUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKilometrageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, kilometrage: value }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, amount: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.photo || !formData.kilometrage) return;

    setIsLoading(true);

    try {
      const entry: MileageEntry = {
        id: Date.now().toString(),
        riderId: user.id,
        type: formData.type,
        shift: formData.shift,
        kilometrage: parseInt(formData.kilometrage),
        amount: formData.type === 'carburant' && formData.amount ? parseInt(formData.amount) : undefined,
        photo: formData.photo,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };

      await storage.saveEntry(entry);
      navigate('/rider/home');
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate('/rider/home')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('newEntry')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('entryType')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'ouverture' }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'ouverture'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium">{t('opening')}</p>
                  <p className="text-sm text-gray-500">{t('shiftStart')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'fermeture' }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'fermeture'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium">{t('closing')}</p>
                  <p className="text-sm text-gray-500">{t('shiftEnd')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'carburant' }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.type === 'carburant'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium">{t('fuel')}</p>
                  <p className="text-sm text-gray-500">{t('beforeRefuel')}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Shift Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('shiftNumber')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, shift: 1 }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.shift === 1
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium">Shift 1</p>
                  <p className="text-sm text-gray-500">{t('morning')}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, shift: 2 }))}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.shift === 2
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <p className="font-medium">Shift 2</p>
                  <p className="text-sm text-gray-500">{t('afternoon')}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Kilometrage */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label htmlFor="kilometrage" className="block text-sm font-medium text-gray-700 mb-2">
              {t('currentMileage')}
            </label>
            <input
              type="text"
              id="kilometrage"
              value={formData.kilometrage}
              onChange={handleKilometrageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 45230"
              required
            />
          </div>

          {/* Amount for Fuel */}
          {formData.type === 'carburant' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                {t('amountCDF')}
              </label>
              <input
                type="text"
                id="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 50000"
              />
            </div>
          )}

          {/* Photo Upload */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('counterPhoto')}
            </label>
            
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="h-5 w-5" />
                  <span>{t('changePhoto')}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <Upload className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">{t('takePhoto')}</p>
                <p className="text-sm">{t('ofMileageCounter')}</p>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!formData.photo || !formData.kilometrage || isLoading}
            className="w-full flex items-center justify-center space-x-2 py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>{isLoading ? t('saving') : t('saveEntry')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
