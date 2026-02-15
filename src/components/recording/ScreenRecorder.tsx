'use client';

import { useState, useRef, useCallback } from 'react';

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => void;
  onTranscriptReady?: (transcript: string) => void;
}

type RecordingState = 'idle' | 'requesting' | 'recording' | 'paused' | 'processing';

export default function ScreenRecorder({ onRecordingComplete, onTranscriptReady }: ScreenRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      setState('requesting');
      setError(null);
      
      // Request screen capture with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      // Try to get microphone audio for narration
      let audioStream: MediaStream | null = null;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      } catch {
        console.log('No microphone access, continuing without narration audio');
      }

      // Combine streams
      const tracks = [...displayStream.getTracks()];
      if (audioStream) {
        tracks.push(...audioStream.getAudioTracks());
      }
      
      const combinedStream = new MediaStream(tracks);
      streamRef.current = combinedStream;

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';
      
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, finalDuration);
        setState('processing');
      };

      // Handle stream end (user stops sharing)
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      startTimeRef.current = Date.now();
      setState('recording');

      // Update duration timer
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      setState('idle');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [state]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [state]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
  }, [state]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          state === 'recording' ? 'bg-red-500 animate-pulse' : 
          state === 'paused' ? 'bg-yellow-500' :
          'bg-[var(--accent-cyan)]/20'
        }`}>
          {state === 'recording' ? (
            <div className="w-3 h-3 rounded-full bg-white" />
          ) : state === 'paused' ? (
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">
            {state === 'idle' && 'Record Process'}
            {state === 'requesting' && 'Requesting Access...'}
            {state === 'recording' && 'Recording...'}
            {state === 'paused' && 'Paused'}
            {state === 'processing' && 'Processing...'}
          </h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            {state === 'idle' && 'Capture your screen while performing the process'}
            {state === 'recording' && formatDuration(duration)}
            {state === 'paused' && `Paused at ${formatDuration(duration)}`}
            {state === 'processing' && 'Generating video...'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {state === 'idle' && (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-cyan)] text-black font-medium hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            Start Recording
          </button>
        )}

        {state === 'recording' && (
          <>
            <button
              onClick={pauseRecording}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-yellow-500 text-black font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={resumeRecording}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-lime)] text-black font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Resume
            </button>
            <button
              onClick={stopRecording}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Stop
            </button>
          </>
        )}

        {(state === 'requesting' || state === 'processing') && (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {state === 'requesting' ? 'Requesting access...' : 'Processing...'}
          </div>
        )}
      </div>

      {/* Tips */}
      {state === 'idle' && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-tertiary)]">
          <p className="font-medium text-[var(--text-secondary)] mb-1">Tips for great recordings:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Narrate what you're doing as you go</li>
            <li>Go slowly and explain each step</li>
            <li>Mention decision points and why you chose that path</li>
            <li>Keep recordings under 10 minutes per step</li>
          </ul>
        </div>
      )}
    </div>
  );
}
