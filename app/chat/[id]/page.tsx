'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { ChevronLeft, Send, Paperclip, Smile, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';
import { teamMembers } from '@/lib/data/team';

const colors = [
  'from-red-500 to-rose-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-purple-500 to-violet-500',
  'from-pink-500 to-fuchsia-500',
  'from-cyan-500 to-sky-500',
  'from-lime-500 to-green-500',
];

const defaultMessages = [
  { id: 1, isMe: false, text: 'Hi there! Thanks for reaching out. How can I help you today?', time: '10:00 AM', read: true },
  { id: 2, isMe: true, text: 'Hello! I wanted to discuss a project with you.', time: '10:02 AM', read: true },
  { id: 3, isMe: false, text: 'Of course! I\'d be happy to hear about it. What kind of project do you have in mind?', time: '10:03 AM', read: true },
];

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const member = teamMembers.find(m => m.id === Number(id));
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const color = colors[(Number(id) - 1) % colors.length];

  if (!member) return notFound();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      isMe: true,
      text: input.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        isMe: false,
        text: 'Thanks for your message! I\'ll get back to you shortly.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-sm`}>
              {member.avatar}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 text-sm leading-tight">{member.name}</h2>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Role badge */}
      <div className="flex justify-center py-3">
        <span className="text-xs text-gray-400 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
          {member.role}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 pb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!msg.isMe && (
                <div className={`w-8 h-8 rounded-full bg-linear-to-br ${color} flex items-center justify-center text-white font-bold text-xs shrink-0 self-end`}>
                  {member.avatar}
                </div>
              )}
              <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.isMe
                    ? 'bg-red-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
                <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-[10px] text-gray-400">{msg.time}</span>
                  {msg.isMe && (
                    msg.read
                      ? <CheckCheck className="w-3 h-3 text-green-500" />
                      : <Check className="w-3 h-3 text-gray-400" />
                  )}
                </div>
              </div>
              {msg.isMe && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs shrink-0 self-end">
                  ME
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-3 py-3 pb-safe">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-red-400 focus:bg-white transition-all outline-none"
            />
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
