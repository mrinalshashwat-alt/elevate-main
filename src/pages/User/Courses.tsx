'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getUserCourses } from '../../api/user';

const Courses: React.FC = () => {
  const router = useRouter();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['userCourses'],
    queryFn: getUserCourses,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/user/dashboard')} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Your Learning Journey</h2>
          <p className="text-gray-400">Continue learning and developing your skills</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading courses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course) => (
              <div key={course.id} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all">
                <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{course.duration}</span>
                    <span className="text-sm font-semibold text-orange-500">{course.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => router.push(`/user/content/${course.id}`)}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
