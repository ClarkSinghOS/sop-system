'use client';

import React, { useState } from 'react';
import type { VersionChangeType } from '@/types/versioning';

interface ChangeNotesProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string, changeType: VersionChangeType) => void;
  defaultNotes?: string;
  isSubmitting?: boolean;
  changedFields?: string[];
}

export function ChangeNotes({
  isOpen,
  onClose,
  onSave,
  defaultNotes = '',
  isSubmitting = false,
  changedFields = [],
}: ChangeNotesProps) {
  const [notes, setNotes] = useState(defaultNotes);
  const [changeType, setChangeType] = useState<VersionChangeType>('patch');

  const changeTypes: { type: VersionChangeType; label: string; description: string; icon: string }[] = [
    {
      type: 'major',
      label: 'Major',
      description: 'Breaking changes, restructure',
      icon: '🔴',
    },
    {
      type: 'minor',
      label: 'Minor',
      description: 'New steps, significant additions',
      icon: '🔵',
    },
    {
      type: 'patch',
      label: 'Patch',
      description: 'Small fixes, typos, clarifications',
      icon: '🟢',
    },
  ];

  const handleSave = () => {
    if (!notes.trim()) return;
    onSave(notes.trim(), changeType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Save Changes</h2>
          <p className="text-blue-100 text-sm mt-1">
            Add a note describing what changed
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Changed fields indicator */}
          {changedFields.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 
                            rounded-lg p-3">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Fields with changes:
              </div>
              <div className="flex flex-wrap gap-2">
                {changedFields.map(field => (
                  <span
                    key={field}
                    className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/40 
                             text-yellow-700 dark:text-yellow-300 rounded"
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Change type selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {changeTypes.map(ct => (
                <button
                  key={ct.type}
                  onClick={() => setChangeType(ct.type)}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${changeType === ct.type
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{ct.icon}</div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {ct.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {ct.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Change Notes *
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what changed and why..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       placeholder-gray-500 dark:placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-none"
              autoFocus
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Be specific about what changed for future reference
            </div>
          </div>

          {/* Quick templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick templates
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Fixed typo in description',
                'Updated checklist items',
                'Added new step',
                'Improved instructions',
                'Updated tools/links',
                'Reorganized steps',
              ].map(template => (
                <button
                  key={template}
                  onClick={() => setNotes(prev => prev ? `${prev}. ${template}` : template)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 
                           text-gray-700 dark:text-gray-300 rounded
                           hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 
                       flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                     hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!notes.trim() || isSubmitting}
            className={`
              px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${!notes.trim() || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Version
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
