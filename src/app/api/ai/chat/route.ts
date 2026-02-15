import { NextRequest, NextResponse } from 'next/server';
import { AIIntent, AIChatResponse, ExtractedEntity, AIAction } from '@/types/ai';
import { Process, ProcessStep } from '@/types/process';

// Intent patterns for natural language understanding
const intentPatterns: Record<AIIntent, RegExp[]> = {
  start_process: [
    /start\s+(the\s+)?(\w+)/i,
    /begin\s+(the\s+)?(\w+)/i,
    /initiate\s+(the\s+)?(\w+)/i,
    /kick\s*off\s+(the\s+)?(\w+)/i,
    /create\s+(an?\s+)?(new\s+)?instance/i,
    /start\s+(onboarding|process|flow)\s+for\s+(.+)/i,
  ],
  find_process: [
    /find\s+(the\s+)?(\w+)/i,
    /show\s+(me\s+)?(the\s+)?(\w+)/i,
    /where\s+is\s+(the\s+)?(\w+)/i,
    /locate\s+(the\s+)?(\w+)/i,
    /open\s+(the\s+)?(\w+)/i,
  ],
  explain_step: [
    /explain\s+(why\s+)?(the\s+)?(\w+)/i,
    /why\s+(does|do|is)\s+(this|the)\s+(\w+)\s+matter/i,
    /what\s+(does|is)\s+(the\s+)?(\w+)\s+step/i,
    /tell\s+me\s+about\s+(the\s+)?(\w+)/i,
    /why\s+is\s+(this|the)\s+step\s+important/i,
    /explain\s+why\s+this\s+step\s+matters/i,
  ],
  get_timing: [
    /how\s+long\s+(should|does|will)\s+(\w+)\s+take/i,
    /duration\s+(of|for)\s+(the\s+)?(\w+)/i,
    /time\s+(for|to)\s+(\w+)/i,
    /estimate\s+(for\s+)?(the\s+)?(\w+)/i,
    /when\s+should\s+(\w+)\s+be\s+(done|complete)/i,
  ],
  get_owner: [
    /who\s+(owns|is\s+responsible\s+for|handles)\s+(the\s+)?(\w+)/i,
    /owner\s+(of|for)\s+(the\s+)?(\w+)/i,
    /responsible\s+for\s+(the\s+)?(\w+)/i,
    /who\s+do\s+I\s+(ask|contact|talk\s+to)\s+about/i,
  ],
  search_processes: [
    /processes?\s+(related\s+to|about|for)\s+(\w+)/i,
    /what\s+processes?\s+(are\s+)?(related\s+to|involve|include)\s+(\w+)/i,
    /search\s+(for\s+)?(\w+)/i,
    /list\s+(all\s+)?(\w+)\s+processes/i,
  ],
  suggest_improvement: [
    /suggest\s+(improvements?|changes?)\s+(for|to)\s+(the\s+)?(\w+)/i,
    /how\s+(can|could)\s+(I|we)\s+improve\s+(the\s+)?(\w+)/i,
    /make\s+(the\s+)?(\w+)\s+better/i,
    /optimize\s+(the\s+)?(\w+)/i,
    /improve\s+this\s+process/i,
    /suggestions?\s+for\s+(this|the)\s+process/i,
  ],
  get_next_step: [
    /what('s|\s+is)\s+(the\s+)?next\s+step/i,
    /next\s+step\s+in\s+(\w+)/i,
    /what\s+(should|do)\s+I\s+do\s+next/i,
    /where\s+do\s+I\s+go\s+from\s+here/i,
    /what\s+comes\s+(next|after\s+this)/i,
  ],
  get_checklist: [
    /checklist\s+(for|of)\s+(the\s+)?(\w+)/i,
    /what\s+(tasks|items)\s+(are\s+)?(in|on)\s+(the\s+)?(\w+)/i,
    /tasks\s+(for|in)\s+(the\s+)?(\w+)/i,
    /show\s+(me\s+)?(the\s+)?checklist/i,
  ],
  general_question: [
    /what\s+is/i,
    /how\s+do/i,
    /can\s+you/i,
    /tell\s+me/i,
    /help\s+me/i,
  ],
  unknown: [],
};

// Extract entities from message
function extractEntities(message: string, process?: Process): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  
  // Extract person names (basic pattern)
  const personPattern = /(?:for|by|to|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  let match;
  while ((match = personPattern.exec(message)) !== null) {
    entities.push({
      type: 'person',
      value: match[1],
      confidence: 0.8,
    });
  }
  
  // Extract department names
  const departments = ['marketing', 'sales', 'hr', 'engineering', 'operations', 'finance', 'support'];
  for (const dept of departments) {
    if (message.toLowerCase().includes(dept)) {
      entities.push({
        type: 'department',
        value: dept,
        confidence: 0.9,
      });
    }
  }
  
  // Extract step names from current process
  if (process) {
    for (const step of process.steps) {
      if (message.toLowerCase().includes(step.name.toLowerCase()) ||
          message.toLowerCase().includes(step.stepId.toLowerCase())) {
        entities.push({
          type: 'step',
          value: step.stepId,
          confidence: 0.95,
        });
      }
    }
  }
  
  // Extract time-related entities
  const timePattern = /(\d+)\s*(hour|minute|day|week|month)/gi;
  while ((match = timePattern.exec(message)) !== null) {
    entities.push({
      type: 'time',
      value: match[0],
      confidence: 0.9,
    });
  }
  
  return entities;
}

// Determine intent from message
function determineIntent(message: string): { intent: AIIntent; confidence: number } {
  const lowerMessage = message.toLowerCase();
  
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerMessage)) {
        return { 
          intent: intent as AIIntent, 
          confidence: 0.85 + (Math.random() * 0.1) // 85-95% confidence
        };
      }
    }
  }
  
  return { intent: 'general_question', confidence: 0.5 };
}

// Generate response based on intent
function generateResponse(
  intent: AIIntent,
  entities: ExtractedEntity[],
  message: string,
  process?: Process,
  currentStepId?: string
): { message: string; action?: AIAction; suggestions: string[]; data?: Record<string, unknown> } {
  const currentStep = process?.steps.find(s => s.stepId === currentStepId);
  
  switch (intent) {
    case 'start_process': {
      const personEntity = entities.find(e => e.type === 'person');
      const processName = process?.name || 'the process';
      
      if (personEntity) {
        return {
          message: `Got it! I'll start **${processName}** for **${personEntity.value}**. This will create a new instance with their information pre-filled. Would you like me to proceed?`,
          action: {
            type: 'create_instance',
            payload: { personName: personEntity.value, processId: process?.processId },
          },
          suggestions: [
            'Yes, create the instance',
            'Show me the first step',
            'What information do I need?',
          ],
        };
      }
      
      return {
        message: `Ready to start **${processName}**! Who is this instance for? Let me know the name and I'll set it up.`,
        suggestions: [
          'Start for [Name]',
          'Show me the steps first',
          'What does this process do?',
        ],
      };
    }
    
    case 'get_next_step': {
      if (!process || !currentStep) {
        return {
          message: "I don't see a current step selected. Could you select a step first, or tell me which process you're working on?",
          suggestions: [
            'Show me the process',
            'Start from the beginning',
            'List all steps',
          ],
        };
      }
      
      const currentIndex = process.steps.findIndex(s => s.stepId === currentStep.stepId);
      const nextStep = process.steps[currentIndex + 1];
      
      if (nextStep) {
        return {
          message: `The next step is **${nextStep.name}** (${nextStep.stepId}).\n\n${nextStep.shortDescription}\n\n${nextStep.timing?.estimatedDuration ? `⏱️ Estimated time: ${nextStep.timing.estimatedDuration}` : ''}\n👤 Owner: ${nextStep.ownership.owner.name}`,
          action: {
            type: 'navigate',
            payload: { stepId: nextStep.stepId },
          },
          suggestions: [
            'Go to this step',
            `Tell me more about ${nextStep.name}`,
            'Show the checklist',
          ],
          data: { nextStep },
        };
      }
      
      return {
        message: `🎉 You've reached the end of **${process.name}**! All steps are complete. Would you like to review anything or start a new instance?`,
        suggestions: [
          'Review all steps',
          'Start new instance',
          'Show process summary',
        ],
      };
    }
    
    case 'explain_step': {
      if (!currentStep && process) {
        // Try to find step from entities
        const stepEntity = entities.find(e => e.type === 'step');
        if (stepEntity) {
          const step = process.steps.find(s => s.stepId === stepEntity.value);
          if (step) {
            return {
              message: `## ${step.name}\n\n${step.longDescription}\n\n${step.whyItMatters ? `### Why it matters\n${step.whyItMatters}` : ''}`,
              action: {
                type: 'highlight',
                payload: { stepId: step.stepId },
              },
              suggestions: [
                'Show the checklist',
                'Who owns this step?',
                'How long does it take?',
              ],
              data: { step },
            };
          }
        }
        
        return {
          message: "Which step would you like me to explain? Select a step or tell me its name.",
          suggestions: process.steps.slice(0, 3).map(s => `Explain ${s.name}`),
        };
      }
      
      if (currentStep) {
        return {
          message: `## ${currentStep.name}\n\n${currentStep.longDescription}\n\n${currentStep.whyItMatters ? `### Why it matters\n${currentStep.whyItMatters}` : ''}`,
          suggestions: [
            'Show the checklist',
            'What comes next?',
            'Who should I contact?',
          ],
          data: { step: currentStep },
        };
      }
      
      return {
        message: "I'd be happy to explain! Please select a step first.",
        suggestions: ['Show all steps', 'Start from the beginning'],
      };
    }
    
    case 'get_timing': {
      if (currentStep?.timing) {
        const timing = currentStep.timing;
        let response = `⏱️ **${currentStep.name}** timing:\n\n`;
        response += `• Estimated duration: **${timing.estimatedDuration}**\n`;
        if (timing.slaHours) response += `• SLA: ${timing.slaHours} hours\n`;
        if (timing.bestTimeToStart) response += `• Best time to start: ${timing.bestTimeToStart}\n`;
        if (timing.dependencies?.length) {
          response += `• Must complete first: ${timing.dependencies.join(', ')}\n`;
        }
        
        return {
          message: response,
          suggestions: [
            'What comes next?',
            'Show the checklist',
            'Who owns this step?',
          ],
          data: { timing },
        };
      }
      
      if (process) {
        return {
          message: `The overall process **${process.name}** takes approximately **${process.estimatedDuration}**.\n\nWant me to break down the timing for specific steps?`,
          suggestions: process.steps.slice(0, 3).map(s => `Timing for ${s.name}`),
        };
      }
      
      return {
        message: "Which step's timing would you like to know?",
        suggestions: ['Show process overview', 'List all steps'],
      };
    }
    
    case 'get_owner': {
      if (currentStep) {
        const ownership = currentStep.ownership;
        let response = `👤 **${currentStep.name}** ownership:\n\n`;
        response += `• **Owner:** ${ownership.owner.name} (${ownership.owner.department})\n`;
        if (ownership.involved.length) {
          response += `• **Also involved:** ${ownership.involved.map(r => r.name).join(', ')}\n`;
        }
        if (ownership.escalateTo) {
          response += `• **Escalate to:** ${ownership.escalateTo.name}\n`;
        }
        
        return {
          message: response,
          suggestions: [
            'What does this step involve?',
            'How long does it take?',
            'What comes next?',
          ],
          data: { ownership },
        };
      }
      
      if (process) {
        return {
          message: `The **${process.name}** process is owned by **${process.owner.name}** (${process.owner.department}).\n\nInvolved roles: ${process.involved.map(r => r.name).join(', ')}`,
          suggestions: ['Show all steps', 'Who owns each step?'],
        };
      }
      
      return {
        message: "Which step's owner would you like to know?",
        suggestions: ['Show process overview'],
      };
    }
    
    case 'search_processes': {
      const deptEntity = entities.find(e => e.type === 'department');
      
      if (deptEntity) {
        return {
          message: `I'll search for processes related to **${deptEntity.value}**. Here's what I found:\n\n• Employee Onboarding (HR-ONB-001)\n• Performance Review (HR-REV-001)\n• Exit Process (HR-EXIT-001)\n\n_Note: This is a demo response. In production, I'd query your full process library._`,
          action: {
            type: 'filter',
            payload: { department: deptEntity.value },
          },
          suggestions: [
            `Show ${deptEntity.value} processes`,
            'Start onboarding',
            'Search for more',
          ],
        };
      }
      
      return {
        message: "What type of processes are you looking for? You can search by department (HR, Marketing, Sales) or by keyword.",
        suggestions: [
          'HR processes',
          'Marketing flows',
          'Onboarding processes',
        ],
      };
    }
    
    case 'suggest_improvement': {
      if (!process) {
        return {
          message: "I'd love to suggest improvements! Please select or open a process first.",
          suggestions: ['Show all processes', 'Open marketing flow'],
        };
      }
      
      // Generate intelligent suggestions based on process analysis
      const suggestions: string[] = [];
      const improvements: Array<{ step: string; suggestion: string; impact: string }> = [];
      
      for (const step of process.steps) {
        // Check for automation opportunities
        if (step.automationLevel === 'none' && step.type !== 'decision') {
          improvements.push({
            step: step.name,
            suggestion: `Consider automating the "${step.name}" step`,
            impact: 'Could reduce manual effort by 60-80%',
          });
        }
        
        // Check for missing checklists
        if (!step.checklist && step.type === 'task') {
          improvements.push({
            step: step.name,
            suggestion: `Add a checklist to "${step.name}"`,
            impact: 'Reduces errors and ensures consistency',
          });
        }
        
        // Check for missing videos
        if (!step.videos?.length && step.longDescription.length > 200) {
          improvements.push({
            step: step.name,
            suggestion: `Add a training video to "${step.name}"`,
            impact: 'Improves understanding and reduces training time',
          });
        }
      }
      
      let response = `## 💡 Improvement Suggestions for ${process.name}\n\n`;
      
      if (improvements.length > 0) {
        improvements.slice(0, 4).forEach((imp, i) => {
          response += `### ${i + 1}. ${imp.suggestion}\n`;
          response += `📍 Step: ${imp.step}\n`;
          response += `📈 Impact: ${imp.impact}\n\n`;
        });
        
        return {
          message: response,
          suggestions: [
            'Tell me more about suggestion 1',
            'How do I automate a step?',
            'Show automation analysis',
          ],
          data: { improvements },
        };
      }
      
      return {
        message: `Your **${process.name}** process looks well-optimized! 🎉\n\nI don't see any obvious improvement opportunities. Would you like me to analyze specific aspects like:\n• Bottleneck detection\n• Automation potential\n• Training gaps`,
        suggestions: [
          'Find bottlenecks',
          'Automation opportunities',
          'Review all steps',
        ],
      };
    }
    
    case 'get_checklist': {
      if (currentStep?.checklist) {
        const checklist = currentStep.checklist;
        let response = `## ✅ ${checklist.title}\n\n`;
        
        checklist.items.forEach((item, i) => {
          response += `${i + 1}. ${item.text}${item.required ? ' *(required)*' : ''}\n`;
          if (item.helpText) response += `   _${item.helpText}_\n`;
        });
        
        if (checklist.completionCriteria) {
          response += `\n**Completion criteria:** ${checklist.completionCriteria}`;
        }
        
        return {
          message: response,
          suggestions: [
            'What comes next?',
            'Who owns this step?',
            'Start the checklist',
          ],
          data: { checklist },
        };
      }
      
      if (currentStep) {
        return {
          message: `The "${currentStep.name}" step doesn't have a checklist yet. Would you like me to suggest items for one?`,
          suggestions: [
            'Yes, suggest checklist items',
            'Skip to next step',
            'Show step details',
          ],
        };
      }
      
      return {
        message: "Please select a step to view its checklist.",
        suggestions: ['Show all steps'],
      };
    }
    
    case 'general_question':
    default: {
      // Conversational fallback
      const greetings = ['hi', 'hello', 'hey', 'help', 'what can you do'];
      if (greetings.some(g => message.toLowerCase().includes(g))) {
        return {
          message: `Hey! 👋 I'm your ProcessCore AI assistant. I can help you:\n\n• **Navigate processes** - "Show me the marketing flow"\n• **Explain steps** - "Why does this step matter?"\n• **Track progress** - "What's the next step?"\n• **Find owners** - "Who handles content review?"\n• **Get timing info** - "How long should this take?"\n• **Suggest improvements** - "How can we optimize this?"\n\nWhat would you like to do?`,
          suggestions: [
            'Show current process',
            'What should I do next?',
            'Suggest improvements',
          ],
        };
      }
      
      return {
        message: `I'm not quite sure what you're asking, but I'm here to help! Try asking me:\n\n• "What's the next step?"\n• "Explain this step"\n• "Who owns this process?"\n• "How long should this take?"`,
        suggestions: [
          'Show me what you can do',
          'List all processes',
          'Help me get started',
        ],
      };
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, processData } = body;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Determine intent
    const { intent, confidence } = determineIntent(message);
    
    // Extract entities
    const entities = extractEntities(message, processData);
    
    // Get current step if we have context
    const currentStepId = context?.currentStepId;
    
    // Generate response
    const response = generateResponse(
      intent,
      entities,
      message,
      processData,
      currentStepId
    );
    
    const aiResponse: AIChatResponse = {
      message: response.message,
      intent,
      entities,
      action: response.action,
      suggestions: response.suggestions,
      confidence,
      data: response.data,
    };
    
    return NextResponse.json(aiResponse);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
