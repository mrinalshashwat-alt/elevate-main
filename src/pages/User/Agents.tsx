'use client';

import React, { useEffect, useRef } from 'react';

const Agents = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState<Record<string, boolean>>({});

  const agents = [
    {
      id: '1',
      name: 'AI Communication Coach',
      description: 'Enhance your professional communication skills with personalized feedback and practice scenarios.',
      icon: '💬',
      image: '/img.png',
      available: true,
      route: '/user/ai-communication',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      name: 'AI Mock Interview',
      description: 'Practice interviews with AI-powered scenarios and receive instant feedback on your performance.',
      icon: '🎯',
      image: '/img.png',
      available: true,
      route: '/user/ai-mock-interview',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '3',
      name: 'AI Career Coach',
      description: 'Get personalized career guidance and strategic advice to accelerate your professional growth.',
      icon: '🚀',
      image: '/img.png',
      available: true,
      route: '/user/ai-career-coach',
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Neural network particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];
    const particleCount = 80;
    const connectionDistance = 150;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    function animate() {
      if (!canvas || !ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 140, 50, 0.6)';
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            const opacity = (1 - distance / connectionDistance) * 0.3;
            ctx.strokeStyle = `rgba(255, 120, 40, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neural network canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900/20 via-black to-red-900/20"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,100,30,0.1),transparent_50%)]"></div>
      
      {/* Floating orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      {/* Premium Header with Dark Orange Glass Theme */}
      <header className="relative z-10 border-b border-orange-500/20 bg-gradient-to-r from-orange-950/40 via-black/40 to-red-950/40 backdrop-blur-2xl shadow-lg shadow-orange-500/10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => handleNavigation('/user/dashboard')} 
              className="group flex items-center space-x-3 text-orange-300 hover:text-orange-100 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 backdrop-blur-xl border border-orange-500/30 group-hover:border-orange-400/50 transition-all duration-300 group-hover:scale-110 shadow-lg shadow-orange-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Dashboard</span>
            </button>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-200 via-orange-300 to-red-200 bg-clip-text text-transparent drop-shadow-lg">
                AI Agents
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 backdrop-blur-xl shadow-lg shadow-orange-500/20">
            <span className="text-sm font-semibold bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
              POWERED BY ADVANCED AI
            </span>
          </div>
          <h2 className="text-7xl font-bold mb-6 bg-gradient-to-b from-white via-orange-100 to-orange-500 bg-clip-text text-transparent leading-tight">
            AI-Powered Career Tools
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Transform your career with intelligent agents designed to elevate your professional journey
          </p>
        </div>

        {/* Agent Cards */}
        {isLoading ? (
          <div className="text-center py-32">
            <div className="inline-block w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-400">Loading agents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map((agent, idx) => (
              <div
                key={agent.id}
                className="group relative animate-fadeInUp"
                style={{
                  animationDelay: `${idx * 0.1}s`
                }}
              >
                {/* 3D Card Container */}
                <div className="relative h-full perspective-1000">
                  <div className="relative h-full transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${agent.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-3xl`}></div>
                    
                    {/* Main card */}
                    <div className="relative h-full bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/10 group-hover:border-white/20 transition-all duration-500 overflow-hidden">
                      {/* Top gradient bar */}
                      <div className={`h-1 bg-gradient-to-r ${agent.color}`}></div>
                      
                      <div className="p-8">
                        {/* Image Container - Fixed positioning */}
                        <div className="relative mb-8 aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-500">
                          {/* Image with proper z-index and display */}
                          {!imageErrors[agent.id] ? (
                            <img 
                              src={agent.image} 
                              alt={agent.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={() => {
                                setImageErrors(prev => ({ ...prev, [agent.id]: true }));
                              }}
                              style={{ display: 'block' }}
                            />
                          ) : (
                            // Fallback icon if image fails
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5">
                              <div className="relative transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                <div className={`absolute inset-0 bg-gradient-to-r ${agent.color} blur-2xl opacity-50`}></div>
                                <span className="relative text-8xl filter drop-shadow-2xl">
                                  {agent.icon}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Gradient overlay for depth */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/20 to-black/40 pointer-events-none"></div>
                          <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-20 mix-blend-overlay group-hover:opacity-30 transition-opacity duration-500 pointer-events-none`}></div>
                          
                          {/* Shine effect */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                            {agent.name}
                          </h3>
                          
                          <p className="text-gray-400 leading-relaxed min-h-[4.5rem]">
                            {agent.description}
                          </p>

                          {/* Launch Button */}
                          <button
                            onClick={() => agent.available && handleNavigation(agent.route)}
                            disabled={!agent.available}
                            className={`relative w-full mt-6 py-4 rounded-xl font-semibold overflow-hidden transition-all duration-300 ${
                              agent.available
                                ? 'bg-gradient-to-r from-white/10 to-white/5 text-white hover:from-white/15 hover:to-white/10 border border-white/20 hover:border-white/30 hover:shadow-2xl hover:shadow-white/20 active:scale-95'
                                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                            }`}
                          >
                            {agent.available ? (
                              <>
                                <span className="relative z-10 flex items-center justify-center space-x-2">
                                  <span>Launch Agent</span>
                                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </span>
                                <div className={`absolute inset-0 bg-gradient-to-r ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              </>
                            ) : (
                              'Coming Soon'
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className={`h-1 bg-gradient-to-r ${agent.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


    </div>
  );
};

export default Agents;