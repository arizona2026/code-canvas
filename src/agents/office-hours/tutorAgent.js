/**
 * Mock tutor agent. Explains concepts clearly.
 * Real implementation: swap this file — the UI only depends on the contract in types.js.
 *
 * @param {import('./types.js').AgentInput} input
 * @returns {Promise<import('./types.js').AgentResponse>}
 */

const RESPONSES = [
  {
    keywords: ['chain rule', 'chain', 'composite'],
    message: "Great question! The **chain rule** applies when you have a composite function — a function nested inside another. From Lecture 2: if y = f(g(x)), then dy/dx = f′(g(x)) · g′(x). Differentiate the outer function first, then multiply by the derivative of the inner.",
    citations: [{ source: 'Lecture 2', snippet: "Chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x) — apply when one function is nested inside another." }],
  },
  {
    keywords: ['product rule', 'product'],
    message: "The **product rule** applies when two separate functions are multiplied together. From Lecture 2: if y = f(x) · g(x), then dy/dx = f′(x)g(x) + f(x)g′(x). A helpful memory trick: \"first times derivative of second, plus second times derivative of first.\"",
    citations: [{ source: 'Lecture 2', snippet: "Product rule: d/dx[f(x)·g(x)] = f'(x)g(x) + f(x)g'(x)." }],
  },
  {
    keywords: ['integral', 'integrate', 'antiderivative', 'integration'],
    message: "Integration is the reverse of differentiation. From **Lecture 1**, the indefinite integral ∫f(x) dx gives you a family of functions whose derivative is f(x). Don't forget the constant C — it represents the fact that many functions share the same derivative.",
    citations: [{ source: 'Lecture 1 – Introduction', snippet: "Fundamental theorem: ∫f(x)dx = F(x) + C where F'(x) = f(x). The constant C accounts for all antiderivatives." }],
  },
  {
    keywords: ['series', 'sequence', 'converge', 'diverge', 'convergence'],
    message: "Series convergence is a key topic from **Lecture 3**. A series ∑aₙ converges if its partial sums approach a finite limit. Your first check should always be the Divergence Test: if lim(n→∞) aₙ ≠ 0, the series diverges immediately. From there, common tools include the Ratio Test, Root Test, and Comparison Test.",
    citations: [{ source: 'Lecture 3 – Series and Sequences', snippet: "A series converges if lim(n→∞) Sₙ = L for some finite L. Always apply the Divergence Test first." }],
  },
  {
    keywords: ['syllabus', 'office hours', 'grading', 'policy'],
    message: "For course policies, grading breakdown, and office hours schedules, the **Course Syllabus** is your primary reference. It's available in the Materials tab. Is there something specific from the syllabus I can help clarify?",
    citations: [{ source: 'Course Syllabus', snippet: 'All grading policies, attendance requirements, and office hours are defined in the course syllabus.' }],
  },
];

const DEFAULT = {
  message: "That's a great thing to explore! Based on what we've covered in this course, I'd approach this by first identifying the key concept, then working through a concrete example. Could you tell me more about which part is confusing you? The more specific your question, the more targeted my explanation can be.",
  citations: [{ source: 'Course Syllabus', snippet: 'Students are encouraged to engage deeply with the material and ask questions early.' }],
};

export async function callTutorAgent(input) {
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
  const msgLower = input.user_message.toLowerCase();
  const match = RESPONSES.find(r => r.keywords.some(k => msgLower.includes(k)));
  return match || DEFAULT;
}
