import { NextRequest, NextResponse } from 'next/server';

const ANALYSIS_PROMPT = `You are an expert at analyzing process recordings and extracting structured SOP (Standard Operating Procedure) information.

Given a transcript of someone demonstrating a process, extract:
1. Individual steps (each distinct action or phase)
2. Chapter markers with timestamps
3. Decision points (where someone might take different paths)
4. Tools/software mentioned
5. Estimated time for each step
6. Who should own each step (role, not person name)

For each step, provide:
- name: Short action-oriented title (e.g., "Configure Settings", "Review Output")
- shortDescription: One sentence summary
- longDescription: Detailed explanation of what to do
- estimatedMinutes: Rough time estimate
- ownerRole: What role should do this (e.g., "Developer", "Marketing Lead")
- automationPotential: "none" | "partial" | "full"
- toolsMentioned: Array of software/tools used

For chapters, provide:
- time: Timestamp in seconds
- title: Chapter title
- description: Brief description

Respond in JSON format:
{
  "processName": "Suggested name for this process",
  "steps": [...],
  "chapters": [...],
  "decisions": [...],
  "summary": "Brief overview of the entire process"
}`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, duration, videoUrl } = await request.json();

    // If no transcript, return empty analysis with suggestion
    if (!transcript || transcript.trim() === '') {
      return NextResponse.json({
        processName: 'Untitled Process',
        steps: [],
        chapters: generateDefaultChapters(duration),
        decisions: [],
        summary: 'No transcript available. Add steps manually or re-record with narration.',
        message: 'No transcript provided. Consider recording with narration for automatic step extraction.',
      });
    }

    // Use Claude for analysis
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: `${ANALYSIS_PROMPT}\n\nTranscript:\n${transcript}\n\nVideo duration: ${duration} seconds`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API error:', error);
        return NextResponse.json(fallbackAnalysis(duration), { status: 200 });
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;

      if (content) {
        try {
          // Extract JSON from response (Claude sometimes adds explanation text)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return NextResponse.json(analysis);
          }
        } catch (parseError) {
          console.error('Failed to parse Claude response:', parseError);
        }
      }
    }

    // Fallback: Use OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: ANALYSIS_PROMPT,
            },
            {
              role: 'user',
              content: `Transcript:\n${transcript}\n\nVideo duration: ${duration} seconds`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OpenAI API error:', error);
        return NextResponse.json(fallbackAnalysis(duration), { status: 200 });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (content) {
        try {
          const analysis = JSON.parse(content);
          return NextResponse.json(analysis);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', parseError);
        }
      }
    }

    // No AI service configured - return fallback
    return NextResponse.json({
      ...fallbackAnalysis(duration),
      message: 'No AI service configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY for automatic analysis.',
    });

  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}

function fallbackAnalysis(duration: number) {
  return {
    processName: 'Untitled Process',
    steps: [
      {
        name: 'Step 1',
        shortDescription: 'First step of the process',
        longDescription: 'Edit this step to describe what happens here.',
        estimatedMinutes: Math.floor(duration / 60 / 3) || 5,
        ownerRole: 'Team Member',
        automationPotential: 'partial',
        toolsMentioned: [],
      },
      {
        name: 'Step 2',
        shortDescription: 'Second step of the process',
        longDescription: 'Edit this step to describe what happens here.',
        estimatedMinutes: Math.floor(duration / 60 / 3) || 5,
        ownerRole: 'Team Member',
        automationPotential: 'partial',
        toolsMentioned: [],
      },
      {
        name: 'Step 3',
        shortDescription: 'Final step of the process',
        longDescription: 'Edit this step to describe what happens here.',
        estimatedMinutes: Math.floor(duration / 60 / 3) || 5,
        ownerRole: 'Team Member',
        automationPotential: 'partial',
        toolsMentioned: [],
      },
    ],
    chapters: generateDefaultChapters(duration),
    decisions: [],
    summary: 'Process recorded. Edit the steps to add details.',
  };
}

function generateDefaultChapters(duration: number) {
  const chapters = [];
  const chapterCount = Math.min(Math.ceil(duration / 120), 5); // One chapter per 2 mins, max 5
  
  for (let i = 0; i < chapterCount; i++) {
    chapters.push({
      time: Math.floor((duration / chapterCount) * i),
      title: `Part ${i + 1}`,
      description: `Section ${i + 1} of the recording`,
    });
  }
  
  return chapters;
}
