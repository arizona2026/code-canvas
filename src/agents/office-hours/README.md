# Office Hours Agent Contract

This folder defines the pluggable agent interface for the BearDown Office Hours tab.

## Contract

All agents must conform to the types defined in `types.js`. The UI calls a single
`callAgent(input)` wrapper (defined in `App.jsx`) and never imports agent files directly.
Swapping the real implementation means editing only the files in this folder.

### Input

```js
AgentInput {
  course_id: string
  channel_id: string
  channel_type: 'general' | 'assignment' | 'custom'
  assignment_id?: string
  mode: 'tutor' | 'homework_helper'
  conversation_history: Message[]
  user_message: string
  course_context: {
    syllabus?: string
    lectures: string[]
    assignment_spec?: string
    rubric?: string
    professor_rules?: string
  }
}
```

### Output

```js
AgentResponse {
  message: string          // markdown-lite: **bold** is supported
  citations: Citation[]    // shown as clickable badges beneath the message
  refusal_reason?: string  // populated if the AI declined to answer
}

Citation {
  source: string   // e.g. "Lecture 7" or "Syllabus, p.3"
  snippet: string  // shown in tooltip on hover
}
```

## Modes

| Mode | Behavior |
|---|---|
| `tutor` | Explains concepts clearly with examples. Answers directly. Cites course materials. |
| `homework_helper` | Socratic guidance only. Never gives the final answer. Asks leading questions. May cite relevant background. |

## Current Status: MOCK IMPLEMENTATIONS

`tutorAgent.js` and `homeworkAgent.js` are mock implementations. They use keyword
matching to return plausible canned responses with fake citations. They simulate a
network delay of ~700–1200ms so the UI feels realistic.

**The UI is fully decoupled from these mocks.** It only calls `callAgent(input)` via
the wrapper in `App.jsx`. When real agents are ready, replace the bodies of
`callTutorAgent` and `callHomeworkAgent` — or swap in real implementations that match
the same export signature — and the UI will work without any changes.

## TO BE IMPLEMENTED

Real agents will need:

- **System prompts** — separate prompts for Tutor Mode vs Homework Helper Mode.
  Homework Helper must be prompted to never reveal full answers; Tutor is free to explain directly.
- **RAG over course materials** — retrieve relevant chunks from the course's assets
  (syllabus, lectures, assignment specs, rubrics) stored in Supabase / a vector DB.
  The `course_context` field in `AgentInput` is designed to carry this retrieved context.
- **Citation extraction** — identify which source chunks were used and surface them
  in `AgentResponse.citations` so the UI can render them as badges.
- **Professor-rule injection** — the `course_context.professor_rules` field lets a
  professor specify custom constraints (e.g. "do not help with Assignment 2 until after
  the lab section on Friday"). Agents must check this before responding.
- **Jailbreak resistance** — system prompt hardening to prevent students from using
  prompt injection to bypass homework helper restrictions.
- **Conversation history** — real agents should pass `conversation_history` to the
  LLM so responses are contextually aware of the thread. Mock agents currently ignore it.
