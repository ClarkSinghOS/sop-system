'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { marketingFlowProcess } from '@/data/marketing-flow';

const trainings = [
  {
    id: 'mkt-flow-001',
    title: 'Marketing Lead Generation',
    description: 'Master the complete marketing flow from keyword research to client conversion',
    process: marketingFlowProcess,
    duration: '45 mins',
    steps: 9,
    difficulty: 'Intermediate',
    certified: false,
    progress: 0,
  },
  {
    id: 'hr-onboarding',
    title: 'Employee Onboarding',
    description: 'Learn the complete HR onboarding process for new hires',
    duration: '30 mins',
    steps: 7,
    difficulty: 'Beginner',
    certified: true,
    progress: 100,
    completedAt: '2024-02-10',
  },
  {
    id: 'sales-pipeline',
    title: 'Sales Pipeline Management',
    description: 'Understand the sales process from lead to close',
    duration: '60 mins',
    steps: 12,
    difficulty: 'Advanced',
    certified: false,
    progress: 45,
  },
];

export default function TrainingPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredTrainings = trainings.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.progress === 100;
    if (filter === 'in-progress') return t.progress > 0 && t.progress < 100;
    return true;
  });

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <header className="relative px-8 pt-8 pb-10">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-orange)]/5 via-transparent to-[var(--accent-purple)]/5 pointer-events-none" />
        
        <div className={`relative ${mounted ? 'animate-reveal-up' : 'opacity-0'}`}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Home
            </Link>
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--text-primary)]">Training Center</span>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-2">
                Training Center
              </h1>
              <p className="text-[var(--text-secondary)] max-w-xl">
                Master your processes with guided training, quizzes, and certifications
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-[var(--accent-lime)]">
                  {trainings.filter(t => t.certified).length}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1">Certified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-[var(--accent-orange)]">
                  {trainings.filter(t => t.progress > 0 && t.progress < 100).length}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-[var(--text-primary)]">
                  {trainings.length}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1">Available</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className={`px-8 mb-6 ${mounted ? 'animate-reveal-up stagger-1' : 'opacity-0'}`}>
        <div className="flex items-center gap-2">
          {(['all', 'in-progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === f
                  ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-transparent'
                }
              `}
            >
              {f === 'all' ? 'All Trainings' : f === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      {/* Training Cards */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrainings.map((training, index) => (
            <div
              key={training.id}
              className={`
                card group relative overflow-hidden
                ${mounted ? 'animate-reveal-up' : 'opacity-0'}
              `}
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)]/5 to-[var(--accent-purple)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${training.certified 
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]' 
                      : training.progress > 0
                        ? 'bg-[var(--accent-orange)]/10 text-[var(--accent-orange)]'
                        : 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)]'
                    }
                  `}>
                    {training.certified ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Difficulty Badge */}
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${training.difficulty === 'Beginner'
                      ? 'bg-[var(--status-success)]/10 text-[var(--status-success)]'
                      : training.difficulty === 'Intermediate'
                        ? 'bg-[var(--status-warning)]/10 text-[var(--status-warning)]'
                        : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                    }
                  `}>
                    {training.difficulty}
                  </span>
                </div>
                
                {/* Title & Description */}
                <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-2">
                  {training.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                  {training.description}
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)] mb-5">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {training.duration}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {training.steps} steps
                  </div>
                </div>
                
                {/* Progress Bar */}
                {training.progress > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[var(--text-tertiary)]">Progress</span>
                      <span className="font-semibold text-[var(--text-primary)]">{training.progress}%</span>
                    </div>
                    <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${training.progress}%`,
                          background: training.progress === 100 
                            ? 'var(--status-success)' 
                            : 'linear-gradient(90deg, var(--accent-cyan), var(--accent-lime))',
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <Link
                  href={training.id === 'mkt-flow-001' ? '/' : '#'}
                  className={`
                    w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                    font-semibold text-sm transition-all
                    ${training.certified
                      ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      : training.progress > 0
                        ? 'bg-[var(--accent-orange)] text-black hover:shadow-[var(--glow-orange)]'
                        : 'bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-lime)] text-black hover:shadow-[var(--glow-cyan)]'
                    }
                  `}
                >
                  {training.certified ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retake Training
                    </>
                  ) : training.progress > 0 ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Continue Training
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Training
                    </>
                  )}
                </Link>
              </div>
              
              {/* Certified Ribbon */}
              {training.certified && (
                <div className="absolute top-4 right-0 bg-[var(--status-success)] text-black px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-l-full shadow-lg">
                  Certified
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
