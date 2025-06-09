
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EquipmentEntry } from '@/types';
import localForage from 'localforage';

export function EquipmentForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    motorcycleMatricule: '',
    phoneId: '',
    hasHelmet: false,
    hasMotorcycleDocument: false,
    hasExchangeMoney: false
  });
  
  const [matriculationPhoto, setMatriculationPhoto] = useState<string>('');
  const [mileagePhoto, setMileagePhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const matriculationInputRef = useRef<HTMLInputElement>(null);
  const mileageInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (type: 'matriculation' | 'mileage', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'matriculation') {
          setMatriculationPhoto(result);
        } else {
          setMileagePhoto(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.motorcycleMatricule || !formData.phoneId || !matriculationPhoto || !mileagePhoto) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et prendre les photos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const equipmentEntry: EquipmentEntry = {
        id: Date.now().toString(),
        riderId: user!.id,
        motorcycleMatricule: formData.motorcycleMatricule,
        phoneId: formData.phoneId,
        hasHelmet: formData.hasHelmet,
        hasMotorcycleDocument: formData.hasMotorcycleDocument,
        hasExchangeMoney: formData.hasExchangeMoney,
        matriculationPhoto,
        mileagePhoto,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };

      const existingEntries = await localForage.getItem<EquipmentEntry[]>('equipmentEntries') || [];
      await localForage.setItem('equipmentEntries', [...existingEntries, equipmentEntry]);

      toast({
        title: "Succès",
        description: "Équipement enregistré avec succès"
      });

      navigate('/rider/home');
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/rider/home" />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Enregistrement des Équipements</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matricule de la moto *
              </label>
              <input
                type="text"
                value={formData.motorcycleMatricule}
                onChange={(e) => setFormData({ ...formData, motorcycleMatricule: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez le matricule"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID du téléphone *
              </label>
              <input
                type="text"
                value={formData.phoneId}
                onChange={(e) => setFormData({ ...formData, phoneId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrez l'ID du téléphone"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="helmet"
                  checked={formData.hasHelmet}
                  onChange={(e) => setFormData({ ...formData, hasHelmet: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="helmet" className="ml-2 block text-sm text-gray-900">
                  Casque
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="document"
                  checked={formData.hasMotorcycleDocument}
                  onChange={(e) => setFormData({ ...formData, hasMotorcycleDocument: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="document" className="ml-2 block text-sm text-gray-900">
                  Document moto
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="money"
                  checked={formData.hasExchangeMoney}
                  onChange={(e) => setFormData({ ...formData, hasExchangeMoney: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="money" className="ml-2 block text-sm text-gray-900">
                  Monnaie d'échange
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de matriculation *
              </label>
              {matriculationPhoto ? (
                <div className="space-y-2">
                  <img
                    src={matriculationPhoto}
                    alt="Matriculation"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => matriculationInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Changer la photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => matriculationInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Upload className="h-8 w-8 mr-2" />
                  Prendre une photo de matriculation
                </Button>
              )}
              <input
                ref={matriculationInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture('matriculation', e)}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo du kilométrage *
              </label>
              {mileagePhoto ? (
                <div className="space-y-2">
                  <img
                    src={mileagePhoto}
                    alt="Kilométrage"
                    className="w-full h-48 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => mileageInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Changer la photo
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mileageInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Upload className="h-8 w-8 mr-2" />
                  Prendre une photo du kilométrage
                </Button>
              )}
              <input
                ref={mileageInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture('mileage', e)}
                className="hidden"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les équipements'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
