# AI Workflow System

A visual AI workflow builder where each node represents a YES/NO decision step powered by an LLM. Build decision trees visually, run them with one click, and watch the execution path animate in real time.

Built as part of the FlyRankAI internship.

## What it does

- Draw a workflow visually using a drag-and-drop canvas
- Each node holds a natural language question (e.g. "Is this a support request?")
- Click Run → each node's prompt is sent to an LLM which answers YES or NO
- The workflow follows the matching edge to the next node
- Nodes turn green (YES) or red (NO) as execution steps through the graph
- Save/load workflows in localStorage, export as JSON

## Tech stack

- **Next.js** — frontend + API routes
- **React Flow** — visual canvas (nodes, edges, drag-and-drop)
- **Inngest** — workflow step orchestration
- **OpenAI / OpenRouter** — LLM for YES/NO decisions
- **Tailwind CSS + shadcn** — styling

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/SanjaraT/ai-workflow
   cd ai-workflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example env file and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. Add your API key to `.env.local`:
   ```
   OPENROUTER_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   INNGEST_EVENT_KEY=local
   INNGEST_SIGNING_KEY=local
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

6. In a second terminal, start the Inngest dev server:
   ```bash
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

7. Open `http://localhost:3000`

## How to use

1. Click any node's prompt text to edit it — type your YES/NO question and hit Save
2. Connect nodes by dragging from the green (YES) or red (NO) handle at the bottom of a node to the top of another
3. Click **+ Add Node** to add more decision steps
4. Click **▶ Run** to execute the workflow — nodes animate as each decision is made
5. Use **💾 Save** / **📂 Load** to persist your workflow across page refreshes
6. Use **📤 Export JSON** to download the workflow as a file
7. Click **↺ Reset** to clear execution state and run again

## How it works

Each node's prompt is sent to an LLM (OpenAI / OpenRouter) with a strict instruction to answer only YES or NO. The workflow starts at the node with no incoming edges and follows the matching YES or NO edge to the next node, repeating until there are no more edges to follow. The execution path is returned to the frontend, which animates each node's result one step at a time.

Inngest is wired in as the workflow orchestration layer — each node maps to an Inngest step, giving the pipeline retry capability and observability through the Inngest dev server dashboard.

## Example workflow

```
"Is this a support request?"
        │
    YES ─────→ "Is the issue urgent?"
        │
    NO  ─────→ "Is this a new sales lead?"
```

Each question gets answered by the LLM. The path taken depends on each answer.

## Project structure

```
app/
  page.tsx                  — main canvas page
  api/
    inngest/route.ts        — Inngest function registration
    workflow/run/route.ts   — workflow execution endpoint
components/
  WorkflowNode.tsx          — visual node (box with prompt + YES/NO handles)
  WorkflowEdge.tsx          — colored YES/NO edge labels
lib/
  inngest.ts                — Inngest client
  workflowFunction.ts       — Inngest workflow step function
  initialData.ts            — starter nodes and edges
```

## API reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/workflow/run` | Execute the workflow — takes nodes and edges, returns execution path |
| GET/POST/PUT | `/api/inngest` | Inngest function registration and event handling |

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI or OpenRouter API key |
| `OPENROUTER_API_KEY` | OpenRouter API key (used as fallback) |
| `INNGEST_EVENT_KEY` | Set to `local` for development |
| `INNGEST_SIGNING_KEY` | Set to `local` for development |