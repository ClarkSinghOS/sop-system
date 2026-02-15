'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  ProcessInstance,
  InstanceStep,
  InstanceAssignment,
  InstanceWithDetails,
  TimelineEntry,
  StartProcessRequest,
  CompleteStepRequest,
  AssignStepRequest,
} from '@/types/execution';

interface UseProcessInstanceOptions {
  instanceId?: string;
  autoRefresh?: boolean;
}

interface UseProcessInstanceReturn {
  instance: InstanceWithDetails | null;
  timeline: TimelineEntry[];
  loading: boolean;
  error: string | null;
  startProcess: (request: StartProcessRequest) => Promise<InstanceWithDetails | null>;
  completeStep: (request: CompleteStepRequest) => Promise<boolean>;
  assignStep: (request: AssignStepRequest) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useProcessInstance(options: UseProcessInstanceOptions = {}): UseProcessInstanceReturn {
  const { instanceId, autoRefresh = true } = options;

  const [instance, setInstance] = useState<InstanceWithDetails | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch instance data
  const fetchInstance = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/execution/${id}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch instance');
      }

      const data: InstanceWithDetails = await response.json();
      setInstance(data);

      // Also fetch timeline
      const timelineResponse = await fetch(`/api/execution/${id}/timeline`);
      if (timelineResponse.ok) {
        const timelineData = await timelineResponse.json();
        setTimeline(timelineData.timeline || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh current instance
  const refresh = useCallback(async () => {
    if (instance?.id) {
      await fetchInstance(instance.id);
    }
  }, [instance?.id, fetchInstance]);

  // Start a new process
  const startProcess = useCallback(async (request: StartProcessRequest): Promise<InstanceWithDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/execution/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start process');
      }

      const data = await response.json();
      
      // Fetch full instance details
      const detailsResponse = await fetch(`/api/execution/${data.instance.id}`);
      if (detailsResponse.ok) {
        const details: InstanceWithDetails = await detailsResponse.json();
        setInstance(details);
        
        // Fetch initial timeline
        const timelineResponse = await fetch(`/api/execution/${data.instance.id}/timeline`);
        if (timelineResponse.ok) {
          const timelineData = await timelineResponse.json();
          setTimeline(timelineData.timeline || []);
        }
        
        return details;
      }

      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete a step
  const completeStep = useCallback(async (request: CompleteStepRequest): Promise<boolean> => {
    if (!instance?.id) {
      setError('No active instance');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/execution/${instance.id}/complete-step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete step');
      }

      // Refresh to get updated state
      await fetchInstance(instance.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [instance?.id, fetchInstance]);

  // Assign a step
  const assignStep = useCallback(async (request: AssignStepRequest): Promise<boolean> => {
    if (!instance?.id) {
      setError('No active instance');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/execution/${instance.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign step');
      }

      // Refresh to get updated state
      await fetchInstance(instance.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [instance?.id, fetchInstance]);

  // Load instance on mount if ID provided
  useEffect(() => {
    if (instanceId) {
      fetchInstance(instanceId);
    }
  }, [instanceId, fetchInstance]);

  // Real-time subscriptions
  useEffect(() => {
    if (!instance?.id || !autoRefresh) return;

    const instanceId = instance.id;

    // Subscribe to instance changes
    const instanceChannel = supabase
      .channel(`instance:${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'process_instances',
          filter: `id=eq.${instanceId}`,
        },
        () => {
          fetchInstance(instanceId);
        }
      )
      .subscribe();

    // Subscribe to step changes
    const stepsChannel = supabase
      .channel(`steps:${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instance_steps',
          filter: `instance_id=eq.${instanceId}`,
        },
        () => {
          fetchInstance(instanceId);
        }
      )
      .subscribe();

    // Subscribe to events for timeline
    const eventsChannel = supabase
      .channel(`events:${instanceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'instance_events',
          filter: `instance_id=eq.${instanceId}`,
        },
        (payload) => {
          const newEvent = payload.new as {
            id: string;
            event_type: string;
            step_id: string | null;
            actor: string | null;
            message: string | null;
            metadata: Record<string, unknown>;
            created_at: string;
          };
          setTimeline(prev => [{
            id: newEvent.id,
            type: newEvent.event_type as TimelineEntry['type'],
            step_id: newEvent.step_id,
            actor: newEvent.actor,
            message: newEvent.message,
            metadata: newEvent.metadata || {},
            created_at: newEvent.created_at,
          }, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(instanceChannel);
      supabase.removeChannel(stepsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [instance?.id, autoRefresh, fetchInstance]);

  return {
    instance,
    timeline,
    loading,
    error,
    startProcess,
    completeStep,
    assignStep,
    refresh,
  };
}
