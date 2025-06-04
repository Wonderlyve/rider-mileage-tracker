
import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { User } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import localForage from 'localforage';
import { useToast } from '@/hooks/use-toast';

export function RiderManagement() {
  const [riders, setRiders] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [previewPhoto, setPreviewPhoto] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      const ridersData = await localForage.getItem<User[]>('riders') || [];
      setRiders(ridersData);
    } catch (error) {
      console.error('Error loading riders:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditForm({ ...editForm, photo: result });
        setPreviewPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (rider: User) => {
    setIsEditing(rider.id);
    setEditForm(rider);
    setPreviewPhoto(rider.photo || '');
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditForm({
      name: '',
      email: '',
      type: 'rider',
      matricule: '',
      password: '',
      photo: ''
    });
    setPreviewPhoto('');
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
    setPreviewPhoto('');
  };

  const saveRider = async () => {
    try {
      if (!editForm.name || !editForm.email || (!editForm.password && isCreating)) {
        toast({
          title: t('error'),
          description: "Le nom, l'email et le mot de passe sont obligatoires",
          variant: "destructive"
        });
        return;
      }

      let updatedRiders;
      
      if (isCreating) {
        const newRider: User = {
          id: Date.now().toString(),
          name: editForm.name!,
          email: editForm.email!,
          type: 'rider',
          matricule: editForm.matricule,
          password: editForm.password,
          photo: editForm.photo
        };
        updatedRiders = [...riders, newRider];
      } else {
        updatedRiders = riders.map(rider => 
          rider.id === isEditing ? { ...rider, ...editForm } : rider
        );
      }

      await localForage.setItem('riders', updatedRiders);
      setRiders(updatedRiders);
      cancelEdit();
      
      toast({
        title: t('success'),
        description: isCreating ? "Rider créé avec succès" : "Rider modifié avec succès"
      });
    } catch (error) {
      console.error('Error saving rider:', error);
      toast({
        title: t('error'),
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  const deleteRider = async (riderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rider ?')) return;

    try {
      const updatedRiders = riders.filter(rider => rider.id !== riderId);
      await localForage.setItem('riders', updatedRiders);
      setRiders(updatedRiders);
      
      toast({
        title: t('success'),
        description: "Rider supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast({
        title: t('error'),
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  const renderForm = () => (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h3 className="text-md font-medium mb-4">
        {isCreating ? t('newRider') : 'Modifier Rider'}
      </h3>
      
      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('photo')}
        </label>
        {previewPhoto ? (
          <div className="flex items-center space-x-4">
            <img
              src={previewPhoto}
              alt="Preview"
              className="h-16 w-16 rounded-full object-cover border border-gray-300"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {t('changePhoto')}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400"
          >
            <Upload className="h-5 w-5 mr-2" />
            Télécharger une photo
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder={t('name')}
          value={editForm.name || ''}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          placeholder={t('email')}
          value={editForm.email || ''}
          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          placeholder={t('matricule')}
          value={editForm.matricule || ''}
          onChange={(e) => setEditForm({ ...editForm, matricule: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder={t('password')}
          value={editForm.password || ''}
          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={saveRider}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isCreating ? t('create') : t('save')}
        </button>
        <button
          onClick={cancelEdit}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <X className="h-4 w-4 mr-2" />
          {t('cancel')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">{t('riderManagement')}</h2>
          <button
            onClick={startCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('newRider')}
          </button>
        </div>
      </div>

      <div className="p-6">
        {isCreating && renderForm()}

        <div className="space-y-4">
          {riders.map((rider) => (
            <div key={rider.id} className="border border-gray-200 rounded-lg p-4">
              {isEditing === rider.id ? (
                renderForm()
              ) : (
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    {rider.photo && (
                      <img
                        src={rider.photo}
                        alt={rider.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{rider.name}</h4>
                      <p className="text-gray-600">{rider.email}</p>
                      {rider.matricule && (
                        <p className="text-sm text-gray-500">Matricule: {rider.matricule}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(rider)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteRider(rider.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
