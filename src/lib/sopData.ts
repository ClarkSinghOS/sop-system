import { SOPProcess, SOPAIFormat } from '@/types/sop';
import { Node, Edge } from 'reactflow';
import { SOPNodeData } from '@/types/sop';

// HR-ONB-001: New Employee Onboarding - Human Format
export const hrOnboardingProcess: SOPProcess = {
  processId: 'HR-ONB-001',
  name: 'New Employee Onboarding',
  version: '2.3',
  department: 'HR',
  owner: 'HR Manager',
  involved: ['IT', 'Finance', 'Department Head'],
  frequency: 'Per new hire',
  estimatedDuration: '5 business days',
  lastUpdated: '2026-02-15',
  shortVersion: [
    '1. Collect docs',
    '2. Setup accounts',
    '3. First day orientation'
  ],
  steps: [
    {
      id: '1',
      stepId: 'HR-ONB-001-A',
      name: 'Collect Documents',
      shortDescription: 'Get ID, tax forms, bank details from new hire',
      longDescription: `Complete document collection checklist:
• Government-issued ID (passport or driver's license)
• Tax file declaration (TFD/W-4 equivalent)
• Bank account details for payroll
• Emergency contact information
• Signed employment contract
• Non-disclosure agreement
• Photo for ID badge

Send automated email with secure upload link. Follow up after 24h if incomplete.`,
      owner: 'HR Coordinator',
      duration: '1-2 days',
      videoUrl: 'https://www.loom.com/embed/example-collect-docs',
      automatable: 'partial',
      linkedProcesses: ['FIN-PAY-001', 'ADMIN-SEC-001'],
    },
    {
      id: '2',
      stepId: 'HR-ONB-001-B',
      name: 'Setup System Accounts',
      shortDescription: 'Create email, Slack, tool access',
      longDescription: `Parallel account setup:
• Google Workspace account (email, calendar, drive)
• Slack workspace invite
• Role-specific tools (GitHub, Figma, HubSpot, etc.)
• Time tracking system
• Payroll system enrollment
• Benefits portal access

IT handles technical accounts, Finance handles payroll/benefits.
All accounts must be ready before start date.`,
      owner: 'IT Administrator',
      duration: '1 day',
      videoUrl: 'https://www.loom.com/embed/example-setup-accounts',
      automatable: 'full',
      linkedProcesses: ['IT-ACC-002', 'FIN-PAY-001'],
    },
    {
      id: '3',
      stepId: 'HR-ONB-001-C',
      name: 'Equipment Assignment',
      shortDescription: 'Laptop, monitors, peripherals based on role',
      longDescription: `Equipment checklist by role:
• Developer: MacBook Pro 16", 2x monitors, mechanical keyboard
• Designer: MacBook Pro 16", 4K monitor, drawing tablet
• Sales: MacBook Air, headset, webcam
• Executive: MacBook Pro 14", portable monitor, premium accessories

Process:
1. Check available inventory
2. Configure device with standard image
3. Install role-specific software
4. Asset tag and register
5. Schedule delivery or desk setup`,
      owner: 'IT Support',
      duration: '1-2 days',
      automatable: 'partial',
      linkedProcesses: ['IT-EQP-001', 'IT-INV-001'],
    },
    {
      id: '4',
      stepId: 'HR-ONB-001-D',
      name: 'First Day Orientation',
      shortDescription: 'Welcome meeting, office tour, team intros',
      longDescription: `First day schedule:
09:00 - Welcome & paperwork completion
09:30 - Company overview presentation
10:30 - Office tour / Virtual workspace tour
11:00 - Meet the team
12:00 - Lunch with buddy
13:00 - IT setup assistance
14:00 - Department-specific onboarding begins
16:00 - Check-in with HR
17:00 - End of day debrief

Assign onboarding buddy from same team.
Schedule 30/60/90 day check-ins.`,
      owner: 'HR Coordinator',
      duration: '1 day',
      videoUrl: 'https://www.loom.com/embed/example-orientation',
      automatable: 'none',
      linkedProcesses: ['HR-TRN-001'],
    },
    {
      id: '5',
      stepId: 'HR-ONB-001-E',
      name: 'Training & Compliance',
      shortDescription: 'Required training modules and policy acknowledgments',
      longDescription: `Mandatory training (first week):
• Company policies & code of conduct
• Security awareness training
• Data privacy (GDPR/Privacy Act)
• Workplace health & safety
• Anti-harassment & discrimination
• Role-specific compliance

All training tracked in LMS.
Completion certificates stored in employee file.
Must complete within 7 days of start.`,
      owner: 'HR Coordinator',
      duration: '2-3 days',
      automatable: 'full',
      linkedProcesses: ['HR-TRN-001', 'COMP-POL-001'],
    },
    {
      id: '6',
      stepId: 'HR-ONB-001-F',
      name: 'Probation Check-in',
      shortDescription: '30/60/90 day reviews to confirm fit',
      longDescription: `Structured check-in schedule:
30 days: Initial adjustment review
• Is training on track?
• Any blockers or concerns?
• Team integration feedback

60 days: Mid-probation review
• Performance against initial goals
• Skills development progress
• Cultural fit assessment

90 days: End of probation
• Formal performance review
• Confirmation or extension decision
• Goal setting for next quarter`,
      owner: 'Department Head',
      duration: '90 days total',
      automatable: 'partial',
      linkedProcesses: ['HR-PRF-001'],
    },
  ],
};

// HR-ONB-001: AI-Executable Format
export const hrOnboardingAI: SOPAIFormat = {
  process_id: 'HR-ONB-001',
  name: 'New Employee Onboarding',
  version: '2.3',
  owner: 'hr_manager',
  triggers: ['new_hire_created'],
  inputs: {
    employee_id: 'string',
    start_date: 'date',
    department: 'string',
    role: 'string',
  },
  steps: [
    {
      step_id: 'HR-ONB-001-A',
      name: 'collect_documents',
      type: 'task',
      executor: 'hr_coordinator',
      automatable: 'partial',
      inputs: ['employee_id'],
      outputs: ['documents_complete'],
      actions: [
        {
          action: 'send_email',
          template: 'document_request',
          to: '{{employee.email}}',
        },
        {
          action: 'create_checklist',
          items: ['id_verification', 'tax_forms', 'bank_details', 'contract_signed', 'nda_signed'],
        },
      ],
      conditions: {
        required_before: [],
        timeout: '48h',
        on_timeout: 'escalate_to_manager',
      },
      next: [
        { condition: 'documents_complete == true', goto: 'HR-ONB-001-B' },
        { condition: 'documents_complete == false', goto: 'HR-ONB-001-A', retry_count: 3 },
      ],
    },
    {
      step_id: 'HR-ONB-001-B',
      name: 'setup_accounts',
      type: 'parallel',
      executor: 'it_administrator',
      automatable: 'full',
      inputs: ['employee_id', 'role', 'department'],
      outputs: ['accounts_ready'],
      actions: [
        { action: 'trigger_process', template: 'IT-ACC-002' },
        { action: 'trigger_process', template: 'FIN-PAY-001' },
      ],
      conditions: {
        required_before: ['HR-ONB-001-A'],
      },
      next: [{ condition: 'accounts_ready == true', goto: 'HR-ONB-001-C' }],
    },
    {
      step_id: 'HR-ONB-001-C',
      name: 'equipment_assignment',
      type: 'decision',
      executor: 'it_support',
      automatable: 'partial',
      inputs: ['role', 'department'],
      outputs: ['equipment_assigned'],
      actions: [
        { action: 'check_inventory' },
        { action: 'configure_device' },
        { action: 'register_asset' },
      ],
      conditions: {
        required_before: ['HR-ONB-001-B'],
      },
      next: [
        { condition: "role == 'developer'", goto: 'IT-EQP-DEV-001' },
        { condition: "role == 'designer'", goto: 'IT-EQP-DESIGN-001' },
        { condition: 'default', goto: 'IT-EQP-STD-001' },
      ],
    },
    {
      step_id: 'HR-ONB-001-D',
      name: 'first_day_orientation',
      type: 'human_task',
      executor: 'hr_coordinator',
      automatable: 'none',
      inputs: ['employee_id', 'start_date'],
      outputs: ['orientation_complete'],
      actions: [
        { action: 'schedule_welcome_meeting' },
        { action: 'assign_buddy' },
        { action: 'book_lunch' },
      ],
      conditions: {
        required_before: ['HR-ONB-001-B', 'HR-ONB-001-C'],
      },
      next: [{ condition: 'orientation_complete == true', goto: 'HR-ONB-001-E' }],
    },
    {
      step_id: 'HR-ONB-001-E',
      name: 'training_compliance',
      type: 'automated',
      executor: 'system',
      automatable: 'full',
      inputs: ['employee_id'],
      outputs: ['training_complete'],
      actions: [
        { action: 'enroll_lms', items: ['policies', 'security', 'privacy', 'whs', 'conduct'] },
        { action: 'set_deadline', template: '7_days' },
      ],
      conditions: {
        required_before: ['HR-ONB-001-D'],
        timeout: '7d',
        on_timeout: 'notify_manager',
      },
      next: [{ condition: 'training_complete == true', goto: 'HR-ONB-001-F' }],
    },
    {
      step_id: 'HR-ONB-001-F',
      name: 'probation_checkins',
      type: 'task',
      executor: 'department_head',
      automatable: 'partial',
      inputs: ['employee_id'],
      outputs: ['probation_passed'],
      actions: [
        { action: 'schedule_review', items: ['30_day', '60_day', '90_day'] },
        { action: 'create_goals' },
      ],
      conditions: {
        required_before: ['HR-ONB-001-E'],
      },
      next: [
        { condition: 'probation_passed == true', goto: 'COMPLETE' },
        { condition: 'probation_passed == false', goto: 'HR-OFF-001' },
      ],
    },
  ],
  error_handling: {
    on_failure: 'notify_owner',
    retry_policy: 'exponential_backoff',
    max_retries: 3,
  },
  metadata: {
    created: '2025-01-15',
    updated: '2026-02-15',
    author: 'stephen@stepten.io',
    tags: ['onboarding', 'hr', 'critical'],
  },
};

// React Flow nodes for visualization
export const flowNodes: Node<SOPNodeData>[] = [
  {
    id: 'HR-ONB-001-A',
    type: 'sopNode',
    position: { x: 250, y: 0 },
    data: {
      label: 'Collect Documents',
      stepId: 'HR-ONB-001-A',
      shortDesc: 'Get ID, tax forms, bank details',
      longDesc: hrOnboardingProcess.steps[0].longDescription,
      owner: 'HR Coordinator',
      duration: '1-2 days',
      videoUrl: 'https://www.loom.com/embed/example-collect-docs',
      automatable: 'partial',
      linkedProcesses: ['FIN-PAY-001', 'ADMIN-SEC-001'],
    },
  },
  {
    id: 'HR-ONB-001-B',
    type: 'sopNode',
    position: { x: 250, y: 200 },
    data: {
      label: 'Setup Accounts',
      stepId: 'HR-ONB-001-B',
      shortDesc: 'Create email, Slack, tool access',
      longDesc: hrOnboardingProcess.steps[1].longDescription,
      owner: 'IT Administrator',
      duration: '1 day',
      videoUrl: 'https://www.loom.com/embed/example-setup-accounts',
      automatable: 'full',
      linkedProcesses: ['IT-ACC-002', 'FIN-PAY-001'],
    },
  },
  {
    id: 'HR-ONB-001-C',
    type: 'sopNode',
    position: { x: 250, y: 400 },
    data: {
      label: 'Equipment Assignment',
      stepId: 'HR-ONB-001-C',
      shortDesc: 'Laptop, monitors, peripherals',
      longDesc: hrOnboardingProcess.steps[2].longDescription,
      owner: 'IT Support',
      duration: '1-2 days',
      automatable: 'partial',
      linkedProcesses: ['IT-EQP-001', 'IT-INV-001'],
    },
  },
  {
    id: 'HR-ONB-001-D',
    type: 'sopNode',
    position: { x: 250, y: 600 },
    data: {
      label: 'First Day Orientation',
      stepId: 'HR-ONB-001-D',
      shortDesc: 'Welcome meeting, tour, team intros',
      longDesc: hrOnboardingProcess.steps[3].longDescription,
      owner: 'HR Coordinator',
      duration: '1 day',
      videoUrl: 'https://www.loom.com/embed/example-orientation',
      automatable: 'none',
      linkedProcesses: ['HR-TRN-001'],
    },
  },
  {
    id: 'HR-ONB-001-E',
    type: 'sopNode',
    position: { x: 250, y: 800 },
    data: {
      label: 'Training & Compliance',
      stepId: 'HR-ONB-001-E',
      shortDesc: 'Required training and policy acknowledgments',
      longDesc: hrOnboardingProcess.steps[4].longDescription,
      owner: 'HR Coordinator',
      duration: '2-3 days',
      automatable: 'full',
      linkedProcesses: ['HR-TRN-001', 'COMP-POL-001'],
    },
  },
  {
    id: 'HR-ONB-001-F',
    type: 'sopNode',
    position: { x: 250, y: 1000 },
    data: {
      label: 'Probation Check-ins',
      stepId: 'HR-ONB-001-F',
      shortDesc: '30/60/90 day reviews',
      longDesc: hrOnboardingProcess.steps[5].longDescription,
      owner: 'Department Head',
      duration: '90 days total',
      automatable: 'partial',
      linkedProcesses: ['HR-PRF-001'],
    },
  },
];

// React Flow edges for connections
export const flowEdges: Edge[] = [
  {
    id: 'e-A-B',
    source: 'HR-ONB-001-A',
    target: 'HR-ONB-001-B',
    label: 'Docs complete',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' },
  },
  {
    id: 'e-A-A',
    source: 'HR-ONB-001-A',
    target: 'HR-ONB-001-A',
    label: 'Incomplete (retry)',
    type: 'smoothstep',
    style: { stroke: '#f59e0b' },
  },
  {
    id: 'e-B-C',
    source: 'HR-ONB-001-B',
    target: 'HR-ONB-001-C',
    label: 'Accounts ready',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' },
  },
  {
    id: 'e-C-D',
    source: 'HR-ONB-001-C',
    target: 'HR-ONB-001-D',
    label: 'Equipment assigned',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' },
  },
  {
    id: 'e-D-E',
    source: 'HR-ONB-001-D',
    target: 'HR-ONB-001-E',
    label: 'Orientation done',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' },
  },
  {
    id: 'e-E-F',
    source: 'HR-ONB-001-E',
    target: 'HR-ONB-001-F',
    label: 'Training complete',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981' },
  },
];
