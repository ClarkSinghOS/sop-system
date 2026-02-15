import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { StartProcessRequest, ProcessInstance, InstanceStep, InstanceEvent } from '@/types/execution';
import { marketingFlowProcess } from '@/data/marketing-flow';

export async function POST(request: NextRequest) {
  try {
    const body: StartProcessRequest = await request.json();
    const { process_id, variables = {}, started_by = 'system', notes } = body;

    const supabase = createServerClient();

    // For demo, we use the local marketing flow process
    // In production, fetch from database by process_id
    let processSnapshot = marketingFlowProcess;
    let dbProcessId: string | null = null;

    // Try to fetch from DB if process_id is a UUID
    if (process_id && process_id.length > 10) {
      const { data: dbProcess } = await supabase
        .from('processes')
        .select('*')
        .eq('id', process_id)
        .single();

      if (dbProcess) {
        dbProcessId = dbProcess.id;
        // Merge DB process with local for now
      }
    }

    // Create the process instance
    const { data: instance, error: instanceError } = await supabase
      .from('process_instances')
      .insert({
        process_id: dbProcessId,
        process_snapshot: processSnapshot,
        status: 'in_progress',
        variables,
        current_step_id: processSnapshot.steps[0]?.stepId || null,
        started_by,
        notes,
      })
      .select()
      .single();

    if (instanceError) {
      console.error('Instance creation error:', instanceError);
      return NextResponse.json(
        { error: 'Failed to create process instance', details: instanceError.message },
        { status: 500 }
      );
    }

    // Create instance steps for each process step
    const stepsToInsert = processSnapshot.steps.map((step, index) => ({
      instance_id: instance.id,
      step_id: step.stepId,
      sequence: index + 1,
      status: index === 0 ? 'in_progress' : 'pending',
      started_at: index === 0 ? new Date().toISOString() : null,
    }));

    const { data: steps, error: stepsError } = await supabase
      .from('instance_steps')
      .insert(stepsToInsert)
      .select();

    if (stepsError) {
      console.error('Steps creation error:', stepsError);
      // Rollback instance
      await supabase.from('process_instances').delete().eq('id', instance.id);
      return NextResponse.json(
        { error: 'Failed to create instance steps', details: stepsError.message },
        { status: 500 }
      );
    }

    // Create start event
    await supabase.from('instance_events').insert({
      instance_id: instance.id,
      event_type: 'instance_started',
      actor: started_by,
      message: `Process "${processSnapshot.name}" started`,
      metadata: { variables },
    });

    // Create step started event
    if (processSnapshot.steps[0]) {
      await supabase.from('instance_events').insert({
        instance_id: instance.id,
        event_type: 'step_started',
        step_id: processSnapshot.steps[0].stepId,
        actor: started_by,
        message: `Step "${processSnapshot.steps[0].name}" started`,
      });
    }

    return NextResponse.json({
      instance: instance as ProcessInstance,
      steps: steps as InstanceStep[],
    });
  } catch (error) {
    console.error('Start process error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
