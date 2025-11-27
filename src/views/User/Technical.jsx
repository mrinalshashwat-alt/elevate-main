'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Technical = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  const courses = [
    {
      id: 1,
      title: 'Programming & Scripting Module',
      description: 'Master fundamental programming concepts and scripting languages. Learn Python, JavaScript, and shell scripting for automation and development.',
      difficulty: 'Beginner',
      duration: '8 weeks',
      students: 15230,
      rating: 4.7,
      level: 'Beginner'
    },
    {
      id: 2,
      title: 'Cloud & DevOps Module',
      description: 'Comprehensive training in cloud platforms and DevOps practices. Master AWS, Docker, Kubernetes, and CI/CD pipelines.',
      difficulty: 'Intermediate',
      duration: '10 weeks',
      students: 12450,
      rating: 4.8,
      level: 'Intermediate'
    },
    {
      id: 3,
      title: 'AI & Machine Learning Module',
      description: 'Deep dive into artificial intelligence and machine learning algorithms. Build neural networks, work with data, and deploy ML models.',
      difficulty: 'Advanced',
      duration: '12 weeks',
      students: 8920,
      rating: 4.9,
      level: 'Advanced'
    },
    {
      id: 4,
      title: 'Web & Mobile Development Module',
      description: 'Full-stack web and mobile app development. Learn React, Node.js, React Native, and modern development frameworks.',
      difficulty: 'Intermediate',
      duration: '10 weeks',
      students: 18340,
      rating: 4.7,
      level: 'Intermediate'
    },
    {
      id: 5,
      title: 'Data & Analytics Module',
      description: 'Data science, analytics, and visualization. Master SQL, data analysis tools, and business intelligence platforms.',
      difficulty: 'Intermediate',
      duration: '9 weeks',
      students: 11260,
      rating: 4.6,
      level: 'Intermediate'
    },
    {
      id: 6,
      title: 'Cybersecurity Module',
      description: 'Security fundamentals, ethical hacking, and protection strategies. Learn penetration testing and security best practices.',
      difficulty: 'Advanced',
      duration: '11 weeks',
      students: 7680,
      rating: 4.8,
      level: 'Advanced'
    },
    {
      id: 7,
      title: 'Blockchain & Web3 Module',
      description: 'Blockchain technology, smart contracts, and decentralized applications. Build on Ethereum and explore Web3 ecosystems.',
      difficulty: 'Advanced',
      duration: '10 weeks',
      students: 5430,
      rating: 4.5,
      level: 'Advanced'
    },
    {
      id: 8,
      title: 'IoT & Embedded Systems Module',
      description: 'Internet of Things and embedded systems programming. Work with microcontrollers, sensors, and IoT platforms.',
      difficulty: 'Advanced',
      duration: '9 weeks',
      students: 4320,
      rating: 4.6,
      level: 'Advanced'
    },
    {
      id: 9,
      title: 'AR/VR & Metaverse Module',
      description: 'Augmented and virtual reality development. Create immersive experiences and metaverse applications.',
      difficulty: 'Advanced',
      duration: '10 weeks',
      students: 3890,
      rating: 4.7,
      level: 'Advanced'
    },
    {
      id: 10,
      title: 'Quantum Computing Module',
      description: 'Introduction to quantum computing principles and algorithms. Learn quantum programming and quantum machine learning.',
      difficulty: 'Advanced',
      duration: '8 weeks',
      students: 2150,
      rating: 4.9,
      level: 'Advanced'
    },
    {
      id: 11,
      title: 'Robotics & Automation Module',
      description: 'Robotic systems, automation, and control systems. Build and program robots for various applications.',
      difficulty: 'Advanced',
      duration: '11 weeks',
      students: 3210,
      rating: 4.6,
      level: 'Advanced'
    },
    {
      id: 12,
      title: 'Sustainable & Green Tech Module',
      description: 'Sustainable technology solutions and green computing. Focus on energy efficiency and eco-friendly tech practices.',
      difficulty: 'Intermediate',
      duration: '7 weeks',
      students: 5420,
      rating: 4.5,
      level: 'Intermediate'
    },
    {
      id: 13,
      title: 'AI & Prompt Engineering',
      description: 'Master the art of prompt engineering for AI models. Learn to effectively communicate with LLMs and optimize AI interactions.',
      difficulty: 'Intermediate',
      duration: '6 weeks',
      students: 12480,
      rating: 4.8,
      level: 'Intermediate'
    },
    {
      id: 14,
      title: 'Cloud-Native AI / Cloud ML Specialization',
      description: 'Deploy and scale machine learning models in the cloud. Master cloud-native AI infrastructure and MLops practices.',
      difficulty: 'Advanced',
      duration: '10 weeks',
      students: 5670,
      rating: 4.7,
      level: 'Advanced'
    },
    {
      id: 15,
      title: 'Machine Learning Operations (MLOps)',
      description: 'End-to-end MLOps workflows for production ML systems. CI/CD for ML, model monitoring, and deployment strategies.',
      difficulty: 'Advanced',
      duration: '9 weeks',
      students: 6780,
      rating: 4.8,
      level: 'Advanced'
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || 
                             course.level.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/70 backdrop-blur-2xl border-b border-white/20 sticky top-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <button
              onClick={handleBackToHome}
              className="group flex items-center space-x-3 text-white hover:text-orange-400 transition-all duration-300"
            >
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 group-hover:border-orange-500/50 transition-all duration-300 group-hover:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-semibold">Back to Home</span>
            </button>
            
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Technical Courses
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Technical Training Programs
            </span>
          </div>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            Master Technical Skills
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Comprehensive technical courses covering programming, cloud computing, AI, and emerging technologies
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-xl blur-xl opacity-50"></div>
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg"
                />
              </div>
            </div>
          </div>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDifficultyFilter('all')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                difficultyFilter === 'all'
                  ? 'bg-white/10 backdrop-blur-xl border-2 border-orange-500/50 text-white shadow-lg shadow-orange-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
              }`}
            >
              All Levels
            </button>
            <button
              onClick={() => setDifficultyFilter('beginner')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                difficultyFilter === 'beginner'
                  ? 'bg-green-500/20 backdrop-blur-xl border-2 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setDifficultyFilter('intermediate')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                difficultyFilter === 'intermediate'
                  ? 'bg-yellow-500/20 backdrop-blur-xl border-2 border-yellow-500/50 text-yellow-400 shadow-lg shadow-yellow-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
              }`}
            >
              Intermediate
            </button>
            <button
              onClick={() => setDifficultyFilter('advanced')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                difficultyFilter === 'advanced'
                  ? 'bg-red-500/20 backdrop-blur-xl border-2 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20'
                  : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Available
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group relative"
              >
                {/* Course Card */}
                <div className="relative h-full transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 rounded-3xl"></div>
                  
                  {/* Main card */}
                  <div className="relative h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:border-orange-500/50 group-hover:shadow-orange-500/20">
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="p-6">
                      {/* Course Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-semibold">{course.rating}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 min-h-[3rem]">
                          {course.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem]">
                          {course.description}
                        </p>
                      </div>

                      {/* Course Meta */}
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-4 text-gray-400">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {(course.students / 1000).toFixed(1)}k students
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        className="relative w-full mt-6 py-3.5 rounded-xl font-semibold overflow-hidden transition-all duration-300 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white border-0 hover:shadow-xl hover:shadow-orange-500/40 active:scale-95"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-2">
                          <span>Start Course</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      </button>
                    </div>

                    {/* Bottom accent line */}
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-6 rounded-full bg-white/5 mb-4">
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Technical;

