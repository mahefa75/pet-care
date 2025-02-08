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
  const [showPortionsTable, setShowPortionsTable] = useState(false);
  const [tempPhotoFile, setTempPhotoFile] = useState<File | null>(null);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [showPortionsModal, setShowPortionsModal] = useState<string | null>(null);
  const [isAdultFood, setIsAdultFood] = useState(false);
  const [tableType, setTableType] = useState<TableType>('both');
  const [isProcessingTable, setIsProcessingTable] = useState(false);
  const [ocrRawData, setOcrRawData] = useState<string | null>(null);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = () => {
    const loadedFoods = foodService.getAllFoods();
    setFoods(loadedFoods);
  };

  const handlePhotoChange = (file: File | null) => {
    setTempPhotoFile(file);
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
        weight: { min: 0, max: 0 },
        ...(tableType !== 'adult' ? { age: { min: 0, max: 0 } } : {})
      },
      portions: {
        default: 0,
        ...(tableType === 'adult' ? { byActivity: { low: 0, moderate: 0 } } : {})
      }
    };
    setPortions([...portions, newPortion]);
  };

  const handleTableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingTable(true);
      const result = await rationTableService.extractFromImage(file);
      setTableType(result.type);
      setPortions(result.portions);
      setOcrRawData(result.rawData || null);
    } catch (error) {
      console.error('Erreur lors de l\'extraction du tableau:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsProcessingTable(false);
    }
  };

  const handlePortionChange = (index: number, path: string, value: number) => {
    const updatedPortions = [...portions];
    const portion = { ...updatedPortions[index] };

    // Mettre à jour la valeur en fonction du chemin
    const pathParts = path.split('.');
    let current: any = portion;
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }
    current[pathParts[pathParts.length - 1]] = value;

    updatedPortions[index] = portion;
    setPortions(updatedPortions);
  };

  const handleRemovePortion = (index: number) => {
    setPortions(portions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFood.name || !newFood.description) return;

    const food: Food = {
      id: editingFoodId || Date.now().toString(),
      name: newFood.name,
      description: newFood.description,
      photoUrl: newFood.photoUrl,
      portions: portions
    };

    if (editingFoodId) {
      foodService.updateFood(food);
    } else {
      foodService.addFood(food);
    }

    loadFoods();
    resetForm();
  };

  const handleEdit = (food: Food) => {
    setEditingFoodId(food.id);
    setNewFood(food);
    setPortions(food.portions || []);
    setShowPortionsTable(!!food.portions?.length);
    setIsAdultFood(food.portions?.[0]?.portions.byActivity !== undefined);
    setShowOffcanvas(true);
  };

  const handleDelete = (foodId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette alimentation ?')) {
      foodService.deleteFood(foodId);
      loadFoods();
    }
  };

  const resetForm = () => {
    setShowOffcanvas(false);
    setNewFood({});
    setPortions([]);
    setShowPortionsTable(false);
    setTempPhotoFile(null);
    setEditingFoodId(null);
    setIsAdultFood(false);
  };

  const handleAddClick = () => {
    resetForm();
    setShowOffcanvas(true);
  };

  const renderPortionFields = (portion: FoodPortion, index: number) => {
    if (tableType === 'adult') {
      return (
        <div className="grid grid-cols-4 gap-2 items-start">
          <div className="space-y-2">
            <label className="block text-xs text-gray-600">Poids (kg)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={portion.criteria.weight?.min || 0}
                onChange={e => handlePortionChange(index, 'criteria.weight.min', Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={portion.criteria.weight?.max || 0}
                onChange={e => handlePortionChange(index, 'criteria.weight.max', Number(e.target.value))}
                className="px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600">Activité faible</label>
            <input
              type="number"
              placeholder="g/jour"
              value={portion.portions.byActivity?.low || 0}
              onChange={e => handlePortionChange(index, 'portions.byActivity.low', Number(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Activité modérée</label>
            <input
              type="number"
              placeholder="g/jour"
              value={portion.portions.byActivity?.moderate || 0}
              onChange={e => handlePortionChange(index, 'portions.byActivity.moderate', Number(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemovePortion(index)}
            className="mt-6 p-1 text-gray-400 hover:text-red-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-6 gap-2 items-start">
        <div className="space-y-2">
          <label className="block text-xs text-gray-600">Âge (mois)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={portion.criteria.age?.min || 0}
              onChange={e => handlePortionChange(index, 'criteria.age.min', Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={portion.criteria.age?.max || 0}
              onChange={e => handlePortionChange(index, 'criteria.age.max', Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
        <div className="space-y-2 col-span-2">
          <label className="block text-xs text-gray-600">Poids (kg)</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={portion.criteria.weight?.min || 0}
              onChange={e => handlePortionChange(index, 'criteria.weight.min', Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={portion.criteria.weight?.max || 0}
              onChange={e => handlePortionChange(index, 'criteria.weight.max', Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-gray-600">Portion (g/jour)</label>
          <input
            type="number"
            placeholder="g/jour"
            value={portion.portions.default || 0}
            onChange={e => handlePortionChange(index, 'portions.default', Number(e.target.value))}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => handleRemovePortion(index)}
          className="mt-6 p-1 text-gray-400 hover:text-red-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    );
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
                          handleDelete(food.id);
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
                        setShowPortionsModal(food.id);
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
                  
                  {portions.map((portion, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      {renderPortionFields(portion, index)}
                    </div>
                  ))}
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
              Tableau des rations - {foods.find(f => f.id === showPortionsModal)?.name}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {foods.find(f => f.id === showPortionsModal)?.portions[0]?.portions.byActivity ? (
                      <>
                        <th className="px-4 py-2">Poids (kg)</th>
                        <th className="px-4 py-2">Activité faible</th>
                        <th className="px-4 py-2">Activité modérée</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-2">Âge (mois)</th>
                        <th className="px-4 py-2">Poids (kg)</th>
                        <th className="px-4 py-2">Portion (g/jour)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {foods
                    .find(f => f.id === showPortionsModal)
                    ?.portions.map((portion, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        {portion.portions.byActivity ? (
                          <>
                            <td className="px-4 py-2 text-center">
                              {portion.criteria.weight?.min} - {portion.criteria.weight?.max}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {portion.portions.byActivity.low}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {portion.portions.byActivity.moderate}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-center">
                              {portion.criteria.age?.min} - {portion.criteria.age?.max}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {portion.criteria.weight?.min} - {portion.criteria.weight?.max}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {portion.portions.default}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
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