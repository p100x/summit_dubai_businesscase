'use client';

import { useState, useEffect } from 'react';
import { useModelStore } from '@/store/modelStore';

export function BusinessCaseManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const {
    currentBusinessCaseId,
    businessCases,
    isLoading,
    isSaving,
    fetchBusinessCases,
    loadBusinessCase,
    saveBusinessCase,
    updateBusinessCase,
    deleteBusinessCase,
    newBusinessCase,
  } = useModelStore();

  useEffect(() => {
    fetchBusinessCases();
  }, [fetchBusinessCases]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    if (currentBusinessCaseId) {
      await updateBusinessCase(currentBusinessCaseId, name, description);
    } else {
      await saveBusinessCase(name, description);
    }
    setShowSaveDialog(false);
    setName('');
    setDescription('');
  };

  const handleLoad = async (id: string) => {
    await loadBusinessCase(id);
    setIsOpen(false);
  };

  const handleNew = () => {
    newBusinessCase();
    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this business case?')) {
      await deleteBusinessCase(id);
    }
  };

  const currentCase = businessCases.find(bc => bc.id === currentBusinessCaseId);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          {currentCase ? currentCase.name : 'Unsaved Business Case'}
        </button>
        
        <button
          onClick={() => {
            if (currentCase) {
              setName(currentCase.name);
              setDescription(currentCase.description || '');
            }
            setShowSaveDialog(true);
          }}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : currentBusinessCaseId ? 'Update' : 'Save As'}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-12 left-0 z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Business Cases</h3>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleNew}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Business Case
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : businessCases.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No saved business cases</div>
            ) : (
              <div className="space-y-1">
                {businessCases.map((bc) => (
                  <div
                    key={bc.id}
                    className={`px-3 py-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center group ${
                      bc.id === currentBusinessCaseId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div onClick={() => handleLoad(bc.id)} className="flex-1">
                      <div className="font-medium">{bc.name}</div>
                      {bc.description && (
                        <div className="text-sm text-gray-500">{bc.description}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        {new Date(bc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                    >
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {currentBusinessCaseId ? 'Update Business Case' : 'Save Business Case'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business case name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim() || isSaving}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : currentBusinessCaseId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}