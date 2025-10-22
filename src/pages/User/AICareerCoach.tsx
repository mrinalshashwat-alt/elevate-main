'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const AICareerCoach: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const topics = [
    { id: '1', title: 'Career Path Planning', icon: '🎯', description: 'Strategic guidance for your professional journey', gradient: 'from-orange-500/20 to-red-500/20' },
    { id: '2', title: 'Skill Gap Analysis', icon: '📊', description: 'Identify and bridge critical competencies', gradient: 'from-red-500/20 to-orange-600/20' },
    { id: '3', title: 'Resume Review', icon: '📄', description: 'Expert optimization for maximum impact', gradient: 'from-orange-600/20 to-amber-500/20' },
    { id: '4', title: 'Salary Negotiation', icon: '💰', description: 'Master the art of value articulation', gradient: 'from-amber-500/20 to-orange-500/20' },
    { id: '5', title: 'Job Search Strategy', icon: '🔍', description: 'Data-driven approach to opportunities', gradient: 'from-orange-500/20 to-red-600/20' },
    { id: '6', title: 'Career Transition', icon: '🔄', description: 'Navigate pivotal career transformations', gradient: 'from-red-600/20 to-orange-500/20' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = 80;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 120, 40, 0.6)';
        ctx.fill();

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i === j) return;

          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / 150) * 0.3;
            ctx.strokeStyle = `rgba(255, 100, 30, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-orange-950/20 to-black text-white overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.4 }}
      />

      <div className="relative z-10">
        <header className="bg-black/40 backdrop-blur-xl border-b border-orange-500/20 shadow-lg shadow-orange-500/10">
          <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors group"
            >
              <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Agents</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/50">
                <span className="text-xl">🧠</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                AI Career Coach
              </h1>
            </div>
            <div className="w-32"></div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
              Your Elite Career Intelligence
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Harness advanced AI-powered insights to accelerate your professional trajectory
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 text-left hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {topic.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-300 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
                    {topic.description}
                  </p>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3 text-orange-300">Premium Career Intelligence</h3>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Our AI-powered career coach leverages advanced neural networks and industry data to provide 
              personalized guidance tailored to your unique professional profile and aspirations.
            </p>
          </div>
        </main>
      </div>

      {selectedTopic && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 rounded-3xl p-10 max-w-3xl w-full shadow-2xl shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-4">
                  <div className="text-5xl">
                    {topics.find(t => t.id === selectedTopic)?.icon}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-orange-300 mb-1">
                      {topics.find(t => t.id === selectedTopic)?.title}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {topics.find(t => t.id === selectedTopic)?.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-gray-400 hover:text-orange-400 transition-colors p-2 hover:bg-orange-500/10 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-lg border border-orange-500/20 rounded-xl p-6">
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/50">
                      <span className="text-sm">🤖</span>
                    </div>
                    <div>
                      <p className="text-xs text-orange-400 font-semibold mb-2">AI COACH</p>
                      <p className="text-gray-200 leading-relaxed">
                        I'd be delighted to assist you with {topics.find(t => t.id === selectedTopic)?.title.toLowerCase()}. 
                        Let's begin by understanding your current position and aspirations. This personalized session will help 
                        map out your optimal path forward.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full h-36 px-5 py-4 bg-black/50 border border-orange-500/30 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none text-gray-200 placeholder-gray-500 transition-all"
                  placeholder="Share your current situation, goals, or specific questions..."
                ></textarea>

                <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-semibold hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2">
                  <span>Send Message</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICareerCoach;