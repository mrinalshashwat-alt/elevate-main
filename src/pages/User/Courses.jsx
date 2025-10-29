'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Courses = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { 
      id: 'all', 
      name: 'All Courses', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: 'ai', 
      name: 'AI & ML', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    { 
      id: 'dsa', 
      name: 'Data Structures', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'web', 
      name: 'Web Development', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    },
    { 
      id: 'system', 
      name: 'System Design', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      id: 'interview', 
      name: 'Interview Prep', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const mockCourses = [
    {
      id: 1,
      title: 'Master AI & Machine Learning Fundamentals',
      description: 'Learn the core concepts of AI, neural networks, and machine learning algorithms. Build real-world projects and understand the mathematics behind AI.',
      category: 'ai',
      level: 'Intermediate',
      duration: '12 weeks',
      students: 5420,
      rating: 4.8,
      progress: 65,
      thumbnail: '/img.png',
      instructor: 'Dr. Sarah Chen',
      topics: ['Neural Networks', 'Deep Learning', 'Computer Vision', 'NLP'],
      color: 'from-blue-500 to-purple-600',
      accentColor: 'blue'
    },
    {
      id: 2,
      title: 'Advanced Data Structures & Algorithms',
      description: 'Master complex data structures, algorithm design patterns, and optimization techniques. Solve challenging coding problems and ace technical interviews.',
      category: 'dsa',
      level: 'Advanced',
      duration: '10 weeks',
      students: 8230,
      rating: 4.9,
      progress: 45,
      thumbnail: '/img.png',
      instructor: 'Prof. Michael Kumar',
      topics: ['Trees', 'Graphs', 'Dynamic Programming', 'Greedy Algorithms'],
      color: 'from-orange-500 to-red-600',
      accentColor: 'orange'
    },
    {
      id: 3,
      title: 'Large Language Models & GPT',
      description: 'Deep dive into transformer architecture, fine-tuning techniques, and building applications with modern LLMs. Create your own AI chatbots and content generators.',
      category: 'ai',
      level: 'Advanced',
      duration: '8 weeks',
      students: 3210,
      rating: 4.7,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Dr. Emily Rodriguez',
      topics: ['Transformers', 'Fine-tuning', 'Prompt Engineering', 'RAG Systems'],
      color: 'from-purple-500 to-pink-600',
      accentColor: 'purple'
    },
    {
      id: 4,
      title: 'System Design Fundamentals',
      description: 'Learn to design scalable, distributed systems. Master microservices architecture, database design, caching strategies, and system optimization.',
      category: 'system',
      level: 'Intermediate',
      duration: '9 weeks',
      students: 4560,
      rating: 4.8,
      progress: 30,
      thumbnail: '/img.png',
      instructor: 'Alex Thompson',
      topics: ['Microservices', 'Load Balancing', 'Database Design', 'Caching'],
      color: 'from-green-500 to-teal-600',
      accentColor: 'green'
    },
    {
      id: 5,
      title: 'Full Stack Web Development with AI',
      description: 'Build modern web applications integrating AI capabilities. Learn React, Node.js, and deploy AI-powered features using the latest frameworks.',
      category: 'web',
      level: 'Intermediate',
      duration: '14 weeks',
      students: 6780,
      rating: 4.6,
      progress: 80,
      thumbnail: '/img.png',
      instructor: 'Jordan Lee',
      topics: ['React', 'Next.js', 'API Integration', 'AI APIs'],
      color: 'from-cyan-500 to-blue-600',
      accentColor: 'cyan'
    },
    {
      id: 6,
      title: 'Technical Interview Mastery',
      description: 'Comprehensive preparation for technical interviews at FAANG companies. Practice coding challenges, system design, and behavioral interviews.',
      category: 'interview',
      level: 'All Levels',
      duration: '6 weeks',
      students: 12980,
      rating: 4.9,
      progress: 90,
      thumbnail: '/img.png',
      instructor: 'Tech Interview Experts',
      topics: ['Coding Problems', 'System Design', 'Behavioral Prep', 'Mock Interviews'],
      color: 'from-yellow-500 to-orange-600',
      accentColor: 'yellow'
    },
    {
      id: 7,
      title: 'Deep Learning with PyTorch',
      description: 'Hands-on deep learning course using PyTorch. Build convolutional networks, RNNs, and GANs for computer vision and natural language processing.',
      category: 'ai',
      level: 'Advanced',
      duration: '11 weeks',
      students: 3890,
      rating: 4.8,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Dr. David Park',
      topics: ['PyTorch', 'CNNs', 'RNNs', 'GANs'],
      color: 'from-indigo-500 to-purple-600',
      accentColor: 'indigo'
    },
    {
      id: 8,
      title: 'Advanced Algorithms & Complexity',
      description: 'Explore advanced algorithmic techniques, complexity analysis, and optimization strategies. Master divide-and-conquer, greedy, and dynamic programming.',
      category: 'dsa',
      level: 'Advanced',
      duration: '10 weeks',
      students: 5120,
      rating: 4.7,
      progress: 25,
      thumbnail: '/img.png',
      instructor: 'Prof. Lisa Anderson',
      topics: ['Algorithm Design', 'Complexity Theory', 'Optimization', 'Problem Solving'],
      color: 'from-red-500 to-pink-600',
      accentColor: 'red'
    },
    {
      id: 9,
      title: 'AI Ethics & Responsible Development',
      description: 'Understand the ethical implications of AI, bias mitigation, fairness, and responsible AI development practices for building trustworthy systems.',
      category: 'ai',
      level: 'Intermediate',
      duration: '7 weeks',
      students: 2340,
      rating: 4.6,
      progress: 50,
      thumbnail: '/img.png',
      instructor: 'Dr. Maria Santos',
      topics: ['AI Ethics', 'Bias Detection', 'Fairness', 'Privacy'],
      color: 'from-emerald-500 to-green-600',
      accentColor: 'emerald'
    },
    {
      id: 10,
      title: 'Competitive Programming Mastery',
      description: 'Master competitive programming techniques for coding contests. Learn advanced algorithms, optimization tricks, and problem-solving strategies.',
      category: 'dsa',
      level: 'Advanced',
      duration: '12 weeks',
      students: 6790,
      rating: 4.9,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Competitive Programmers Team',
      topics: ['Contest Strategies', 'Optimization', 'Advanced Algorithms', 'Practice'],
      color: 'from-violet-500 to-purple-600',
      accentColor: 'violet'
    },
    {
      id: 11,
      title: 'Modern Frontend with AI Features',
      description: 'Build cutting-edge frontend applications with AI integration. Learn React, TypeScript, and implement AI-powered UI components and features.',
      category: 'web',
      level: 'Intermediate',
      duration: '10 weeks',
      students: 4320,
      rating: 4.7,
      progress: 40,
      thumbnail: '/img.png',
      instructor: 'Ryan Chen',
      topics: ['React', 'TypeScript', 'AI Components', 'State Management'],
      color: 'from-sky-500 to-blue-600',
      accentColor: 'sky'
    },
    {
      id: 12,
      title: 'Distributed Systems & Cloud Architecture',
      description: 'Design and implement distributed systems on cloud platforms. Master Kubernetes, Docker, and build scalable, resilient architectures.',
      category: 'system',
      level: 'Advanced',
      duration: '13 weeks',
      students: 3560,
      rating: 4.8,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Chris Martinez',
      topics: ['Kubernetes', 'Docker', 'AWS', 'Architecture Patterns'],
      color: 'from-amber-500 to-yellow-600',
      accentColor: 'amber'
    }
  ];

  const filteredCourses = mockCourses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNavigation = (route) => {
    window.location.href = route;
  };

  const getProgressColor = (progress) => {
    if (progress === 0) return 'from-gray-500 to-gray-600';
    if (progress < 50) return 'from-red-500 to-orange-600';
    if (progress < 80) return 'from-yellow-500 to-orange-600';
    return 'from-green-500 to-emerald-600';
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      {/* Premium Header */}
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
                Courses
              </h1>
            </div>
            
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Premium Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Learn & Master New Skills
            </span>
          </div>
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            Expand Your Knowledge
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
            Comprehensive courses in AI, Data Structures, Web Development, and more
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

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-white/10 backdrop-blur-xl border-2 border-orange-500/50 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 backdrop-blur-xl border border-white/10 text-gray-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <span className="text-gray-400 font-medium">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, idx) => {
              return (
                <div
                  key={course.id}
                  className="group relative"
                >
                  {/* Premium Glass Card */}
                  <div className="relative h-full transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
                    {/* Glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${course.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 rounded-3xl`}></div>
                    
                    {/* Main card */}
                    <div className={`relative h-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 transition-all duration-300 overflow-hidden shadow-xl group-hover:shadow-2xl ${
                      course.accentColor === 'blue' ? 'group-hover:border-blue-500/50 group-hover:shadow-blue-500/20' :
                      course.accentColor === 'orange' ? 'group-hover:border-orange-500/50 group-hover:shadow-orange-500/20' :
                      course.accentColor === 'purple' ? 'group-hover:border-purple-500/50 group-hover:shadow-purple-500/20' :
                      course.accentColor === 'green' ? 'group-hover:border-green-500/50 group-hover:shadow-green-500/20' :
                      course.accentColor === 'cyan' ? 'group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20' :
                      course.accentColor === 'yellow' ? 'group-hover:border-yellow-500/50 group-hover:shadow-yellow-500/20' :
                      course.accentColor === 'indigo' ? 'group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20' :
                      course.accentColor === 'red' ? 'group-hover:border-red-500/50 group-hover:shadow-red-500/20' :
                      course.accentColor === 'emerald' ? 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20' :
                      course.accentColor === 'violet' ? 'group-hover:border-violet-500/50 group-hover:shadow-violet-500/20' :
                      course.accentColor === 'sky' ? 'group-hover:border-sky-500/50 group-hover:shadow-sky-500/20' :
                      'group-hover:border-amber-500/50 group-hover:shadow-amber-500/20'
                    }`}>
                      {/* Top accent */}
                      <div className={`h-1 bg-gradient-to-r ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      
                      <div className="p-6">
                        {/* Course Image/Thumbnail */}
                        <div className="relative mb-6 aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-white/20 transition-all duration-300">
                          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-20`}></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="transform transition-transform duration-500 group-hover:scale-110">
                              {categories.find(c => c.id === course.category)?.icon ? (
                                <div className="text-white filter drop-shadow-2xl">
                                  {React.cloneElement(categories.find(c => c.id === course.category).icon, { className: 'w-24 h-24' })}
                                </div>
                              ) : (
                                <svg className="w-24 h-24 text-white filter drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {/* Level Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                            <span className="text-xs font-semibold text-white">{course.level}</span>
                          </div>

                          {/* Progress Badge */}
                          {course.progress > 0 && (
                            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
                              <span className="text-xs font-semibold text-white">{course.progress}% Complete</span>
                            </div>
                          )}
                        </div>

                        {/* Course Content */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                      {course.title}
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 min-h-[4.5rem]">
                      {course.description}
                            </p>
                          </div>

                          {/* Course Meta */}
                          <div className="space-y-3 pt-3 border-t border-white/10">
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
                                  {(course.students / 1000).toFixed(1)}k
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-400">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold">{course.rating}</span>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            {course.progress > 0 && (
                              <div className="space-y-2">
                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(course.progress)} transition-all duration-500`}
                                    style={{ width: `${course.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Topics Tags */}
                            <div className="flex flex-wrap gap-2">
                              {course.topics.slice(0, 2).map((topic, i) => (
                                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                                  {topic}
                                </span>
                              ))}
                              {course.topics.length > 2 && (
                                <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                                  +{course.topics.length - 2}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                      onClick={() => router.push(`/user/content/${course.id}`)}
                            className={`relative w-full mt-6 py-3.5 rounded-xl font-semibold overflow-hidden transition-all duration-300 ${
                              course.progress > 0
                                ? 'bg-white/10 text-white border border-white/20 hover:shadow-xl active:scale-95 backdrop-blur-sm'
                                : `bg-gradient-to-r ${course.color} text-white border-0 hover:shadow-xl active:scale-95`
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center space-x-2">
                              {course.progress > 0 ? (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Continue Learning</span>
                                </>
                              ) : (
                                <>
                                  <span>Start Course</span>
                                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </>
                              )}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div className={`h-1 bg-gradient-to-r ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
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

export default Courses;