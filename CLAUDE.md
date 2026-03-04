# FlowSpace — Project Context for Claude

## Project Overview
FlowSpace is a personal project management app (PMS) for self use, built and maintained by Ashok. It follows a PARA-inspired hierarchy: Projects → Areas → Tasks, with Notes and Resources attached to projects or areas.

## Tech Stack
- **Next.js 14** with App Router
- **Convex** (descriptive-egret-989.convex.cloud) for real-time database
- **Clerk** for authentication (userId from Clerk passed into all Convex queries)
- **TypeScript**
- **Inline CSS with CSS variables** — NO Tailwind classes used inside components
- Deployed at **https://pms.clickbric.com** via Coolify on a Contabo VPS
- GitHub: **https://github.com/ashokvas/flowspace**
- Local path: **~/flowspace**

## Project Structure
```
src/
  app/
    page.tsx                        # Auth check, renders AppShell
    layout.tsx
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  components/
    AppShell.tsx        # Main layout: sidebar + topbar + view routing
    ProjectsView.tsx    # Grid of project cards
    ProjectView.tsx     # Single project: Areas / Notes / Resources tabs
    AreaView.tsx        # Single area: Tasks / Notes / Resources tabs
    AllTasksView.tsx    # All tasks across all projects with filters
    NotesList.tsx       # Notes list for a project or area
    ResourcesList.tsx   # Resources/links for a project or area
    ui.tsx              # All shared UI components
convex/
  schema.ts             # Database schema
  tasks.ts
  projects.ts
  areas.ts
  notes.ts
  resources.ts
```

## Database Schema (Convex)

**projects**: `userId, name, description?, createdAt`
- index: `by_user`

**areas**: `userId, projectId, name, description?, createdAt`
- indexes: `by_project`, `by_user`

**tasks**: `userId, projectId, areaId, title, notes?, status (todo|inprog|done), priority? (high|med|low), dueDate? (string YYYY-MM-DD), tags? (string[]), archived?, createdAt`
- indexes: `by_area`, `by_project`, `by_user`

**notes**: `userId, projectId, areaId?, title, content?, attachments? ({storageId, name, type, size, uploadedAt}[]), createdAt`
- indexes: `by_area`, `by_project`, `by_user`

**resources**: `userId, projectId, areaId?, title, url?, description?, createdAt`
- indexes: `by_area`, `by_project`, `by_user`

## Navigation / View System
AppShell manages a `View` type union:
```typescript
type View =
  | { type: "projects" }
  | { type: "project"; projectId: Id<"projects"> }
  | { type: "area"; projectId: Id<"projects">; areaId: Id<"areas"> }
  | { type: "alltasks" }
```
Sidebar shows: Projects view, All Tasks view, and individual project links.
Mobile sidebar slides in as overlay via hamburger button (hidden at >768px).

## CSS Variables (defined in globals.css or layout)
```
--bg, --surface, --surface2
--border, --border2
--text, --text2, --text3
--accent, --accent2, --accent-glow
--high (red), --med (yellow), --low (green)
--done, --inprog, --todo
```

## Shared UI Components (ui.tsx)
`Btn, IconBtn, Input, Textarea, Select, Modal, FormGroup, Badge, ProgressBar, Breadcrumb, Tabs, Empty, VoiceButton, Card`

- `VoiceButton` uses Web Speech API for voice-to-text
- `Btn` variants: `primary | secondary | ghost | danger`
- `Btn` sizes: `sm | md`
- All components use inline CSS with the CSS variables above

## Key Implementation Details
- `tasks.listByUser` joins `areaName` and `projectName` onto each task at query time
- Tasks must belong to an area — no loose tasks under a project directly
- `AllTasksView` has responsive layout: desktop = grid table, mobile (≤640px) = card layout using CSS classes `.task-table-header`, `.task-row-desktop`, `.task-row-mobile` injected via `<style>` tag
- `AreaView` task table still uses fixed grid columns and is NOT yet mobile responsive
- Deleting a project cascades: deletes all its areas, tasks, notes, resources

## Deployment Workflow
```bash
git add [file] && git commit -m "message" && git push
# Coolify auto-deploys on push to main
```

## Features Built So Far
- Create / delete projects
- Create / delete areas within projects
- Create / edit / delete tasks with: title, notes, status cycling (todo→inprog→done), priority, due date, tags, archive toggle
- Filter all tasks by: priority, status, due date, project, tag
- Progress bars on projects and areas
- Notes with file attachments (via Convex file storage)
- Resources / links per project or area
- Voice input for task title and notes (Web Speech API)
- Mobile-responsive sidebar and AllTasksView

## Known Issues / Pending Work
- `AreaView` task table is not mobile-responsive yet
- No way to create a task directly under a project without an area

## Working Rules — Must Follow Every Session

1. **Read the full file before making any changes.** Use your file reading tools — do not assume what the code looks like.

2. **Before making any change, tell me:**
   - Which file you plan to modify
   - Exactly what you are changing and why
   - What you are keeping the same
   Then wait for my explicit approval before proceeding.

3. **Make surgical changes only.** Change the minimum lines needed. Do not reformat, restructure, or rewrite code that is unrelated to the task.

4. **If unsure about any existing code**, ask to see that section before proceeding. Never assume or guess.

5. **One change at a time.** Do not bundle multiple fixes into one command unless explicitly asked.

6. **After every change**, tell me exactly what to verify so I can confirm it worked before moving on.

7. **Never delete or overwrite working features** while adding new ones.