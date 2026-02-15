'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { hrOnboardingProcess, hrOnboardingAI, flowNodes, flowEdges } from '@/lib/sopData';
import AIViewer from '@/components/AIViewer';

// Dynamic import for React Flow (client-side only)
const SOPFlow = dynamic(() => import('@/components/SOPFlow'), { ssr: false });

type ViewMode = 'human' | 'ai';

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>('human');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">SOP System</h1>
              <p className="text-sm text-gray-400">Interactive Process Documentation</p>
            </div>
            
            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('human')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'human'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Human View
                </span>
              </button>
              <button
                onClick={() => setViewMode('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'ai'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  AI JSON
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Process info bar */}
      <div className="border-b border-white/10 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">Process:</span>{' '}
              <span className="font-mono text-blue-400">{hrOnboardingProcess.processId}</span>
            </div>
            <div>
              <span className="text-gray-500">Name:</span>{' '}
              <span className="text-white">{hrOnboardingProcess.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Version:</span>{' '}
              <span className="text-green-400">{hrOnboardingProcess.version}</span>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>{' '}
              <span className="text-white">{hrOnboardingProcess.owner}</span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>{' '}
              <span className="text-orange-400">{hrOnboardingProcess.estimatedDuration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Short version summary */}
      <div className="bg-slate-800/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase">Quick Summary:</span>
            <div className="flex items-center gap-2">
              {hrOnboardingProcess.shortVersion.map((step, i) => (
                <span key={i} className="flex items-center gap-2 text-sm text-gray-300">
                  {step}
                  {i < hrOnboardingProcess.shortVersion.length - 1 && (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {viewMode === 'human' ? (
          <div className="h-[calc(100vh-180px)]">
            <SOPFlow initialNodes={flowNodes} initialEdges={flowEdges} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto px-4 py-6 overflow-auto h-[calc(100vh-180px)]">
            <AIViewer data={hrOnboardingAI} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-gray-500">
          <span>Last Updated: {hrOnboardingProcess.lastUpdated}</span>
          <span className="flex items-center gap-4">
            <span>Involved: {hrOnboardingProcess.involved.join(', ')}</span>
            <span>Frequency: {hrOnboardingProcess.frequency}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
