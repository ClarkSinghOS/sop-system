import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get('video') as File;
    const duration = formData.get('duration') as string;

    if (!video) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `recordings/${timestamp}-${video.name}`;

    // Convert file to buffer
    const buffer = Buffer.from(await video.arrayBuffer());

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('sop-recordings')
      .upload(filename, buffer, {
        contentType: video.type || 'video/webm',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      // If bucket doesn't exist, try to create it
      if (error.message.includes('not found')) {
        return NextResponse.json({ 
          error: 'Storage bucket not configured. Please create "sop-recordings" bucket in Supabase.',
          details: error.message 
        }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('sop-recordings')
      .getPublicUrl(filename);

    // Save metadata to database (optional)
    const { error: dbError } = await supabase
      .from('recordings')
      .insert({
        filename,
        url: urlData.publicUrl,
        duration: parseInt(duration) || 0,
        status: 'uploaded',
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.warn('Failed to save recording metadata:', dbError);
      // Non-fatal - continue without database entry
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename,
      duration: parseInt(duration) || 0,
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

// Route segment config for Next.js App Router
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
