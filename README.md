# SOP System

Interactive Standard Operating Procedure documentation with dual formats - visual flowcharts for humans, executable JSON for AI.

## Live Demo

**[sop-system-sigma.vercel.app](https://sop-system-sigma.vercel.app)**

## Features

- **Interactive Flowcharts** - React Flow powered process visualization
- **Expandable Nodes** - Click any step to see full details, video embeds, linked processes
- **Dual View Toggle** - Switch between Human View (visual) and AI JSON (executable)
- **Automation Indicators** - Color-coded badges show automation potential (Full/Partial/Manual)
- **Process Metadata** - Version tracking, owners, departments, duration estimates
- **Video Embeds** - Loom integration for training videos
- **Supabase Backend** - Full schema for storing SOPs in database

## Example Process: HR-ONB-001

New Employee Onboarding process demonstrating:
- 6 interconnected steps
- Decision trees and parallel tasks
- Cross-process references
- Mixed automation levels

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Flowcharts**: React Flow / XYFlow
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

```bash
# Clone
git clone https://github.com/ClarkSinghOS/sop-system.git
cd sop-system

# Install
pnpm install

# Run locally
pnpm dev

# Build
pnpm build
```

## Database Schema

See `supabase/migrations/20260215_sop_system.sql` for the full schema including:
- `processes` - Core process definitions
- `process_steps` - Individual step data
- `process_connections` - Cross-process relationships
- `process_tree` view - Navigation helper

## Skill Reference

Built following the SOP Creation skill from `stepten-agent-army`:
- Dual-format documentation (human visual + AI executable)
- Hierarchical process IDs (DEPT-PROCESS-STEP-SUBSTEP)
- Automation analysis per step
- Media integration (video, infographics)

## Repository

- **GitHub**: [ClarkSinghOS/sop-system](https://github.com/ClarkSinghOS/sop-system)
- **Vercel**: [sop-system-sigma.vercel.app](https://sop-system-sigma.vercel.app)

---

Built by Clark Singh for StepTen Agent Army
