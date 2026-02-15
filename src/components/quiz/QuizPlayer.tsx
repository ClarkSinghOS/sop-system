'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Quiz, QuizQuestion, QuizAnswer, QuizAttempt } from '@/types/training';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export default function QuizPlayer({ quiz, onComplete, onExit }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [startTime] = useState(Date.now());
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [orderItems, setOrderItems] = useState<string[]>([]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Initialize shuffled questions
  useEffect(() => {
    let q = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      q = q.sort(() => Math.random() - 0.5);
    }
    setQuestions(q);
  }, [quiz]);

  // Initialize order items when question changes
  useEffect(() => {
    const current = questions[currentQuestionIndex];
    if (current?.type === 'order_steps' && current.options) {
      // Check if we have a saved answer
      const savedAnswer = answers[current.id];
      if (savedAnswer && Array.isArray(savedAnswer)) {
        setOrderItems(savedAnswer);
      } else {
        setOrderItems([...current.options]);
      }
    }
  }, [currentQuestionIndex, questions, answers]);

  // Timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || showResult) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResult]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Get shuffled options
  const getOptions = useCallback((question: QuizQuestion) => {
    if (!question.options) return [];
    if (quiz.shuffleOptions && question.type !== 'order_steps') {
      // Create a stable shuffle based on question id
      return [...question.options].sort((a, b) => {
        const hashA = (question.id + a).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const hashB = (question.id + b).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        return hashA - hashB;
      });
    }
    return question.options;
  }, [quiz.shuffleOptions]);

  // Handle answer selection
  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  // Handle drag for order questions
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const newItems = [...orderItems];
    const draggedItem = newItems[dragItem.current];
    newItems.splice(dragItem.current, 1);
    newItems.splice(dragOverItem.current, 0, draggedItem);
    
    setOrderItems(newItems);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: newItems,
    }));
    
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Navigate questions
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmit = () => {
    const quizAnswers: QuizAnswer[] = questions.map(q => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.type === 'order_steps' && Array.isArray(userAnswer) && Array.isArray(q.correctAnswer)) {
        isCorrect = JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer);
      } else {
        isCorrect = userAnswer === q.correctAnswer;
      }

      return {
        questionId: q.id,
        selectedAnswer: userAnswer || '',
        isCorrect,
      };
    });

    const correctCount = quizAnswers.filter(a => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    const attempt: QuizAttempt = {
      id: Math.random().toString(36).substring(2, 11),
      attemptedAt: new Date().toISOString(),
      score,
      totalQuestions: questions.length,
      passed: score >= quiz.passingScore,
      answers: quizAnswers,
      timeSpentSeconds: Math.round((Date.now() - startTime) / 1000),
    };

    onComplete(attempt);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
              {quiz.title}
            </h1>
            <p className="text-sm text-[var(--text-tertiary)]">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                timeRemaining < 60 
                  ? 'bg-[var(--auto-none)]/20 text-[var(--auto-none)]' 
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
            <button
              onClick={onExit}
              className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Navigator */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                index === currentQuestionIndex
                  ? 'bg-[var(--accent-cyan)] text-black'
                  : answers[q.id]
                  ? 'bg-[var(--accent-lime)]/30 text-[var(--accent-lime)]'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-[var(--accent-lime)]/20 text-[var(--accent-lime)]' :
                currentQuestion.difficulty === 'medium' ? 'bg-[var(--accent-orange)]/20 text-[var(--accent-orange)]' :
                'bg-[var(--auto-none)]/20 text-[var(--auto-none)]'
              }`}>
                {currentQuestion.difficulty}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'multiple_choice' && getOptions(currentQuestion).map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion.id] === option
                      ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]'
                      : 'border-[var(--border-default)]'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-lg ${
                    answers[currentQuestion.id] === option
                      ? 'text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}

            {currentQuestion.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-4">
                {['True', 'False'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`p-6 rounded-xl border-2 text-center transition-all ${
                      answers[currentQuestion.id] === option
                        ? option === 'True'
                          ? 'border-[var(--accent-lime)] bg-[var(--accent-lime)]/10'
                          : 'border-[var(--auto-none)] bg-[var(--auto-none)]/10'
                        : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className={`text-2xl font-display font-bold ${
                      answers[currentQuestion.id] === option
                        ? option === 'True' ? 'text-[var(--accent-lime)]' : 'text-[var(--auto-none)]'
                        : 'text-[var(--text-secondary)]'
                    }`}>
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'order_steps' && (
              <div className="space-y-2">
                <p className="text-sm text-[var(--text-tertiary)] mb-4">
                  Drag and drop to reorder the steps:
                </p>
                {orderItems.map((item, index) => (
                  <div
                    key={item}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-secondary)] cursor-move hover:border-[var(--accent-cyan)] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--accent-cyan)]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--accent-cyan)]">{index + 1}</span>
                    </div>
                    <span className="text-[var(--text-primary)]">{item}</span>
                    <svg className="w-5 h-5 text-[var(--text-tertiary)] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'fill_blank' && getOptions(currentQuestion).map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`px-4 py-3 rounded-xl border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10'
                    : 'border-[var(--border-default)] bg-[var(--bg-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className={`font-medium ${
                  answers[currentQuestion.id] === option
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)]'
                }`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-[var(--text-tertiary)]">
              {Object.keys(answers).length} of {questions.length} answered
            </p>
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                Object.keys(answers).length === questions.length
                  ? 'bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] text-black hover:opacity-90'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed'
              }`}
            >
              Submit Quiz
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-[var(--accent-cyan)] text-black hover:opacity-90 transition-all"
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
