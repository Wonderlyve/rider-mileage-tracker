
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { User } from '@/types';
import localForage from 'localforage';
import { useToast } from '@/hooks/use-toast';

export function RiderManagement() {
  const [riders, setRiders] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const { toast } = useToast();

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

  const startEdit = (rider: User) => {
    setIsEditing(rider.id);
    setEditForm(rider);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditForm({
      name: '',
      email: '',
      type: 'rider',
      matricule: ''
    });
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setIsCreating(false);
    setEditForm({});
  };

  const saveRider = async () => {
    try {
      if (!editForm.name || !editForm.email) {
        toast({
          title: "Erreur",
          description: "Le nom et l'email sont obligatoires",
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
          matricule: editForm.matricule
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
        title: "Succès",
        description: isCreating ? "Rider créé avec succès" : "Rider modifié avec succès"
      });
    } catch (error) {
      console.error('Error saving rider:', error);
      toast({
        title: "Erreur",
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
        title: "Succès",
        description: "Rider supprimé avec succès"
      });
    } catch (error) {
      console.error('Error deleting rider:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Gestion des Riders</h2>
          <button
            onClick={startCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Rider
          </button>
        </div>
      </div>

      <div className="p-6">
        {isCreating && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-md font-medium mb-4">Nouveau Rider</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nom"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Matricule"
                value={editForm.matricule || ''}
                onChange={(e) => setEditForm({ ...editForm, matricule: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex space-x-2 mt-4">
              <button
                onClick={saveRider}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Créer
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {riders.map((rider) => (
            <div key={rider.id} className="border border-gray-200 rounded-lg p-4">
              {isEditing === rider.id ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={editForm.matricule || ''}
                      onChange={(e) => setEditForm({ ...editForm, matricule: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveRider}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{rider.name}</h4>
                    <p className="text-gray-600">{rider.email}</p>
                    {rider.matricule && (
                      <p className="text-sm text-gray-500">Matricule: {rider.matricule}</p>
                    )}
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
