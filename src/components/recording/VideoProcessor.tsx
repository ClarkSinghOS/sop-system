'use client';

import { useState, useEffect } from 'react';
import { ProcessStep } from '@/types/process';

interface VideoProcessorProps {
  videoBlob: Blob;
  duration: number;
  onProcessComplete: (result: ProcessingResult) => void;
  onCancel: () => void;
}

interface ProcessingResult {
  videoUrl: string;
  transcript: string;
  suggestedSteps: Partial<ProcessStep>[];
  chapters: Array<{ time: number; title: string; description: string }>;
}

type ProcessingStage = 'uploading' | 'transcribing' | 'analyzing' | 'complete' | 'error';

export default function VideoProcessor({ videoBlob, duration, onProcessComplete, onCancel }: VideoProcessorProps) {
  const [stage, setStage] = useState<ProcessingStage>('uploading');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  useEffect(() => {
    processVideo();
  }, []);

  const processVideo = async () => {
    try {
      // Stage 1: Upload video
      setStage('uploading');
      setProgress(0);
      
      const formData = new FormData();
      formData.append('video', videoBlob, `recording-${Date.now()}.webm`);
      formData.append('duration', duration.toString());

      const uploadResponse = await fetch('/api/recording/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const { url } = await uploadResponse.json();
      setVideoUrl(url);
      setProgress(33);

      // Stage 2: Transcribe audio
      setStage('transcribing');
      
      const transcribeResponse = await fetch('/api/recording/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: url }),
      });

      if (!transcribeResponse.ok) {
        // Non-fatal - continue without transcript
        console.warn('Transcription failed, continuing without');
        setTranscript('');
      } else {
        const { transcript: transcriptText } = await transcribeResponse.json();
        setTranscript(transcriptText);
      }
      setProgress(66);

      // Stage 3: AI Analysis - extract steps
      setStage('analyzing');
      
      const analyzeResponse = await fetch('/api/recording/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcript || '',
          duration,
          videoUrl: url,
        }),
      });

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze recording');
      }

      const analysis = await analyzeResponse.json();
      setProgress(100);
      setStage('complete');

      onProcessComplete({
        videoUrl: url,
        transcript: transcript || '',
        suggestedSteps: analysis.steps || [],
        chapters: analysis.chapters || [],
      });

    } catch (err) {
      console.error('Processing failed:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      setStage('error');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stageInfo: Record<ProcessingStage, { label: string; description: string }> = {
    uploading: { label: 'Uploading', description: 'Uploading video to storage...' },
    transcribing: { label: 'Transcribing', description: 'Converting speech to text...' },
    analyzing: { label: 'Analyzing', description: 'AI is identifying steps and structure...' },
    complete: { label: 'Complete', description: 'Processing finished!' },
    error: { label: 'Error', description: error || 'Something went wrong' },
  };

  return (
    <div className="p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]">
      {/* Video Preview */}
      <div className="mb-6 rounded-lg overflow-hidden bg-black aspect-video">
        <video
          src={URL.createObjectURL(videoBlob)}
          className="w-full h-full object-contain"
          controls={stage === 'complete' || stage === 'error'}
          muted={stage !== 'complete' && stage !== 'error'}
          autoPlay={false}
        />
      </div>

      {/* Recording Info */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-[var(--text-tertiary)]">Recording Duration</span>
        <span className="font-mono text-[var(--text-primary)]">{formatDuration(duration)}</span>
      </div>

      {/* Progress */}
      {stage !== 'error' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text-primary)]">{stageInfo[stage].label}</span>
            <span className="text-sm text-[var(--accent-cyan)]">{progress}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--accent-lime)] to-[var(--accent-cyan)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-tertiary)]">{stageInfo[stage].description}</p>
        </div>
      )}

      {/* Processing Stages Visual */}
      {stage !== 'error' && stage !== 'complete' && (
        <div className="flex items-center justify-between mb-6">
          {['uploading', 'transcribing', 'analyzing'].map((s, i) => {
            const isActive = s === stage;
            const isComplete = ['uploading', 'transcribing', 'analyzing'].indexOf(stage) > i;
            
            return (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isComplete ? 'bg-[var(--accent-lime)] text-black' :
                  isActive ? 'bg-[var(--accent-cyan)] text-black animate-pulse' :
                  'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                }`}>
                  {isComplete ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < 2 && (
                  <div className={`w-16 h-0.5 ${
                    isComplete ? 'bg-[var(--accent-lime)]' : 'bg-[var(--bg-tertiary)]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error State */}
      {stage === 'error' && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium text-red-400">Processing Failed</p>
              <p className="text-sm text-red-400/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {stage === 'error' && (
          <>
            <button
              onClick={() => processVideo()}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium hover:opacity-90"
            >
              Retry
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            >
              Cancel
            </button>
          </>
        )}
        {stage !== 'error' && stage !== 'complete' && (
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          >
            Cancel
          </button>
        )}
      </div>

      {/* What's happening */}
      {stage !== 'error' && stage !== 'complete' && (
        <div className="mt-6 p-4 rounded-lg bg-[var(--bg-tertiary)]">
          <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">What's happening:</p>
          <ul className="text-xs text-[var(--text-tertiary)] space-y-1">
            {stage === 'uploading' && (
              <>
                <li>• Compressing and optimizing video</li>
                <li>• Uploading to secure storage</li>
              </>
            )}
            {stage === 'transcribing' && (
              <>
                <li>• Extracting audio from recording</li>
                <li>• Converting speech to text with Whisper</li>
                <li>• Identifying speaker timestamps</li>
              </>
            )}
            {stage === 'analyzing' && (
              <>
                <li>• AI reading transcript</li>
                <li>• Identifying discrete process steps</li>
                <li>• Generating chapter markers</li>
                <li>• Suggesting owners and timing</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
