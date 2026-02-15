'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrainingHistory, getCertification } from '@/components/training';
import { CertificationRecord } from '@/types/training';

export default function TrainingPage() {
  const router = useRouter();
  const [selectedCert, setSelectedCert] = useState<CertificationRecord | null>(null);

  const handleViewCertification = (cert: CertificationRecord) => {
    setSelectedCert(cert);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                Training Center
              </h1>
              <p className="text-sm text-[var(--text-tertiary)]">
                Your certifications and training history
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black font-medium hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Start New Training
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <TrainingHistory onViewCertification={handleViewCertification} />
        </div>
      </main>

      {/* Certification Detail Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-default)] max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Certification Details
              </h2>
              <button
                onClick={() => setSelectedCert(null)}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${
                selectedCert.badgeType === 'platinum' ? 'from-slate-300 via-slate-100 to-slate-400' :
                selectedCert.badgeType === 'gold' ? 'from-yellow-400 via-yellow-200 to-yellow-500' :
                selectedCert.badgeType === 'silver' ? 'from-gray-300 via-gray-100 to-gray-400' :
                'from-orange-400 via-orange-200 to-orange-500'
              } flex items-center justify-center shadow-lg mb-4`}>
                <div className="w-20 h-20 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {selectedCert.processName}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] capitalize">
                {selectedCert.badgeType} Certification
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <span className="text-sm text-[var(--text-tertiary)]">Quiz Score</span>
                <span className="font-medium text-[var(--accent-cyan)]">{selectedCert.quizScore}%</span>
              </div>
              <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                <span className="text-sm text-[var(--text-tertiary)]">Certified On</span>
                <span className="font-medium text-[var(--text-primary)]">
                  {new Date(selectedCert.certifiedAt).toLocaleDateString()}
                </span>
              </div>
              {selectedCert.expiresAt && (
                <div className="flex justify-between p-3 rounded-lg bg-[var(--bg-tertiary)]">
                  <span className="text-sm text-[var(--text-tertiary)]">Expires On</span>
                  <span className={`font-medium ${
                    new Date(selectedCert.expiresAt) < new Date() 
                      ? 'text-[var(--auto-none)]' 
                      : 'text-[var(--text-primary)]'
                  }`}>
                    {new Date(selectedCert.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCert(null);
                  router.push('/');
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-purple)] text-white font-medium hover:opacity-90 transition-opacity"
              >
                Retake Training
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
