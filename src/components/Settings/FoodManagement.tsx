import React, { useState, useEffect } from 'react';
import { PetPhotoUpload } from '../Pet/PetPhotoUpload';
import { foodService } from '../../services/food.service';
import { rationTableService } from '../../services/rationTable.service';
import { Food, FoodPortion } from '../../types/food';
import { TrashIcon, PencilIcon, PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Offcanvas } from '../UI/Offcanvas';

type TableType = 'puppy' | 'adult' | 'both';

export const FoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [newFood, setNewFood] = useState<Partial<Food>>({});
  const [portions, setPortions] = useState<FoodPortion[]>([]);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [showPortionsModal, setShowPortionsModal] = useState<string | null>(null);
  const [tableType, setTableType] = useState<TableType>('both');
  const [isProcessingTable, setIsProcessingTable] = useState(false);
  const [ocrRawData, setOcrRawData] = useState<string | null>(null);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    const loadedFoods = await foodService.getAllFoods();
    setFoods(loadedFoods);
  };

  const handlePhotoChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFood(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setNewFood(prev => ({ ...prev, photoUrl: undefined }));
    }
  };

  const handleAddPortion = () => {
    const newPortion: FoodPortion = {
      criteria: {
        weight: { min: 0, max: 0 }
      },
      portions: {
        default: 0,
        byActivity: { low: 0, moderate: 0 }
      }
    };
    setPortions([...portions, newPortion]);
  };

  const handleTableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Réinitialiser l'état avant de commencer le traitement
      setPortions([]);
      setOcrRawData(null);
      setIsProcessingTable(true);

      // Forcer un nouveau traitement avec un timestamp
      const timestamp = Date.now();
      console.log(`Starting new OCR processing at ${timestamp}`);

      const result = await rationTableService.extractFromImage(file);
      console.log('OCR result received:', result);
      
      // Vérifier si on a des données valides
      if (result.portions && result.portions.length > 0) {
        setPortions(result.portions);
        setOcrRawData(result.rawData || null);
      } else {
        throw new Error('Aucune donnée valide n\'a été extraite de l\'image');
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction du tableau:', error);
      // Réinitialiser le champ de fichier et l'état
      if (e.target) {
        e.target.value = '';
      }
      setPortions([]);
      setOcrRawData(null);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsProcessingTable(false);
      // Forcer la réinitialisation du champ de fichier
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handlePortionChange = (
    index: number,
    field: string,
    value: number | undefined
  ) => {
    const updatedPortions = [...portions];
    const portion = { ...updatedPortions[index] };

    // Mettre à jour le champ spécifié en utilisant la notation par points
    const fields = field.split('.');
    let current: any = portion;
    
    for (let i = 0; i < fields.length - 1; i++) {
      if (!current[fields[i]]) {
        current[fields[i]] = {};
      }
      current = current[fields[i]];
    }
    
    current[fields[fields.length - 1]] = value;
    updatedPortions[index] = portion;
    setPortions(updatedPortions);
  };

  const handleRemovePortion = (index: number) => {
    setPortions(portions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name || !newFood.description) return;

    const food: Food = {
      id: editingFoodId ? parseInt(editingFoodId) : Date.now(),
      name: newFood.name,
      brand: newFood.brand || '',
      type: newFood.type || '',
      description: newFood.description,
      photoUrl: newFood.photoUrl,
      portions: portions,
      tableType: tableType
    };

    try {
      if (editingFoodId) {
        await foodService.updateFood(food);
      } else {
        await foodService.addFood(food);
      }
      await loadFoods();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    }
  };

  const handleEdit = (food: Food) => {
    setEditingFoodId(food.id.toString());
    setNewFood(food);
    setPortions(food.portions || []);
    setTableType(food.tableType || 'both');
    setShowOffcanvas(true);
  };

  const handleDelete = async (foodId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alimentation ?')) {
      try {
        await foodService.deleteFood(foodId);
        await loadFoods();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        // TODO: Afficher un message d'erreur à l'utilisateur
      }
    }
  };

  const resetForm = () => {
    setShowOffcanvas(false);
    setNewFood({});
    setPortions([]);
    setEditingFoodId(null);
    setTableType('both');
  };

  const handleAddClick = () => {
    resetForm();
    setShowOffcanvas(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Gestion des alimentations</h3>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ajouter une alimentation
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        {foods.map(food => (
          <div 
            key={food.id} 
            className="flex-grow basis-[calc(33.333%-1rem)] min-w-[300px] max-w-[400px] p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer group"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.action-buttons')) {
                handleEdit(food);
              }
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-4 flex-grow">
                {food.photoUrl ? (
                  <img
                    src={food.photoUrl}
                    alt={food.name}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-400">Pas de photo</span>
                  </div>
                )}
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-lg truncate group-hover:text-blue-600 transition-colors">{food.name}</h4>
                      <p className="text-gray-600 text-sm line-clamp-2">{food.description}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 action-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(food);
                        }}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(food.id.toString());
                        }}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {food.portions && food.portions.length > 0 && (
                    <button
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPortionsModal(food.id.toString());
                      }}
                    >
                      <span>Voir le tableau des rations</span>
                      <span className="text-xs">({food.portions.length} entrées)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Offcanvas
        isOpen={showOffcanvas}
        onClose={resetForm}
        title={editingFoodId ? "Modifier l'alimentation" : "Ajouter une alimentation"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              required
              value={newFood.name || ''}
              onChange={e => setNewFood(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={newFood.description || ''}
              onChange={e => setNewFood(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (optionnel)
            </label>
            <PetPhotoUpload
              currentPhotoUrl={newFood.photoUrl}
              onPhotoChange={handlePhotoChange}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Tableau des rations</h4>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={tableType === 'both'}
                      onChange={() => setTableType('both')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Tous âges</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={tableType === 'puppy'}
                      onChange={() => setTableType('puppy')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Chiot</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={tableType === 'adult'}
                      onChange={() => setTableType('adult')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Adulte</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTableUpload}
                    className="hidden"
                    key={Date.now()}
                  />
                  <PhotoIcon className="w-4 h-4" />
                  <span>Importer une image</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddPortion}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  disabled={isProcessingTable}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {isProcessingTable && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Analyse du tableau en cours...</p>
                </div>
              )}
              
              {!isProcessingTable && (
                <>
                  {ocrRawData && (
                    <div className="mb-4 p-4 bg-gray-100 rounded">
                      <h4 className="text-sm font-medium mb-2">Données extraites du tableau :</h4>
                      <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{ocrRawData}</pre>
                    </div>
                  )}
                  
                  {portions.length > 0 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-6 gap-2 px-3 py-2">
                        <div className="text-xs font-medium text-gray-600">Âge min (mois)</div>
                        <div className="text-xs font-medium text-gray-600">Âge max (mois)</div>
                        <div className="text-xs font-medium text-gray-600">Poids min (kg)</div>
                        <div className="text-xs font-medium text-gray-600">Ration min (g/jour)</div>
                        <div className="text-xs font-medium text-gray-600">Ration max (g/jour)</div>
                        <div></div>
                      </div>
                      {portions.map((portion, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-6 gap-2 items-start">
                            <input
                              type="number"
                              placeholder="Âge min"
                              value={portion.criteria.age?.min ?? ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                handlePortionChange(index, 'criteria.age.min', value);
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Âge max"
                              value={portion.criteria.age?.max ?? ''}
                              onChange={(e) => {
                                const value = e.target.value ? Number(e.target.value) : undefined;
                                handlePortionChange(index, 'criteria.age.max', value);
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Poids min"
                              value={portion.criteria.weight?.min || 0}
                              onChange={(e) => handlePortionChange(index, 'criteria.weight.min', Number(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Ration min"
                              value={portion.portions.byActivity?.low || 0}
                              onChange={e => handlePortionChange(index, 'portions.byActivity.low', Number(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="Ration max"
                              value={portion.portions.byActivity?.moderate || 0}
                              onChange={e => handlePortionChange(index, 'portions.byActivity.moderate', Number(e.target.value))}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePortion(index)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {portions.length === 0 && (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Aucune portion définie. Cliquez sur "Ajouter une ligne" ou importez une image du tableau.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingFoodId ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Offcanvas>

      {showPortionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-medium mb-4">
              Données du tableau - {foods.find(f => f.id.toString() === showPortionsModal)?.name}
            </h4>
            <div className="bg-gray-100 p-4 rounded">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(foods
                  .find(f => f.id.toString() === showPortionsModal)
                  ?.portions?.map(portion => ({
                    ageMin: portion.criteria.age?.min ?? null,
                    ageMax: portion.criteria.age?.max ?? null,
                    weightMin: portion.criteria.weight?.min,
                    weightMax: portion.criteria.weight?.max,
                    allowanceMin: portion.portions.byActivity?.low,
                    allowanceMax: portion.portions.byActivity?.moderate
                  })) || [], null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPortionsModal(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 