'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizAttempt } from '@/types/training';
import { fireConfetti } from '@/lib/confetti';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetake: () => void;
  onClose: () => void;
  onCertify?: () => void;
}

export default function QuizResults({ 
  quiz, 
  attempt, 
  onRetake, 
  onClose,
  onCertify 
}: QuizResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const incorrectCount = attempt.answers.filter(a => !a.isCorrect).length;
  
  // Celebration effect for passing
  useEffect(() => {
    if (attempt.passed) {
      setTimeout(() => {
        fireConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#22d3ee', '#a3e635', '#fbbf24'],
        });
      }, 500);
    }
  }, [attempt.passed]);

  // Get badge type based on score
  const getBadgeType = (score: number): 'platinum' | 'gold' | 'silver' | 'bronze' => {
    if (score >= 95) return 'platinum';
    if (score >= 85) return 'gold';
    if (score >= 75) return 'silver';
    return 'bronze';
  };

  const badgeType = getBadgeType(attempt.score);
  const badgeColors = {
    platinum: 'from-slate-300 via-slate-100 to-slate-400',
    gold: 'from-yellow-400 via-yellow-200 to-yellow-500',
    silver: 'from-gray-300 via-gray-100 to-gray-400',
    bronze: 'from-orange-400 via-orange-200 to-orange-500',
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
            Quiz Results
          </h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Result Card */}
          <div className={`p-8 rounded-2xl border-2 mb-6 text-center ${
            attempt.passed
              ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/50'
              : 'bg-[var(--auto-none)]/5 border-[var(--auto-none)]/50'
          }`}>
            {/* Badge */}
            {attempt.passed && (
              <div className="mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${badgeColors[badgeType]} flex items-center justify-center shadow-lg`}>
                  <div className="w-20 h-20 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                    <svg className="w-10 h-10 text-[var(--accent-lime)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-tertiary)] mt-2 capitalize">
                  {badgeType} Achievement
                </p>
              </div>
            )}

            {/* Pass/Fail Icon */}
            {!attempt.passed && (
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--auto-none)]/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[var(--auto-none)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}

            {/* Score */}
            <div className="mb-4">
              <span className={`text-6xl font-display font-bold ${
                attempt.passed ? 'text-[var(--accent-lime)]' : 'text-[var(--auto-none)]'
              }`}>
                {attempt.score}%
              </span>
            </div>

            {/* Status */}
            <h2 className={`text-2xl font-display font-bold mb-2 ${
              attempt.passed ? 'text-[var(--accent-lime)]' : 'text-[var(--auto-none)]'
            }`}>
              {attempt.passed ? '🎉 Congratulations!' : 'Not Quite...'}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {attempt.passed
                ? `You passed the quiz! You answered ${correctCount} out of ${attempt.totalQuestions} questions correctly.`
                : `You needed ${quiz.passingScore}% to pass. You got ${correctCount} out of ${attempt.totalQuestions} correct.`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
              <p className="text-2xl font-bold text-[var(--accent-lime)]">{correctCount}</p>
              <p className="text-sm text-[var(--text-tertiary)]">Correct</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
              <p className="text-2xl font-bold text-[var(--auto-none)]">{incorrectCount}</p>
              <p className="text-sm text-[var(--text-tertiary)]">Incorrect</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] text-center">
              <p className="text-2xl font-bold text-[var(--accent-cyan)]">{formatTime(attempt.timeSpentSeconds)}</p>
              <p className="text-sm text-[var(--text-tertiary)]">Time</p>
            </div>
          </div>

          {/* Show Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mb-4 flex items-center justify-between p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <span className="font-medium text-[var(--text-primary)]">
              {showDetails ? 'Hide' : 'Show'} Answer Details
            </span>
            <svg 
              className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Detailed Answers */}
          {showDetails && (
            <div className="space-y-3 mb-6">
              {quiz.questions.map((question, index) => {
                const answer = attempt.answers.find(a => a.questionId === question.id);
                const isCorrect = answer?.isCorrect;

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-xl border-2 ${
                      isCorrect
                        ? 'bg-[var(--accent-lime)]/5 border-[var(--accent-lime)]/30'
                        : 'bg-[var(--auto-none)]/5 border-[var(--auto-none)]/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCorrect
                          ? 'bg-[var(--accent-lime)] text-black'
                          : 'bg-[var(--auto-none)] text-white'
                      }`}>
                        {isCorrect ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-tertiary)] mb-1">Question {index + 1}</p>
                        <p className="font-medium text-[var(--text-primary)] mb-2">{question.question}</p>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-[var(--text-secondary)]">
                            <span className="text-[var(--text-tertiary)]">Your answer: </span>
                            <span className={isCorrect ? 'text-[var(--accent-lime)]' : 'text-[var(--auto-none)]'}>
                              {Array.isArray(answer?.selectedAnswer) 
                                ? answer?.selectedAnswer.join(' → ') 
                                : answer?.selectedAnswer || 'No answer'}
                            </span>
                          </p>
                          
                          {!isCorrect && (
                            <p className="text-[var(--text-secondary)]">
                              <span className="text-[var(--text-tertiary)]">Correct answer: </span>
                              <span className="text-[var(--accent-lime)]">
                                {Array.isArray(question.correctAnswer)
                                  ? question.correctAnswer.join(' → ')
                                  : question.correctAnswer}
                              </span>
                            </p>
                          )}
                          
                          {question.explanation && (
                            <p className="text-[var(--text-tertiary)] mt-2 italic">
                              💡 {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
          {!attempt.passed && (
            <button
              onClick={onRetake}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Quiz
            </button>
          )}
          
          {attempt.passed && onCertify && (
            <button
              onClick={onCertify}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Get Certified
            </button>
          )}
          
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Close
          </button>
        </div>
      </footer>
    </div>
  );
}
