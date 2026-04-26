/**
 * Mock homework helper agent. Socratic guidance — never just gives the answer.
 * Real implementation: swap this file — the UI only depends on the contract in types.js.
 *
 * @param {import('./types.js').AgentInput} input
 * @returns {Promise<import('./types.js').AgentResponse>}
 */

const RESPONSES = [
  {
    keywords: ['answer', 'solution', 'solve for me', 'tell me', 'just give', 'what is the answer'],
    message: "I won't hand you the answer — that's how you actually learn this material! Let's work through it together. What do you already know about this type of problem? What have you tried so far?",
    citations: [],
  },
  {
    keywords: ['integral', 'integrate', 'antiderivative'],
    message: "Let's tackle this step by step. When you look at the integrand, what's the first thing you notice about its form? Does it resemble a pattern you've seen before — like something that might call for u-substitution or integration by parts?",
    citations: [{ source: 'Lecture 1 – Introduction', snippet: 'Common strategies: u-substitution, integration by parts, partial fractions, trig substitution. Identify the form first.' }],
  },
  {
    keywords: ['chain rule', 'chain', 'composite', 'derivative', 'differentiate'],
    message: "Good — you're working on differentiation. Before applying any rule, can you identify the *structure* of the function? Is one function nested inside another, or are they multiplied? That distinction tells you which rule to reach for.",
    citations: [{ source: 'Lecture 2', snippet: "Ask: is it f(g(x)) [chain rule] or f(x)·g(x) [product rule]? Identifying structure is step one." }],
  },
  {
    keywords: ['series', 'converge', 'diverge', 'test'],
    message: "Great problem to work through! What's your first instinct — what test are you considering? Remember to always check the Divergence Test first. What happens to your general term aₙ as n gets very large?",
    citations: [{ source: 'Lecture 3 – Series and Sequences', snippet: 'Always start with the Divergence Test: if lim(n→∞) aₙ ≠ 0, you can stop immediately — the series diverges.' }],
  },
  {
    keywords: ['stuck', 'confused', 'help', 'lost', 'not sure', 'don\'t understand'],
    message: "That's completely okay — being stuck is part of learning. Let's slow down. Can you describe what you *do* understand so far, even if it's just a little? Sometimes articulating where you are helps identify exactly where the gap is.",
    citations: [],
  },
];

const DEFAULT = {
  message: "I'm here to help you think through this — not to give you the answer directly. Walk me through what you've tried so far and where you got stuck. What's your current approach to the problem?",
  citations: [],
};

export async function callHomeworkAgent(input) {
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
  const msgLower = input.user_message.toLowerCase();
  const match = RESPONSES.find(r => r.keywords.some(k => msgLower.includes(k)));
  return match || DEFAULT;
}
