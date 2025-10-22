'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AICommunication: React.FC = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    { role: 'ai', content: 'Hello! I\'m your AI Communication Coach. I can help you improve your professional communication skills. What would you like to work on today?' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setConversation([...conversation, { role: 'user', content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setConversation(prev => [...prev, {
        role: 'ai',
        content: 'That\'s a great question! Let me help you with that. [This is a demo response - integrate with your AI backend]'
      }]);
    }, 1000);

    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/user/agents')} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Agents</span>
          </button>
          <h1 className="text-2xl font-bold">AI Communication Coach</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-4 overflow-y-auto">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                  : 'bg-white/10'
              }`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={handleSend}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
};

export default AICommunication;
