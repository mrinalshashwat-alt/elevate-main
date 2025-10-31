'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiClock, FiUsers, FiStar, FiSearch, FiPlay } from 'react-icons/fi';

const Courses = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const recommendedRef = useRef(null);
  const featuredRef = useRef(null);
  const allCoursesRef = useRef(null);

  const categories = [
    { 
      id: 'all', 
      name: 'All', 
    },
    { 
      id: 'ai', 
      name: 'AI & ML', 
    },
    { 
      id: 'dsa', 
      name: 'DSA', 
    },
    { 
      id: 'web', 
      name: 'Web Dev', 
    },
    { 
      id: 'system', 
      name: 'System Design', 
    },
    { 
      id: 'interview', 
      name: 'Interview', 
    }
  ];

  const mockCourses = [
    {
      id: 1,
      title: 'Master AI & Machine Learning Fundamentals',
      description: 'Learn the core concepts of AI, neural networks, and machine learning algorithms.',
      category: 'ai',
      level: 'Intermediate',
      duration: '12 weeks',
      students: 5420,
      rating: 4.8,
      progress: 65,
      thumbnail: '/img.png',
      instructor: 'Dr. Sarah Chen',
      topics: ['Neural Networks', 'Deep Learning', 'Computer Vision'],
      color: 'from-blue-500 to-purple-600',
      accentColor: 'blue',
      isRecommended: true,
      isFeatured: true
    },
    {
      id: 2,
      title: 'Advanced Data Structures & Algorithms',
      description: 'Master complex data structures, algorithm design patterns, and optimization techniques.',
      category: 'dsa',
      level: 'Advanced',
      duration: '10 weeks',
      students: 8230,
      rating: 4.9,
      progress: 45,
      thumbnail: '/img.png',
      instructor: 'Prof. Michael Kumar',
      topics: ['Trees', 'Graphs', 'Dynamic Programming'],
      color: 'from-orange-500 to-red-600',
      accentColor: 'orange',
      isRecommended: true,
      isFeatured: true
    },
    {
      id: 3,
      title: 'Large Language Models & GPT',
      description: 'Deep dive into transformer architecture, fine-tuning techniques, and building applications.',
      category: 'ai',
      level: 'Advanced',
      duration: '8 weeks',
      students: 3210,
      rating: 4.7,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Dr. Emily Rodriguez',
      topics: ['Transformers', 'Fine-tuning', 'Prompt Engineering'],
      color: 'from-purple-500 to-pink-600',
      accentColor: 'purple',
      isRecommended: false,
      isFeatured: true
    },
    {
      id: 4,
      title: 'System Design Fundamentals',
      description: 'Learn to design scalable, distributed systems. Master microservices architecture.',
      category: 'system',
      level: 'Intermediate',
      duration: '9 weeks',
      students: 4560,
      rating: 4.8,
      progress: 30,
      thumbnail: '/img.png',
      instructor: 'Alex Thompson',
      topics: ['Microservices', 'Load Balancing', 'Database Design'],
      color: 'from-green-500 to-teal-600',
      accentColor: 'green',
      isRecommended: true,
      isFeatured: false
    },
    {
      id: 5,
      title: 'Full Stack Web Development with AI',
      description: 'Build modern web applications integrating AI capabilities with React and Node.js.',
      category: 'web',
      level: 'Intermediate',
      duration: '14 weeks',
      students: 6780,
      rating: 4.6,
      progress: 80,
      thumbnail: '/img.png',
      instructor: 'Jordan Lee',
      topics: ['React', 'Next.js', 'API Integration'],
      color: 'from-cyan-500 to-blue-600',
      accentColor: 'cyan',
      isRecommended: false,
      isFeatured: true
    },
    {
      id: 6,
      title: 'Technical Interview Mastery',
      description: 'Comprehensive preparation for technical interviews at FAANG companies.',
      category: 'interview',
      level: 'All Levels',
      duration: '6 weeks',
      students: 12980,
      rating: 4.9,
      progress: 90,
      thumbnail: '/img.png',
      instructor: 'Tech Interview Experts',
      topics: ['Coding Problems', 'System Design', 'Behavioral Prep'],
      color: 'from-yellow-500 to-orange-600',
      accentColor: 'yellow',
      isRecommended: true,
      isFeatured: true
    },
    {
      id: 7,
      title: 'Deep Learning with PyTorch',
      description: 'Hands-on deep learning course using PyTorch. Build CNNs, RNNs, and GANs.',
      category: 'ai',
      level: 'Advanced',
      duration: '11 weeks',
      students: 3890,
      rating: 4.8,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Dr. David Park',
      topics: ['PyTorch', 'CNNs', 'RNNs'],
      color: 'from-indigo-500 to-purple-600',
      accentColor: 'indigo',
      isRecommended: false,
      isFeatured: false
    },
    {
      id: 8,
      title: 'Advanced Algorithms & Complexity',
      description: 'Explore advanced algorithmic techniques, complexity analysis, and optimization.',
      category: 'dsa',
      level: 'Advanced',
      duration: '10 weeks',
      students: 5120,
      rating: 4.7,
      progress: 25,
      thumbnail: '/img.png',
      instructor: 'Prof. Lisa Anderson',
      topics: ['Algorithm Design', 'Complexity Theory', 'Optimization'],
      color: 'from-red-500 to-pink-600',
      accentColor: 'red',
      isRecommended: false,
      isFeatured: false
    },
    {
      id: 9,
      title: 'AI Ethics & Responsible Development',
      description: 'Understand the ethical implications of AI, bias mitigation, and fairness.',
      category: 'ai',
      level: 'Intermediate',
      duration: '7 weeks',
      students: 2340,
      rating: 4.6,
      progress: 50,
      thumbnail: '/img.png',
      instructor: 'Dr. Maria Santos',
      topics: ['AI Ethics', 'Bias Detection', 'Fairness'],
      color: 'from-emerald-500 to-green-600',
      accentColor: 'emerald',
      isRecommended: false,
      isFeatured: false
    },
    {
      id: 10,
      title: 'Competitive Programming Mastery',
      description: 'Master competitive programming techniques for coding contests.',
      category: 'dsa',
      level: 'Advanced',
      duration: '12 weeks',
      students: 6790,
      rating: 4.9,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Competitive Programmers Team',
      topics: ['Contest Strategies', 'Optimization', 'Advanced Algorithms'],
      color: 'from-violet-500 to-purple-600',
      accentColor: 'violet',
      isRecommended: false,
      isFeatured: false
    },
    {
      id: 11,
      title: 'Modern Frontend with AI Features',
      description: 'Build cutting-edge frontend applications with AI integration.',
      category: 'web',
      level: 'Intermediate',
      duration: '10 weeks',
      students: 4320,
      rating: 4.7,
      progress: 40,
      thumbnail: '/img.png',
      instructor: 'Ryan Chen',
      topics: ['React', 'TypeScript', 'AI Components'],
      color: 'from-sky-500 to-blue-600',
      accentColor: 'sky',
      isRecommended: false,
      isFeatured: false
    },
    {
      id: 12,
      title: 'Distributed Systems & Cloud Architecture',
      description: 'Design and implement distributed systems on cloud platforms.',
      category: 'system',
      level: 'Advanced',
      duration: '13 weeks',
      students: 3560,
      rating: 4.8,
      progress: 0,
      thumbnail: '/img.png',
      instructor: 'Chris Martinez',
      topics: ['Kubernetes', 'Docker', 'AWS'],
      color: 'from-amber-500 to-yellow-600',
      accentColor: 'amber',
      isRecommended: false,
      isFeatured: false
    }
  ];

  const recommendedCourses = mockCourses.filter(c => c.isRecommended);
  const featuredCourses = mockCourses.filter(c => c.isFeatured);

  const filteredCourses = mockCourses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const CourseCard = ({ course, isCompact = false }) => (
    <motion.div
      className="flex-shrink-0 group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className={`group relative bg-black/90 border border-[#FF5728] rounded-2xl overflow-hidden transition-all duration-300 ${
        isCompact ? 'w-[320px]' : 'w-[380px]'
      }`}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
      }}>
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-30`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-20">
              {course.category.toUpperCase()}
            </div>
          </div>
          {course.progress > 0 && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${course.color} transition-all duration-500`}
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          {course.progress === 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white font-medium">
              {course.level}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 relative z-10">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3rem]">
              {course.title}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2">
              {course.description}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FiClock className="w-3 h-3" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="w-3 h-3" />
                {(course.students / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              <FiStar className="w-3 h-3 fill-current" />
              {course.rating}
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => router.push(`/user/content/${course.id}`)}
            className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 ${
              course.progress > 0
                ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                : `bg-gradient-to-r ${course.color} text-white hover:shadow-lg`
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              {course.progress > 0 ? (
                <>
                  <FiPlay className="w-4 h-4" />
                  Continue Learning
                </>
              ) : (
                'Start Course'
              )}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
                <h1 className="text-xl font-bold">Courses</h1>
              </div>
            </div>
            <button 
              onClick={() => router.push('/user/dashboard')} 
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
        </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/90 border border-[#FF5728] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5728]/50"
                />
            </div>
          </div>

          {/* Category Filters */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                  ? 'bg-[#FF5728] text-white'
                  : 'bg-black/90 border border-[#FF5728] text-gray-300 hover:bg-[#FF5728]/20'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

        {/* Recommended Courses Section */}
        {selectedCategory === 'all' && recommendedCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recommended For You</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(recommendedRef, 'left')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(recommendedRef, 'right')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div 
              ref={recommendedRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recommendedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}

        {/* Featured Courses Section */}
        {selectedCategory === 'all' && featuredCourses.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Courses</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(featuredRef, 'left')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(featuredRef, 'right')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div 
              ref={featuredRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
        </div>
          </section>
        )}

        {/* All Courses Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === 'all' ? 'All Courses' : categories.find(c => c.id === selectedCategory)?.name + ' Courses'}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(allCoursesRef, 'left')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll(allCoursesRef, 'right')}
                  className="p-2 bg-black/90 border border-[#FF5728] rounded-lg hover:bg-[#FF5728]/20 transition-colors"
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div 
            ref={allCoursesRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isCompact={true} />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-block p-6 rounded-full bg-black/90 border border-[#FF5728] mb-4">
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Courses;
