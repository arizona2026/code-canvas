import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { callTutorAgent } from './agents/office-hours/tutorAgent.js';
import { callHomeworkAgent } from './agents/office-hours/homeworkAgent.js';

async function callAgent(input) {
  return input.mode === 'homework_helper'
    ? callHomeworkAgent(input)
    : callTutorAgent(input);
}
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Icons = {
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Book: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Forum: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>,
  Folder: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Class: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
  Check: () => <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  Alert: () => <svg className="w-5 h-5 text-[#AB0520]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Lock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Download: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
};

const TopBar = ({ courseTabs = [], activeTab, onTabClick }) => (
  <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur-md">
    <Link to="/dashboard" className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0C234B] text-white">
        <span className="text-lg font-bold">A</span>
      </div>
      <span className="text-lg font-bold text-[#0C234B]">U of A AI Studio</span>
    </Link>
    <div className="flex min-w-0 items-center gap-4">
      {courseTabs.length > 0 && (
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
          {courseTabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabClick(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#AB0520]/10 text-[#AB0520]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            );
          })}
        </nav>
      )}
      <div className="flex flex-col items-end">
        <span className="text-sm font-semibold text-gray-900">Wilbur Wildcat</span>
        <span className="text-xs text-gray-500">wilbur@arizona.edu</span>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AB0520] text-sm font-bold text-white shadow-sm">
        WW
      </div>
    </div>
  </header>
);

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-[#AB0520] selection:text-white">
      <header className="flex h-20 items-center justify-between px-8 sm:px-16 lg:px-24">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C234B] text-white shadow-md">
            <span className="text-xl font-bold">A</span>
          </div>
          <span className="text-xl font-bold text-[#0C234B]">AI Studio</span>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Sign In
        </button>
      </header>

      <main className="mx-auto mt-24 max-w-5xl px-6 text-center lg:px-8">
        <h1 className="text-5xl font-extrabold tracking-tight text-[#0C234B] sm:text-7xl">
          Learn Smarter. <br />
          <span className="text-[#AB0520]">Build the Future.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
          AI-powered learning platform exclusively for University of Arizona students. Elevate your coursework, writing, and collaboration.
        </p>
        <div className="mt-10">
          <button 
            onClick={() => navigate('/login')}
            className="rounded-xl bg-[#AB0520] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#AB0520]/20 transition-all hover:-translate-y-0.5 hover:bg-[#8A041A] hover:shadow-xl hover:shadow-[#AB0520]/30"
          >
            Get Started
          </button>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { title: 'Office Hours', desc: 'Get AI-powered help with your coursework', icon: Icons.Chat },
            { title: 'AI Literature Support', desc: 'Enhance your reading and writing', icon: Icons.Book },
            { title: 'Forums', desc: 'Collaborate and share with peers', icon: Icons.Forum },
          ].map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-gray-100 bg-white p-8 text-left shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-[#0C234B]">
                <feature.icon />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.endsWith('@arizona.edu')) {
      setError('Please use a valid @arizona.edu email address.');
      return;
    }
    setError('');
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6 selection:bg-[#AB0520] selection:text-white">
      <div className="w-full max-w-md rounded-[2rem] border border-gray-100 bg-white p-10 shadow-xl shadow-gray-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0C234B] text-white shadow-md">
            <span className="text-3xl font-bold">A</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500">Sign in to your U of A account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">University Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="netid@arizona.edu" 
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-[#0C234B] focus:bg-white focus:ring-1 focus:ring-[#0C234B]"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-[#0C234B] focus:bg-white focus:ring-1 focus:ring-[#0C234B]"
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-[#AB0520]">{error}</p>}
          <button 
            type="submit"
            className="w-full rounded-xl bg-[#AB0520] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-[#AB0520]/20 transition-all hover:bg-[#8A041A] active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([
    { id: 'csc120', name: 'CSC 120', desc: 'Introduction to Computer Programming' },
    { id: 'math129', name: 'MATH 129', desc: 'Calculus II' },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    setClasses([...classes, { id: accessCode.toLowerCase(), name: accessCode.toUpperCase(), desc: 'New Enrolled Class' }]);
    setAccessCode('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto max-w-6xl px-8 py-12">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0C234B]">Your Classes</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 rounded-lg bg-[#AB0520] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#8A041A]"
          >
            <Icons.Plus /> Add Class
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddClass} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Join a New Class</h3>
            <p className="mb-4 text-sm text-gray-500">Enter the access code provided by your professor.</p>
            <div className="flex max-w-md gap-3">
              <input 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g. BIO202-SP" 
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none transition focus:border-[#0C234B] focus:bg-white"
                required
              />
              <button type="submit" className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800">
                Join
              </button>
            </div>
          </form>
        )}

        {classes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center">
            <p className="text-gray-500">You are not enrolled in any classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map(cls => (
              <div 
                key={cls.id} 
                onClick={() => navigate(`/class/${cls.id}`)}
                className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0C234B]/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-[#0C234B] group-hover:bg-[#0C234B] group-hover:text-white transition-colors">
                  <Icons.Class />
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#AB0520] transition-colors">{cls.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{cls.desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// ─── OFFICE HOURS: DATA ──────────────────────────────────────────────────────

const INITIAL_CHANNELS = [
  { id: 'general', type: 'general', name: 'General', last_message_at: 'Today' },
  { id: 'ch-a1', type: 'assignment', name: 'Assignment 1: Integration Practice', assignment_id: 'a1', last_message_at: 'Yesterday' },
  { id: 'ch-a2', type: 'assignment', name: 'Assignment 2: Series and Sequences', assignment_id: 'a2', last_message_at: 'Jan 25' },
  { id: 'ch-p1', type: 'assignment', name: 'Project 1: Modeling Project', assignment_id: 'p1', last_message_at: 'Jan 22' },
  { id: 'ch-mid', type: 'assignment', name: 'Midterm', assignment_id: 'mid', last_message_at: 'Jan 20' },
  { id: 'ch-chain', type: 'custom', name: 'Chain rule confusion', last_message_at: 'Today' },
  { id: 'ch-practice', type: 'custom', name: 'Practice problems', last_message_at: 'Yesterday' },
];

const INITIAL_MESSAGES = {
  'ch-chain': [
    { id: 1, role: 'user', content: "When do I use the chain rule vs the product rule?", created_at: '10:04 AM' },
    { id: 2, role: 'assistant', content: "Good question — they're often confused! Use the **chain rule** when you have a composite function (one function nested inside another), like sin(x²). Use the **product rule** when two separate functions are multiplied, like x² · sin(x). Ask yourself: is one function *inside* another, or are they *multiplied*?", citations: [{ source: 'Lecture 2', snippet: "Chain rule: d/dx[f(g(x))] = f'(g(x)) · g'(x) — use when one function is nested inside another." }], created_at: '10:04 AM' },
    { id: 3, role: 'user', content: "That makes sense! So for sin(x²) I'd use the chain rule?", created_at: '10:05 AM' },
    { id: 4, role: 'assistant', content: "Exactly right! For sin(x²): the outer function is sin(·) and the inner function is x². So: d/dx[sin(x²)] = cos(x²) · 2x. You differentiate the outer (sin → cos, evaluated at the inner), then multiply by the derivative of the inner (x² → 2x).", citations: [{ source: 'Lecture 2', snippet: "Example: d/dx[sin(x²)] = cos(x²) · 2x — outer derivative times inner derivative." }], created_at: '10:05 AM' },
  ],
};

const EMPTY_MESSAGES = [];

const INITIAL_MODES = INITIAL_CHANNELS.reduce((acc, ch) => ({ ...acc, [ch.id]: 'tutor' }), {});

// ─── CLASS LLM: COMPONENT ────────────────────────────────────────────────────

const ClassLLM = () => {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [channelModes, setChannelModes] = useState(INITIAL_MODES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showIntegrityModal, setShowIntegrityModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [showNewChatInput, setShowNewChatInput] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeMode = channelModes[activeChannelId] || 'tutor';
  const activeMessages = messages[activeChannelId] || EMPTY_MESSAGES;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, activeChannelId]);

  const setMode = (mode) => setChannelModes(m => ({ ...m, [activeChannelId]: mode }));

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const channelId = activeChannelId;
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(m => ({ ...m, [channelId]: [...(m[channelId] || []), userMsg] }));
    setInput('');
    setIsLoading(true);
    try {
      const response = await callAgent({
        course_id: 'demo',
        channel_id: channelId,
        channel_type: activeChannel?.type || 'general',
        mode: activeMode,
        user_message: userMsg.content,
        conversation_history: messages[channelId] || [],
        course_context: { lectures: [] },
      });
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message,
        citations: response.citations || [],
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(m => ({ ...m, [channelId]: [...(m[channelId] || []), aiMsg] }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewChat = (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;
    const ch = { id: `custom-${Date.now()}`, type: 'custom', name: newChatName.trim(), last_message_at: 'Just now' };
    setChannels(c => [...c, ch]);
    setChannelModes(m => ({ ...m, [ch.id]: 'tutor' }));
    setActiveChannelId(ch.id);
    setNewChatName('');
    setShowNewChatInput(false);
  };

  const isTutor = activeMode === 'tutor';
  const accent = isTutor
    ? { bar: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', badge: 'bg-[#0C234B]', msgBg: 'bg-blue-50', msgBorder: 'border-blue-100' }
    : { bar: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', badge: 'bg-green-700', msgBg: 'bg-green-50', msgBorder: 'border-green-100' };

  const channelHint = activeChannel?.type === 'assignment'
    ? `Working on ${activeChannel.name}? I'll help you think through it.`
    : activeChannel?.type === 'custom'
    ? `Custom chat — ${activeChannel?.name}.`
    : 'Ask anything about this course.';

  const renderChannel = (ch) => {
    const isActive = ch.id === activeChannelId;
    return (
      <button
        key={ch.id}
        onClick={() => setActiveChannelId(ch.id)}
        className={`w-full text-left rounded-lg px-3 py-2.5 transition-all ${isActive ? 'bg-[#AB0520]/10 text-[#AB0520]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
      >
        <p className="truncate text-sm font-medium">{ch.name}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{ch.last_message_at}</p>
      </button>
    );
  };

  const generalChannels = channels.filter(c => c.type === 'general');
  const assignmentChannels = channels.filter(c => c.type === 'assignment');
  const customChannels = channels.filter(c => c.type === 'custom');

  return (
    <div className="flex h-full bg-white overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-52 shrink-0 border-r border-gray-100 bg-gray-50 flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          <div className="space-y-0.5">{generalChannels.map(renderChannel)}</div>

          <div>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Assignments</p>
            <div className="space-y-0.5">{assignmentChannels.map(renderChannel)}</div>
          </div>

          <div>
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">My Chats</p>
            <div className="space-y-0.5">{customChannels.map(renderChannel)}</div>
            {showNewChatInput ? (
              <form onSubmit={handleNewChat} className="mt-1.5 px-1">
                <input
                  autoFocus
                  type="text"
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  onBlur={() => { if (!newChatName.trim()) setShowNewChatInput(false); }}
                  placeholder="Chat name..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#0C234B]"
                />
              </form>
            ) : (
              <button
                onClick={() => setShowNewChatInput(true)}
                className="mt-1 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <Icons.Plus /> New Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Channel label */}
        <div className="shrink-0 flex items-center gap-2 border-b border-gray-100 px-5 py-2.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            activeChannel?.type === 'general' ? 'bg-[#0C234B]/10 text-[#0C234B]'
            : activeChannel?.type === 'assignment' ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-gray-100 text-gray-600'
          }`}>
            {activeChannel?.type === 'general' ? 'General' : activeChannel?.type === 'assignment' ? 'Assignment' : 'My Chat'}
          </span>
          <span className="truncate text-sm font-semibold text-gray-900">{activeChannel?.name}</span>
          <button
            onClick={() => setShowIntegrityModal(true)}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-500 hover:border-gray-300 transition"
          >
            <Icons.Check /> UArizona Academic Integrity
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {activeMessages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${accent.badge} text-lg font-bold text-white`}>A</div>
              <p className="font-semibold text-gray-900">BearDown AI</p>
              <p className="mt-1 max-w-xs text-sm text-gray-500">{channelHint}</p>
            </div>
          )}

          {activeMessages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.role === 'user' ? 'bg-[#AB0520] text-white' : `${accent.badge} text-white`
              }`}>
                {msg.role === 'user' ? 'WW' : 'A'}
              </div>
              <div className="max-w-[75%] space-y-1.5">
                {msg.role === 'assistant' && (
                  <p className="ml-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">BearDown AI</p>
                )}
                <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-tr-none bg-gray-100 border-gray-200 text-gray-900'
                    : `rounded-tl-none ${accent.msgBg} ${accent.msgBorder} text-gray-800`
                }`}>
                  {msg.content.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                  )}
                </div>
                {msg.role === 'assistant' && msg.citations?.length > 0 && (
                  <div className="ml-1 flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <div key={i} className="group relative">
                        <button className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:border-[#0C234B] hover:text-[#0C234B] transition">
                          {c.source}
                        </button>
                        <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-64 rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg opacity-0 transition group-hover:opacity-100">
                          <p className="mb-1 font-semibold text-gray-900">{c.source}</p>
                          <p className="italic text-gray-500">"{c.snippet}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${accent.badge} text-xs font-bold text-white`}>A</div>
              <div className={`flex items-center gap-1.5 rounded-2xl rounded-tl-none border px-5 py-3 ${accent.msgBg} ${accent.msgBorder}`}>
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-gray-100 p-4">
          <p className="mb-2 truncate text-xs text-gray-400">
            {isTutor ? 'Tutor mode explains concepts so you understand and remember.' : "Homework Helper guides you through problems without handing you the answer."}
          </p>
          <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 pr-3 transition-all focus-within:border-[#0C234B] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0C234B]">
            <select
              value={activeMode}
              onChange={e => setMode(e.target.value)}
              className={`mb-1 shrink-0 cursor-pointer rounded-lg border bg-white px-2.5 py-1.5 text-xs font-semibold outline-none ${accent.border} ${accent.text}`}
            >
              <option value="tutor">Tutor</option>
              <option value="homework_helper">Homework Helper</option>
            </select>
            <textarea
              rows={1}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'; }}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#AB0520] text-white transition hover:bg-[#8A041A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icons.Send />
            </button>
          </div>
          <p className="mt-1 text-right text-[10px] text-gray-300">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      {/* Academic Integrity Modal */}
      {showIntegrityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowIntegrityModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Academic Integrity</h3>
              <button onClick={() => setShowIntegrityModal(false)} className="text-gray-400 hover:text-gray-700"><Icons.X /></button>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              This conversation is governed by the University of Arizona's Code of Academic Integrity. BearDown AI is designed to help you learn — not to complete your work for you.
            </p>
            <p className="mb-3 text-sm leading-relaxed text-gray-700">
              Using AI-generated content without disclosure, or submitting AI responses as your own work, may constitute a violation of the Student Code of Conduct.
            </p>
            <p className="text-sm italic text-gray-400">studentaffairs.arizona.edu/policies/academic-integrity-code</p>
            <button onClick={() => setShowIntegrityModal(false)} className="mt-6 w-full rounded-xl bg-[#0C234B] py-2.5 text-sm font-medium text-white hover:bg-[#0C234B]/90">
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AILiterature = ({ resources, setResources }) => {
  const [activeSubTab, setActiveSubTab] = useState('reading');
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedText, setSelectedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [btnPosition, setBtnPosition] = useState({ top: 0, left: 0 });

  const handleSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setBtnPosition({
        top: rect.top - 50 + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
      setShowFloatingBtn(true);
    } else {
      setShowFloatingBtn(false);
    }
  };

  const askGemini = async (promptText) => {
    setIsAiLoading(true);
    setAiResponse('');
    setShowFloatingBtn(false);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_api_key_here') {
        setAiResponse("API Key is missing or invalid. Please add a valid VITE_GEMINI_API_KEY to your .env file.");
        setIsAiLoading(false);
        return;
      }
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
      setAiResponse(answer);
    } catch (err) {
      setAiResponse(`Something went wrong. Error: ${err.message}`);
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const pageElement = document.querySelector('.react-pdf__Page__textContent');
    const pageText = pageElement ? pageElement.innerText : '';
    const context = pageText || "The current document page.";
    
    if (action === 'summarize') askGemini(`Summarize this text concisely:\n\n${context}`);
    if (action === 'explain') askGemini(`Explain this text simply:\n\n${context}`);
    if (action === 'keypoints') askGemini(`Extract the key points from this text:\n\n${context}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-center border-b border-gray-200 mb-6 shrink-0">
        <button onClick={() => setActiveSubTab('reading')} className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${activeSubTab === 'reading' ? 'border-[#0C234B] text-[#0C234B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>Reading Support</button>
        <button onClick={() => setActiveSubTab('writing')} className={`pb-3 px-6 text-sm font-medium border-b-2 transition-all ${activeSubTab === 'writing' ? 'border-[#0C234B] text-[#0C234B]' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>Writing Support</button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeSubTab === 'reading' && (
          <div className="h-full flex flex-col">
            {!pdfFile ? (
              <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-2xl bg-white shadow-sm p-6">
                <div className="flex flex-col items-center max-w-sm w-full">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                    <Icons.Folder />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center">Upload or Select PDF</h3>
                  <p className="text-sm text-gray-500 mb-6 text-center">Select a document to start reading with AI.</p>

                  <div className="w-full text-left space-y-2 mb-6">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Available Resources</h4>
                    <div className="max-h-48 overflow-y-auto space-y-2 w-full pr-2">
                      {resources.filter(r => r.name.toLowerCase().endsWith('.pdf')).map(res => (
                        <div
                          key={res.id}
                          onClick={() => {
                            if (res.fileObj) {
                              setPdfFile(res.fileObj);
                            } else {
                              alert('This is a mock professor file. Please upload a real PDF from your computer to test the AI Viewer.');
                            }
                          }}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:border-[#0C234B]/30 hover:bg-white transition-all group"
                        >
                           <div className="flex items-center gap-3 overflow-hidden">
                             <span className="text-gray-400 group-hover:text-[#0C234B]"><Icons.Book /></span>
                             <span className="text-sm font-medium text-gray-700 group-hover:text-[#0C234B] truncate">{res.name}</span>
                           </div>
                           <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${res.uploadedBy === 'professor' ? 'bg-gray-200 text-gray-700' : 'bg-[#AB0520]/10 text-[#AB0520]'}`}>{res.uploadedBy === 'professor' ? 'Professor' : 'Student'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="cursor-pointer rounded-lg bg-[#0C234B] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0C234B]/90 shadow-sm w-full text-center">
                    Upload New File
                    <input type="file" accept="application/pdf" className="hidden" onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        file.uploadedBy = 'student';
                        setPdfFile(file);
                        setResources(prev => [...prev, { id: Date.now().toString(), name: file.name, uploadedBy: 'student', fileObj: file }]);
                      }
                    }} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6 h-full relative">
                {showFloatingBtn && (
                  <button
                    style={{ position: 'fixed', top: btnPosition.top, left: btnPosition.left, transform: 'translateX(-50%)' }}
                    className="z-50 flex items-center gap-2 rounded-full bg-[#AB0520] px-4 py-2 text-sm font-bold text-white shadow-xl hover:bg-[#8A041A] animate-in fade-in zoom-in-95"
                    onClick={() => askGemini(`Explain this text clearly:\n\n${selectedText}`)}
                  >
                    <Icons.Chat /> Ask AI
                  </button>
                )}
                <div className="flex-1 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50 shrink-0">
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <span className="text-sm font-bold text-gray-900 truncate">{pdfFile.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                        pdfFile.uploadedBy === 'professor'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-[#AB0520]/10 text-[#AB0520]'
                      }`}>
                        {pdfFile.uploadedBy === 'professor' ? 'Professor' : 'Student'}
                      </span>
                      <button onClick={() => setPdfFile(null)} className="ml-1 text-gray-400 hover:text-[#AB0520] transition-colors" title="Change Document">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <button onClick={() => handleQuickAction('summarize')} className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">Summarize Page</button>
                    <button onClick={() => handleQuickAction('explain')} className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">Explain Simply</button>
                    <button onClick={() => handleQuickAction('keypoints')} className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50">Key Points</button>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center relative" onMouseUp={handleSelection}>
                    <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)} loading={<div className="p-8 text-gray-500">Loading PDF...</div>}>
                      <Page pageNumber={pageNumber} renderTextLayer={true} renderAnnotationLayer={true} className="shadow-lg bg-white" />
                    </Document>
                  </div>
                  {numPages && (
                    <div className="flex items-center justify-center gap-4 p-3 border-t border-gray-100 bg-white text-sm text-gray-600 shrink-0">
                      <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)} className="hover:text-gray-900 disabled:opacity-50">Previous</button>
                      <span>Page {pageNumber} of {numPages}</span>
                      <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)} className="hover:text-gray-900 disabled:opacity-50">Next</button>
                    </div>
                  )}
                </div>
                
                <div className="w-full lg:w-80 shrink-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-6 shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#AB0520]/10 text-[#AB0520]">
                      <Icons.Chat />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto text-sm text-gray-700">
                    {isAiLoading ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-[#AB0520] rounded-full animate-spin mb-4"></div>
                        <p>Analyzing document...</p>
                      </div>
                    ) : aiResponse ? (
                      <div className="prose prose-sm prose-p:leading-relaxed prose-a:text-[#AB0520]">
                        <h4 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">AI Explanation</h4>
                        <div dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br/>') }} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <p>Select text in the document and click "Ask AI", or use a quick action above.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'writing' && (
          <div className="h-full flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Writing Support</h3>
            <p className="mb-4 text-sm text-gray-500">Draft your essay with AI assistance.</p>
            <div className="flex-1 rounded-xl border border-gray-200 p-4 outline-none focus-within:border-[#0C234B] focus-within:ring-1 focus-within:ring-[#0C234B]">
              <textarea className="h-full w-full resize-none bg-transparent outline-none text-gray-700 placeholder-gray-400" placeholder="Start writing..."></textarea>
            </div>
            <div className="mt-4 flex justify-end gap-3 shrink-0">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Fix Grammar</button>
              <button className="rounded-lg bg-[#AB0520] px-4 py-2 text-sm font-medium text-white hover:bg-[#8A041A]">Enhance Tone</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Forums = () => {
  const [posts, setPosts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', visibility: 'Public' });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    const post = {
      id: Date.now(),
      title: newPost.title,
      content: newPost.content,
      visibility: newPost.visibility,
      author: 'student@arizona.edu',
      timestamp: 'Just now'
    };
    
    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', visibility: 'Public' });
    setIsCreating(false);
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full min-h-[calc(100vh-8rem)] flex flex-col relative">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900">Class Discussions</h3>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0C234B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0C234B]/90"
          >
            <Icons.Plus /> Create Post
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6">
        {isCreating ? (
          <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-bold text-gray-900">Create a New Post</h4>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="What's on your mind?"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-[#0C234B] focus:ring-1 focus:ring-[#0C234B]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                <textarea 
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Add more details..."
                  className="h-32 w-full resize-none rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-[#0C234B] focus:ring-1 focus:ring-[#0C234B]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Visibility</label>
                <select 
                  value={newPost.visibility}
                  onChange={(e) => setNewPost({ ...newPost, visibility: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none transition focus:border-[#0C234B] focus:ring-1 focus:ring-[#0C234B]"
                >
                  <option value="Public">Public</option>
                  <option value="Anonymous">Anonymous</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {newPost.visibility === 'Anonymous' ? 'Peers will not see your name. Only the professor and TAs can see who posted this.' : 'Your name will be visible to everyone in the class.'}
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-[#AB0520] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8A041A]"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center animate-in fade-in">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Icons.Forum />
            </div>
            <p className="mb-4 text-lg font-medium text-gray-900">No posts yet</p>
            <p className="mb-6 text-sm text-gray-500">Be the first to start a discussion in this class.</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 rounded-lg bg-[#0C234B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#0C234B]/90"
            >
              <Icons.Plus /> Create Post
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="animate-in fade-in slide-in-from-bottom-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md relative group">
                <button 
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-[#AB0520] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete post"
                >
                  <Icons.Trash />
                </button>
                <div className="mb-3 flex items-start pr-8">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-lg font-bold text-gray-900">{post.title}</h4>
                    <span className={`self-start rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                      post.visibility === 'Public' 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {post.visibility}
                    </span>
                  </div>
                </div>
                <p className="mb-4 text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-1.5">
                    {post.visibility === 'Anonymous' ? (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-white">
                          A
                        </div>
                        <span>Anonymous Student</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#AB0520] text-[10px] font-bold text-white">
                          {post.author.charAt(0).toUpperCase()}
                        </div>
                        <span>{post.author}</span>
                      </>
                    )}
                  </div>
                  <span>•</span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StudyMaterials = ({ resources }) => {
  const profCount = resources.filter(r => r.uploadedBy === 'professor').length;
  const studentCount = resources.filter(r => r.uploadedBy === 'student').length;

  return (
  <div className="flex flex-col gap-6 h-full">
    <div className="grid grid-cols-2 gap-6 shrink-0">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-bold uppercase text-gray-500">Professor Files</h4>
        <p className="mt-2 text-4xl font-black text-gray-900">{profCount} <span className="text-lg font-normal text-gray-500">files</span></p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-bold uppercase text-gray-500">Your Files</h4>
        <p className="mt-2 text-4xl font-black text-[#0C234B]">{studentCount} <span className="text-lg font-normal text-gray-500">files</span></p>
      </div>
    </div>
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex-1 overflow-y-auto">
      <h3 className="mb-4 text-lg font-bold text-gray-900">Current Files</h3>
      <div className="space-y-3">
        {resources.map(res => (
          <div key={res.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <Icons.Folder />
              <span className="text-sm font-medium text-gray-700">{res.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.uploadedBy === 'professor' ? 'bg-gray-200 text-gray-700' : 'bg-[#AB0520]/10 text-[#AB0520]'}`}>{res.uploadedBy === 'professor' ? 'Professor' : 'Student'}</span>
              <Icons.Check />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

// ─── CLASS PAGE ───────────────────────────────────────────────────────────────

const ClassPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'llm';
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);

  const tabs = [
    { id: 'llm', label: 'Class LLM', icon: Icons.Chat },
    { id: 'lit', label: 'AI Literature Support', icon: Icons.Book },
    { id: 'forums', label: 'Forums', icon: Icons.Forum },
    { id: 'resources', label: 'Study Materials', icon: Icons.Folder },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <TopBar
        courseTabs={tabs}
        activeTab={activeTab}
        onTabClick={(tabId) => navigate(`/class/${id}?tab=${tabId}`)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-gray-200 bg-white">
          <div className="px-8 py-5">
            <Link to="/dashboard" className="mb-3 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Course</p>
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#0C234B]">{id}</h2>
              <p className="mt-1 text-sm text-gray-500">Professor: Dr. Smith</p>
            </div>
          </div>
        </div>

        <main className={`flex-1 bg-gray-50 ${activeTab === 'llm' ? 'overflow-hidden' : 'overflow-y-auto p-8'}`}>
          <div className={activeTab === 'llm' ? 'h-full' : 'mx-auto h-full max-w-5xl'}>
            <div className={activeTab === 'llm' ? 'block' : 'hidden'}><ClassLLM /></div>
            <div className={activeTab === 'lit' ? 'block' : 'hidden'}><AILiterature resources={resources} setResources={setResources} /></div>
            <div className={activeTab === 'forums' ? 'block h-full' : 'hidden'}><Forums /></div>
            <div className={activeTab === 'resources' ? 'block h-full' : 'hidden'}><StudyMaterials resources={resources} /></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/class/:id" element={<ClassPage />} />
      </Routes>
    </Router>
  );
}
