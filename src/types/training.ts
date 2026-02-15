// Training & Quiz Types

export interface TrainingProgress {
  processId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  completedSteps: string[];
  checklistProgress: Record<string, string[]>; // stepId -> completed item ids
  quizAttempts: QuizAttempt[];
  certified: boolean;
  certifiedAt?: string;
}

export interface QuizAttempt {
  id: string;
  attemptedAt: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: QuizAnswer[];
  timeSpentSeconds: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  isCorrect: boolean;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'order_steps' | 'fill_blank';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  relatedStepId?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface Quiz {
  id: string;
  processId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // percentage
  timeLimit?: number; // minutes
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface CertificationRecord {
  id: string;
  userId: string;
  processId: string;
  processName: string;
  certifiedAt: string;
  expiresAt?: string;
  quizScore: number;
  trainingDuration: number; // minutes
  badgeType: 'bronze' | 'silver' | 'gold' | 'platinum';
}

// Training mode state
export interface TrainingState {
  isActive: boolean;
  isPracticeMode: boolean;
  currentStepIndex: number;
  showCelebration: boolean;
  autoPlayVideo: boolean;
}
