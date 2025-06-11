
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { BackButton } from '@/components/BackButton';
import { Camera, Upload, Send, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    hasExchangeMoney: false,
    exchangeMoneyUSD: '',
    exchangeMoneyCDF: ''
  });
  
  const [matriculationPhoto, setMatriculationPhoto] = useState<string>('');
  const [mileagePhoto, setMileagePhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedEntry, setSavedEntry] = useState<EquipmentEntry | null>(null);
  
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

    if (formData.hasExchangeMoney && (!formData.exchangeMoneyUSD || !formData.exchangeMoneyCDF)) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner les montants USD et CDF pour la monnaie d'échange",
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
        exchangeMoneyUSD: formData.hasExchangeMoney ? parseFloat(formData.exchangeMoneyUSD) : undefined,
        exchangeMoneyCDF: formData.hasExchangeMoney ? parseFloat(formData.exchangeMoneyCDF) : undefined,
        matriculationPhoto,
        mileagePhoto,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0]
      };

      const existingEntries = await localForage.getItem<EquipmentEntry[]>('equipmentEntries') || [];
      await localForage.setItem('equipmentEntries', [...existingEntries, equipmentEntry]);

      setSavedEntry(equipmentEntry);

      toast({
        title: "Succès",
        description: "Équipement enregistré avec succès"
      });

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

  const shareOnWhatsApp = async () => {
    if (!savedEntry) return;

    const reportText = `🏍️ *RAPPORT D'ÉQUIPEMENT*

👤 *Chauffeur:* ${user?.name}
🏷️ *Matricule:* ${user?.matricule}
📅 *Date:* ${new Date(savedEntry.timestamp).toLocaleDateString('fr-FR')}

📋 *DÉTAILS:*
🏍️ Matricule moto: ${savedEntry.motorcycleMatricule}
📱 ID téléphone: ${savedEntry.phoneId}

✅ *ÉQUIPEMENTS:*
${savedEntry.hasHelmet ? '✅' : '❌'} Casque
${savedEntry.hasMotorcycleDocument ? '✅' : '❌'} Document moto
${savedEntry.hasExchangeMoney ? '✅' : '❌'} Monnaie d'échange

${savedEntry.hasExchangeMoney ? `💰 *MONNAIE D'ÉCHANGE:*
USD: $${savedEntry.exchangeMoneyUSD}
CDF: ${savedEntry.exchangeMoneyCDF?.toLocaleString()} FC` : ''}

📸 *PHOTOS JOINTES:*
- Photo matriculation
- Photo kilométrage`;

    try {
      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare) {
        // Convert base64 images to files
        const matriculationBlob = await fetch(savedEntry.matriculationPhoto).then(r => r.blob());
        const mileageBlob = await fetch(savedEntry.mileagePhoto).then(r => r.blob());
        
        const matriculationFile = new File([matriculationBlob], 'matriculation.jpg', { type: 'image/jpeg' });
        const mileageFile = new File([mileageBlob], 'kilometrage.jpg', { type: 'image/jpeg' });
        
        const shareData = {
          title: 'Rapport d\'équipement',
          text: reportText,
          files: [matriculationFile, mileageFile]
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }
      
      // Fallback: Use WhatsApp URL with text only
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
      window.open(whatsappUrl, '_blank');
      
      // Show message about photos
      toast({
        title: "Photos à partager",
        description: "Veuillez partager les photos séparément après avoir envoyé le message",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to WhatsApp URL
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (savedEntry) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-6">
            <BackButton to="/rider/home" />
          </div>

          <Card className="bg-white shadow-md">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800 flex items-center gap-2">
                ✅ Équipement enregistré avec succès
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Matricule moto:</span>
                  <p className="text-gray-900">{savedEntry.motorcycleMatricule}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">ID téléphone:</span>
                  <p className="text-gray-900">{savedEntry.phoneId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-600">Équipements:</h4>
                <div className="flex flex-wrap gap-2">
                  {savedEntry.hasHelmet && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Casque</span>
                  )}
                  {savedEntry.hasMotorcycleDocument && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Document moto</span>
                  )}
                  {savedEntry.hasExchangeMoney && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Monnaie d'échange</span>
                  )}
                </div>
              </div>

              {savedEntry.hasExchangeMoney && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Monnaie d'échange:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">USD:</span>
                      <p className="font-semibold">${savedEntry.exchangeMoneyUSD}</p>
                    </div>
                    <div>
                      <span className="text-yellow-700">CDF:</span>
                      <p className="font-semibold">{savedEntry.exchangeMoneyCDF?.toLocaleString()} FC</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Photo matriculation:</h4>
                  <img src={savedEntry.matriculationPhoto} alt="Matriculation" className="w-full h-32 object-cover rounded border" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-600 mb-2">Photo kilométrage:</h4>
                  <img src={savedEntry.mileagePhoto} alt="Kilométrage" className="w-full h-32 object-cover rounded border" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={shareOnWhatsApp}
                  className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white order-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  <span className="truncate">Partager mon rapport</span>
                </Button>
                <Button
                  onClick={() => navigate('/rider/home')}
                  variant="outline"
                  className="w-full sm:flex-1 order-2"
                >
                  <Home className="h-4 w-4 mr-2" />
                  <span className="truncate">Retour à l'accueil</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

              <div className="space-y-3">
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

                {formData.hasExchangeMoney && (
                  <div className="ml-6 space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant USD *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.exchangeMoneyUSD}
                        onChange={(e) => setFormData({ ...formData, exchangeMoneyUSD: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        required={formData.hasExchangeMoney}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Montant CDF *
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={formData.exchangeMoneyCDF}
                        onChange={(e) => setFormData({ ...formData, exchangeMoneyCDF: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        required={formData.hasExchangeMoney}
                      />
                    </div>
                  </div>
                )}
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
