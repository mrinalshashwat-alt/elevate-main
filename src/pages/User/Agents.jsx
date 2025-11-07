'use client';

import React, { useEffect, useRef } from 'react';

const Agents = () => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState({});

  const agents = [
    {
      id: '1',
      name: 'AI Communication Coach',
      description: 'Enhance your professional communication skills with personalized feedback and practice scenarios.',
      icon: '💬',
      image: '/img.png',
      available: true,
      route: '/user/ai-communication',
      accentColor: 'blue',
      hoverGlow: 'blue-500/20'
    },
    {
      id: '2',
      name: 'AI Mock Interview',
      description: 'Practice interviews with AI-powered scenarios and receive instant feedback on your performance.',
      icon: '🎯',
      image: '/img.png',
      available: true,
      route: '/user/ai-mock-interview',
      accentColor: 'orange',
      hoverGlow: 'orange-500/20'
    },
    {
      id: '3',
      name: 'AI Career Coach',
      description: 'Get personalized career guidance and strategic advice to accelerate your professional growth.',
      icon: '🚀',
      image: '/img.png',
      available: true,
      route: '/user/ai-career-coach',
      accentColor: 'purple',
      hoverGlow: 'purple-500/20'
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

    const particles = [];
    const particleCount = 30;
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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
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
            const opacity = (1 - distance / connectionDistance) * 0.03;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
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

  const handleNavigation = (route) => {
    window.location.href = route;
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Neural network canvas - minimal */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 opacity-10"
      />

      {/* Subtle Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Premium Header - Consistent with Dashboard */}
      <header className="relative z-10 bg-black/70 backdrop-blur-2xl border-b border-white/20 sticky top-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => handleNavigation('/user/dashboard')} 
              className="group flex items-center space-x-3 text-white hover:text-orange-400 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 group-hover:border-orange-500/50 transition-all duration-300 group-hover:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-semibold">Dashboard</span>
            </button>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                AI Agents
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Premium Hero Section with Robot Video */}
        <div className="text-center mb-20 relative">
          {/* Robot Video Background - Seamless */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-20">
            <video
              src="/robo.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full max-w-4xl h-auto object-contain"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg relative z-10">
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Powered by Advanced AI
            </span>
          </div>
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight relative z-10">
            AI-Powered Career Tools
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light relative z-10">
            Transform your career with intelligent agents designed to elevate your professional journey
          </p>
        </div>

        {/* Premium Agent Cards */}
        {isLoading ? (
          <div className="text-center py-32">
            <div className="inline-block w-16 h-16 border-4 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-gray-400">Loading agents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map((agent, idx) => {
              const accentColors = {
                blue: 'from-blue-500 to-blue-600',
                orange: 'from-orange-500 to-orange-600',
                purple: 'from-purple-500 to-purple-600'
              };
              const borderColors = {
                blue: 'border-blue-500/50',
                orange: 'border-orange-500/50',
                purple: 'border-purple-500/50'
              };
              const glowColors = {
                blue: 'shadow-blue-500/20',
                orange: 'shadow-orange-500/20',
                purple: 'shadow-purple-500/20'
              };

              return (
                <div
                  key={agent.id}
                  className="group relative"
                  style={{
                    animationDelay: `${idx * 0.1}s`
                  }}
                >
                  {/* Premium Glass Card */}
                  <div className="relative h-full transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${accentColors[agent.accentColor]} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-3xl`}></div>
                    
                    {/* Main card */}
                    <div className={`relative h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 overflow-hidden shadow-xl group-hover:shadow-2xl ${
                      agent.accentColor === 'blue' ? 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20' :
                      agent.accentColor === 'orange' ? 'group-hover:border-orange-500/50 group-hover:shadow-orange-500/20' :
                      'group-hover:border-purple-500/50 group-hover:shadow-purple-500/20'
                    }`}>
                      {/* Subtle top accent */}
                      <div className={`h-1 bg-gradient-to-r ${accentColors[agent.accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="p-8">
                        {/* Image Container */}
                        <div className="relative mb-8 aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
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
                            <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                              <div className="relative transform transition-transform duration-500 group-hover:scale-110">
                                <span className="relative text-8xl filter drop-shadow-2xl">
                                  {agent.icon}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-black/30 pointer-events-none"></div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          <h3 className="text-2xl font-bold text-white">
                            {agent.name}
                          </h3>
                          
                          <p className="text-gray-300 leading-relaxed min-h-[4.5rem]">
                            {agent.description}
                          </p>

                          {/* Premium Launch Button */}
                          <button
                            onClick={() => agent.available && handleNavigation(agent.route)}
                            disabled={!agent.available}
                            className={`relative w-full mt-6 py-4 rounded-xl font-semibold overflow-hidden transition-all duration-300 ${
                              agent.available
                                ? `bg-white/10 text-white border border-white/20 hover:shadow-xl active:scale-95 backdrop-blur-sm ${
                                    agent.accentColor === 'blue' ? 'hover:border-blue-500/50 hover:shadow-blue-500/20' :
                                    agent.accentColor === 'orange' ? 'hover:border-orange-500/50 hover:shadow-orange-500/20' :
                                    'hover:border-purple-500/50 hover:shadow-purple-500/20'
                                  }`
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
                                <div className={`absolute inset-0 bg-gradient-to-r ${accentColors[agent.accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                              </>
                            ) : (
                              'Coming Soon'
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className={`h-1 bg-gradient-to-r ${accentColors[agent.accentColor]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>


    </div>
  );
};

export default Agents;
