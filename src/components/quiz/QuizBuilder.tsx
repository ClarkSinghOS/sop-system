'use client';

import { Process, ProcessStep } from '@/types/process';
import { Quiz, QuizQuestion, QuestionType } from '@/types/training';

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export function generateQuizFromProcess(process: Process, options?: {
  questionCount?: number;
  includeTypes?: QuestionType[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}): Quiz {
  const {
    questionCount = 10,
    includeTypes = ['multiple_choice', 'true_false', 'order_steps'],
    difficulty = 'mixed',
  } = options || {};

  const questions: QuizQuestion[] = [];
  const steps = process.steps;

  // Generate different question types
  const generators: Record<QuestionType, () => QuizQuestion[]> = {
    multiple_choice: () => generateMultipleChoice(process, steps),
    true_false: () => generateTrueFalse(process, steps),
    order_steps: () => generateOrderSteps(steps),
    fill_blank: () => generateFillBlank(steps),
  };

  // Collect questions from each type
  for (const type of includeTypes) {
    if (generators[type]) {
      questions.push(...generators[type]());
    }
  }

  // Filter by difficulty if not mixed
  let filteredQuestions = questions;
  if (difficulty !== 'mixed') {
    filteredQuestions = questions.filter(q => q.difficulty === difficulty);
  }

  // Shuffle and limit
  const selectedQuestions = shuffleArray(filteredQuestions).slice(0, questionCount);

  return {
    id: generateId(),
    processId: process.id,
    title: `${process.name} Quiz`,
    description: `Test your knowledge of the ${process.name} process`,
    questions: selectedQuestions,
    passingScore: 70,
    timeLimit: Math.ceil(selectedQuestions.length * 1.5), // 1.5 minutes per question
    shuffleQuestions: true,
    shuffleOptions: true,
  };
}

function generateMultipleChoice(process: Process, steps: ProcessStep[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Q: What is the first step?
  if (steps.length > 0) {
    const otherSteps = steps.slice(1, 4).map(s => s.name);
    questions.push({
      id: generateId(),
      type: 'multiple_choice',
      question: `What is the first step in the "${process.name}" process?`,
      options: shuffleArray([steps[0].name, ...otherSteps]),
      correctAnswer: steps[0].name,
      explanation: `The first step is "${steps[0].name}" - ${steps[0].shortDescription}`,
      relatedStepId: steps[0].stepId,
      difficulty: 'easy',
      points: 1,
    });
  }

  // Q: What is the last step?
  if (steps.length > 1) {
    const lastStep = steps[steps.length - 1];
    const otherSteps = steps.slice(0, -1).slice(-3).map(s => s.name);
    questions.push({
      id: generateId(),
      type: 'multiple_choice',
      question: `What is the final step in the "${process.name}" process?`,
      options: shuffleArray([lastStep.name, ...otherSteps]),
      correctAnswer: lastStep.name,
      explanation: `The final step is "${lastStep.name}"`,
      relatedStepId: lastStep.stepId,
      difficulty: 'easy',
      points: 1,
    });
  }

  // Q: Who owns step X?
  for (const step of steps.slice(0, 3)) {
    const allOwners = [...new Set(steps.map(s => s.ownership.owner.name))];
    const wrongOwners = allOwners.filter(o => o !== step.ownership.owner.name).slice(0, 3);
    
    if (wrongOwners.length >= 2) {
      questions.push({
        id: generateId(),
        type: 'multiple_choice',
        question: `Who is the owner of the "${step.name}" step?`,
        options: shuffleArray([step.ownership.owner.name, ...wrongOwners]),
        correctAnswer: step.ownership.owner.name,
        explanation: `The ${step.ownership.owner.name} is responsible for this step`,
        relatedStepId: step.stepId,
        difficulty: 'medium',
        points: 2,
      });
    }
  }

  // Q: How long does step X take?
  for (const step of steps) {
    if (step.timing?.estimatedDuration) {
      const durations = ['30 minutes', '1-2 hours', '2-3 days', '1 week', '4-6 hours'];
      const wrongDurations = durations.filter(d => d !== step.timing?.estimatedDuration).slice(0, 3);
      
      questions.push({
        id: generateId(),
        type: 'multiple_choice',
        question: `How long should the "${step.name}" step take?`,
        options: shuffleArray([step.timing.estimatedDuration, ...wrongDurations]),
        correctAnswer: step.timing.estimatedDuration,
        explanation: `This step should take approximately ${step.timing.estimatedDuration}`,
        relatedStepId: step.stepId,
        difficulty: 'medium',
        points: 2,
      });
    }
  }

  // Q: What step type is X?
  const stepTypes = ['task', 'decision', 'parallel', 'subprocess', 'human_task', 'automated', 'milestone'];
  for (const step of steps.slice(0, 2)) {
    const wrongTypes = stepTypes.filter(t => t !== step.type).slice(0, 3);
    
    questions.push({
      id: generateId(),
      type: 'multiple_choice',
      question: `What type of step is "${step.name}"?`,
      options: shuffleArray([step.type, ...wrongTypes]),
      correctAnswer: step.type,
      explanation: `"${step.name}" is a ${step.type} step`,
      relatedStepId: step.stepId,
      difficulty: 'medium',
      points: 2,
    });
  }

  // Q: What tools are used in step X?
  for (const step of steps) {
    if (step.toolsUsed && step.toolsUsed.length > 0) {
      const correctTool = step.toolsUsed[0].name;
      const allTools = steps.flatMap(s => s.toolsUsed || []).map(t => t.name);
      const wrongTools = [...new Set(allTools.filter(t => t !== correctTool))].slice(0, 3);
      
      if (wrongTools.length >= 2) {
        questions.push({
          id: generateId(),
          type: 'multiple_choice',
          question: `Which tool is used in the "${step.name}" step?`,
          options: shuffleArray([correctTool, ...wrongTools]),
          correctAnswer: correctTool,
          explanation: `${correctTool} is one of the tools used in this step`,
          relatedStepId: step.stepId,
          difficulty: 'hard',
          points: 3,
        });
      }
    }
  }

  // Q: What automation level is step X?
  for (const step of steps.slice(0, 3)) {
    const levels = ['full', 'partial', 'none'];
    const levelLabels: Record<string, string> = {
      full: 'Fully Automated',
      partial: 'Partially Automated',
      none: 'Manual Process',
    };
    const wrongLevels = levels.filter(l => l !== step.automationLevel);
    
    questions.push({
      id: generateId(),
      type: 'multiple_choice',
      question: `What is the automation level of "${step.name}"?`,
      options: shuffleArray([levelLabels[step.automationLevel], ...wrongLevels.map(l => levelLabels[l])]),
      correctAnswer: levelLabels[step.automationLevel],
      explanation: `This step is ${levelLabels[step.automationLevel].toLowerCase()}`,
      relatedStepId: step.stepId,
      difficulty: 'medium',
      points: 2,
    });
  }

  return questions;
}

function generateTrueFalse(process: Process, steps: ProcessStep[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Q: True/False about step count
  questions.push({
    id: generateId(),
    type: 'true_false',
    question: `The "${process.name}" process has ${steps.length} steps.`,
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: `Correct! The process has exactly ${steps.length} steps.`,
    difficulty: 'easy',
    points: 1,
  });

  // Q: True/False about wrong step count
  questions.push({
    id: generateId(),
    type: 'true_false',
    question: `The "${process.name}" process has ${steps.length + 3} steps.`,
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: `False. The process has ${steps.length} steps, not ${steps.length + 3}.`,
    difficulty: 'easy',
    points: 1,
  });

  // Q: True/False about step order
  if (steps.length >= 2) {
    questions.push({
      id: generateId(),
      type: 'true_false',
      question: `"${steps[0].name}" comes before "${steps[1].name}" in the process.`,
      options: ['True', 'False'],
      correctAnswer: 'True',
      explanation: `Correct! "${steps[0].name}" is step 1 and "${steps[1].name}" is step 2.`,
      relatedStepId: steps[0].stepId,
      difficulty: 'easy',
      points: 1,
    });

    // False version
    questions.push({
      id: generateId(),
      type: 'true_false',
      question: `"${steps[1].name}" comes before "${steps[0].name}" in the process.`,
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: `False. "${steps[0].name}" comes first, then "${steps[1].name}".`,
      relatedStepId: steps[1].stepId,
      difficulty: 'easy',
      points: 1,
    });
  }

  // Q: True/False about checklist requirements
  for (const step of steps) {
    if (step.checklist) {
      const requiredCount = step.checklist.items.filter(i => i.required).length;
      questions.push({
        id: generateId(),
        type: 'true_false',
        question: `The "${step.name}" step has ${requiredCount} required checklist items.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `Correct! There are ${requiredCount} required items in this step's checklist.`,
        relatedStepId: step.stepId,
        difficulty: 'medium',
        points: 2,
      });
      break; // Just one of these
    }
  }

  // Q: True/False about automation
  for (const step of steps) {
    if (step.automationLevel === 'full') {
      questions.push({
        id: generateId(),
        type: 'true_false',
        question: `The "${step.name}" step is fully automated.`,
        options: ['True', 'False'],
        correctAnswer: 'True',
        explanation: `Correct! This step is fully automated.`,
        relatedStepId: step.stepId,
        difficulty: 'medium',
        points: 2,
      });
      break;
    }
    if (step.automationLevel === 'none') {
      questions.push({
        id: generateId(),
        type: 'true_false',
        question: `The "${step.name}" step is fully automated.`,
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: `False. This step is manual (not automated).`,
        relatedStepId: step.stepId,
        difficulty: 'medium',
        points: 2,
      });
      break;
    }
  }

  return questions;
}

function generateOrderSteps(steps: ProcessStep[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Pick a subset of steps to order
  if (steps.length >= 3) {
    const subset = steps.slice(0, Math.min(4, steps.length));
    const correctOrder = subset.map(s => s.name);
    
    questions.push({
      id: generateId(),
      type: 'order_steps',
      question: 'Put these steps in the correct order:',
      options: shuffleArray([...correctOrder]),
      correctAnswer: correctOrder,
      explanation: `The correct order is: ${correctOrder.map((n, i) => `${i + 1}. ${n}`).join(', ')}`,
      difficulty: 'hard',
      points: 4,
    });
  }

  // Another subset from middle
  if (steps.length >= 5) {
    const subset = steps.slice(2, 5);
    const correctOrder = subset.map(s => s.name);
    
    questions.push({
      id: generateId(),
      type: 'order_steps',
      question: 'Put these steps in the correct order (these are steps 3-5 of the process):',
      options: shuffleArray([...correctOrder]),
      correctAnswer: correctOrder,
      explanation: `The correct order is: ${correctOrder.map((n, i) => `${i + 1}. ${n}`).join(', ')}`,
      difficulty: 'hard',
      points: 4,
    });
  }

  return questions;
}

function generateFillBlank(steps: ProcessStep[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Fill in the blank for step descriptions (simplified - would need text input in player)
  for (const step of steps.slice(0, 2)) {
    if (step.shortDescription) {
      // Take first word and make it a fill-in-the-blank
      const words = step.shortDescription.split(' ');
      if (words.length > 3) {
        const blankWord = words[0];
        const questionText = `Complete the step description: "_____ ${words.slice(1).join(' ')}"`;
        
        questions.push({
          id: generateId(),
          type: 'fill_blank',
          question: questionText,
          options: shuffleArray([blankWord, 'Review', 'Create', 'Analyze', 'Submit'].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4),
          correctAnswer: blankWord,
          explanation: `The correct word is "${blankWord}"`,
          relatedStepId: step.stepId,
          difficulty: 'hard',
          points: 3,
        });
      }
    }
  }

  return questions;
}

// Component for previewing/editing generated quiz
interface QuizBuilderProps {
  process: Process;
  onQuizGenerated: (quiz: Quiz) => void;
}

export default function QuizBuilder({ process, onQuizGenerated }: QuizBuilderProps) {
  const handleGenerate = () => {
    const quiz = generateQuizFromProcess(process);
    onQuizGenerated(quiz);
  };

  return (
    <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-default)]">
      <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">
        Generate Quiz
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Automatically create a quiz based on the process steps, owners, timings, and more.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="px-2 py-1 rounded bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-xs">
          {process.steps.length} steps
        </span>
        <span className="px-2 py-1 rounded bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] text-xs">
          Multiple choice
        </span>
        <span className="px-2 py-1 rounded bg-[var(--accent-lime)]/20 text-[var(--accent-lime)] text-xs">
          True/False
        </span>
        <span className="px-2 py-1 rounded bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] text-xs">
          Order steps
        </span>
      </div>
      <button
        onClick={handleGenerate}
        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white font-medium hover:opacity-90 transition-opacity"
      >
        Generate Quiz
      </button>
    </div>
  );
}
