'use client';

import { useState, useEffect } from 'react';
import { CertificationRecord, TrainingProgress, QuizAttempt } from '@/types/training';
import CertificationBadge from './CertificationBadge';

interface TrainingHistoryProps {
  userId?: string;
  onViewCertification?: (cert: CertificationRecord) => void;
}

// Storage keys
const STORAGE_KEYS = {
  certifications: 'processcore_certifications',
  trainingProgress: 'processcore_training_progress',
  quizAttempts: 'processcore_quiz_attempts',
};

// Helper functions for localStorage
export function getCertifications(): CertificationRecord[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.certifications);
  return data ? JSON.parse(data) : [];
}

export function saveCertification(cert: CertificationRecord): void {
  if (typeof window === 'undefined') return;
  const certs = getCertifications();
  // Remove existing certification for same process
  const filtered = certs.filter(c => c.processId !== cert.processId);
  filtered.push(cert);
  localStorage.setItem(STORAGE_KEYS.certifications, JSON.stringify(filtered));
}

export function getTrainingProgress(processId: string): TrainingProgress | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.trainingProgress);
  const all: Record<string, TrainingProgress> = data ? JSON.parse(data) : {};
  return all[processId] || null;
}

export function saveTrainingProgress(progress: TrainingProgress): void {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(STORAGE_KEYS.trainingProgress);
  const all: Record<string, TrainingProgress> = data ? JSON.parse(data) : {};
  all[progress.processId] = progress;
  localStorage.setItem(STORAGE_KEYS.trainingProgress, JSON.stringify(all));
}

export function getQuizAttempts(processId: string): QuizAttempt[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.quizAttempts);
  const all: Record<string, QuizAttempt[]> = data ? JSON.parse(data) : {};
  return all[processId] || [];
}

export function saveQuizAttempt(processId: string, attempt: QuizAttempt): void {
  if (typeof window === 'undefined') return;
  const data = localStorage.getItem(STORAGE_KEYS.quizAttempts);
  const all: Record<string, QuizAttempt[]> = data ? JSON.parse(data) : {};
  if (!all[processId]) all[processId] = [];
  all[processId].push(attempt);
  localStorage.setItem(STORAGE_KEYS.quizAttempts, JSON.stringify(all));
}

export function isCertified(processId: string): boolean {
  const certs = getCertifications();
  const cert = certs.find(c => c.processId === processId);
  if (!cert) return false;
  if (cert.expiresAt && new Date(cert.expiresAt) < new Date()) return false;
  return true;
}

export function getCertification(processId: string): CertificationRecord | null {
  const certs = getCertifications();
  return certs.find(c => c.processId === processId) || null;
}

export default function TrainingHistory({ onViewCertification }: TrainingHistoryProps) {
  const [certifications, setCertifications] = useState<CertificationRecord[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');
  const [filterExpired, setFilterExpired] = useState(false);

  useEffect(() => {
    setCertifications(getCertifications());
  }, []);

  // Sort and filter certifications
  const sortedCertifications = [...certifications]
    .filter(cert => {
      if (!filterExpired) return true;
      return !cert.expiresAt || new Date(cert.expiresAt) > new Date();
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.certifiedAt).getTime() - new Date(a.certifiedAt).getTime();
        case 'score':
          return b.quizScore - a.quizScore;
        case 'name':
          return a.processName.localeCompare(b.processName);
        default:
          return 0;
      }
    });

  const activeCertCount = certifications.filter(c => 
    !c.expiresAt || new Date(c.expiresAt) > new Date()
  ).length;

  const expiringSoonCount = certifications.filter(c => {
    if (!c.expiresAt) return false;
    const daysLeft = Math.ceil((new Date(c.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <p className="text-3xl font-bold text-[var(--accent-lime)]">{activeCertCount}</p>
          <p className="text-sm text-[var(--text-tertiary)]">Active Certifications</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <p className="text-3xl font-bold text-[var(--accent-cyan)]">{certifications.length}</p>
          <p className="text-sm text-[var(--text-tertiary)]">Total Completed</p>
        </div>
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <p className={`text-3xl font-bold ${expiringSoonCount > 0 ? 'text-[var(--accent-orange)]' : 'text-[var(--text-tertiary)]'}`}>
            {expiringSoonCount}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">Expiring Soon</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterExpired}
              onChange={(e) => setFilterExpired(e.target.checked)}
              className="rounded border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--accent-cyan)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Hide expired</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)]">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
            className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
          >
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Certification List */}
      {sortedCertifications.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
          <svg className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Certifications Yet</h3>
          <p className="text-[var(--text-secondary)]">
            Complete training and pass quizzes to earn certifications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCertifications.map((cert) => {
            const isExpired = cert.expiresAt && new Date(cert.expiresAt) < new Date();
            const expiresIn = cert.expiresAt 
              ? Math.ceil((new Date(cert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={cert.id}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-colors cursor-pointer hover:bg-[var(--bg-tertiary)] ${
                  isExpired
                    ? 'bg-[var(--bg-secondary)] border-[var(--border-default)] opacity-60'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-default)]'
                }`}
                onClick={() => onViewCertification?.(cert)}
              >
                <CertificationBadge certification={cert} size="sm" />
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[var(--text-primary)] truncate">
                    {cert.processName}
                  </h4>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Certified {new Date(cert.certifiedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--accent-cyan)]">{cert.quizScore}%</p>
                  {isExpired && (
                    <span className="text-xs text-[var(--auto-none)]">Expired</span>
                  )}
                  {!isExpired && expiresIn !== null && expiresIn <= 30 && (
                    <span className="text-xs text-[var(--accent-orange)]">
                      {expiresIn} day{expiresIn !== 1 ? 's' : ''} left
                    </span>
                  )}
                </div>

                <svg className="w-5 h-5 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
