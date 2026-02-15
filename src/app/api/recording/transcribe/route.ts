import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
    }

    // Option 1: Use OpenAI Whisper API (if you have an API key)
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey) {
      // Download video and extract audio
      // For now, we'll use a placeholder since video-to-audio extraction
      // requires ffmpeg or a cloud service
      
      // This would be the flow:
      // 1. Download video from URL
      // 2. Extract audio track (ffmpeg or cloud service)
      // 3. Send to Whisper API
      // 4. Return transcript with timestamps
      
      // Placeholder response for now
      return NextResponse.json({
        transcript: '',
        segments: [],
        message: 'Transcription requires audio extraction. Set up Deepgram or Whisper with ffmpeg.',
      });
    }

    // Option 2: Use Deepgram (better for real-time and video)
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    
    if (deepgramKey) {
      const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true&timestamps=true', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: videoUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Deepgram error:', error);
        return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
      }

      const data = await response.json();
      const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      const words = data.results?.channels?.[0]?.alternatives?.[0]?.words || [];

      // Convert to timestamped segments
      const segments = groupWordsIntoSegments(words);

      return NextResponse.json({
        transcript,
        segments,
        raw: data,
      });
    }

    // No transcription service configured
    return NextResponse.json({
      transcript: '',
      segments: [],
      message: 'No transcription service configured. Add OPENAI_API_KEY or DEEPGRAM_API_KEY to enable.',
    });

  } catch (error) {
    console.error('Transcription failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Transcription failed' },
      { status: 500 }
    );
  }
}

// Helper to group words into sentence-like segments
function groupWordsIntoSegments(words: Array<{ word: string; start: number; end: number }>) {
  const segments: Array<{ text: string; start: number; end: number }> = [];
  let currentSegment = { text: '', start: 0, end: 0 };
  
  words.forEach((word, i) => {
    if (currentSegment.text === '') {
      currentSegment.start = word.start;
    }
    
    currentSegment.text += (currentSegment.text ? ' ' : '') + word.word;
    currentSegment.end = word.end;
    
    // Split on sentence endings or after ~10 words
    const wordCount = currentSegment.text.split(' ').length;
    const endsWithPunctuation = /[.!?]$/.test(word.word);
    
    if (endsWithPunctuation || wordCount >= 10 || i === words.length - 1) {
      segments.push({ ...currentSegment });
      currentSegment = { text: '', start: 0, end: 0 };
    }
  });
  
  return segments;
}
