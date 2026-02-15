'use client';

/**
 * IntegrationPanel - Show available integrations for a step
 * 
 * Displays configured triggers and actions for a process step,
 * with controls to enable/disable and configure them.
 */

import React, { useState } from 'react';
import { 
  ActionType, 
  TriggerAction, 
  SUPPORTED_ACTIONS,
  SUPPORTED_CONNECTIONS,
  ConnectionType,
} from '@/types/integrations';

interface IntegrationPanelProps {
  stepId: string;
  stepName: string;
  triggers?: TriggerAction[];
  onAddAction?: (action: TriggerAction) => void;
  onRemoveAction?: (actionId: string) => void;
  onToggleAction?: (actionId: string, enabled: boolean) => void;
}

export function IntegrationPanel({
  stepId,
  stepName,
  triggers = [],
  onAddAction,
  onRemoveAction,
  onToggleAction,
}: IntegrationPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['communication', 'tasks', 'crm', 'automation', 'utility'] as const;

  const getActionsByCategory = (category: string) => {
    return Object.entries(SUPPORTED_ACTIONS)
      .filter(([_, info]) => info.category === category)
      .map(([type, info]) => ({ type: type as ActionType, ...info }));
  };

  const handleAddAction = (actionType: ActionType) => {
    const newAction: TriggerAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: actionType,
      config: {},
      order: triggers.length,
      onError: 'continue',
    };
    onAddAction?.(newAction);
    setShowAddMenu(false);
    setSelectedCategory(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Integrations</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Actions to run when &quot;{stepName}&quot; completes
            </p>
          </div>
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Action
          </button>
        </div>
      </div>

      {/* Add Action Menu */}
      {showAddMenu && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-400'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {selectedCategory && (
            <div className="grid grid-cols-2 gap-2">
              {getActionsByCategory(selectedCategory).map((action) => (
                <button
                  key={action.type}
                  onClick={() => handleAddAction(action.type)}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all text-left"
                >
                  <span className="text-xl mr-3">{action.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{action.name}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!selectedCategory && (
            <p className="text-xs text-gray-500 text-center py-2">
              Select a category above to see available actions
            </p>
          )}
        </div>
      )}

      {/* Configured Actions */}
      <div className="divide-y divide-gray-100">
        {triggers.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">No integrations configured</p>
            <p className="text-xs text-gray-400">
              Add actions to automate tasks when this step completes
            </p>
          </div>
        ) : (
          triggers.map((action, index) => {
            const actionInfo = SUPPORTED_ACTIONS[action.type];
            return (
              <div
                key={action.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <span className="text-lg mr-3">{actionInfo?.icon || '🔗'}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {action.config.name || actionInfo?.name || action.type}
                    </div>
                    <div className="text-xs text-gray-500">
                      {actionInfo?.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                  <button
                    onClick={() => onRemoveAction?.(action.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Remove action"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Connected Services */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Available Connections
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(SUPPORTED_CONNECTIONS) as [ConnectionType, typeof SUPPORTED_CONNECTIONS[ConnectionType]][])
            .slice(0, 6)
            .map(([type, info]) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-1 text-xs bg-white rounded border border-gray-200"
                title={info.description}
              >
                <span className="mr-1">{info.icon}</span>
                {info.name}
              </span>
            ))}
          <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
            +{Object.keys(SUPPORTED_CONNECTIONS).length - 6} more
          </span>
        </div>
      </div>
    </div>
  );
}

export default IntegrationPanel;
