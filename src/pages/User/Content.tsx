'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { getCourseContent } from '../../api/user';

const Content: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const { data: content, isLoading } = useQuery({
    queryKey: ['courseContent', courseId],
    queryFn: () => getCourseContent(courseId!),
    enabled: !!courseId,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push('/user/courses')} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Courses</span>
          </button>
          <h1 className="text-2xl font-bold">Course Content</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading content...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Modules */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Course Modules</h3>
                <div className="space-y-3">
                  {content?.modules?.map((module: any, idx: number) => (
                    <div
                      key={module.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        module.completed
                          ? 'bg-green-500/20 border border-green-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{module.title}</p>
                          <p className="text-sm text-gray-400">{module.duration}</p>
                        </div>
                        {module.completed && (
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
                <h2 className="text-3xl font-bold mb-6">{content?.title}</h2>
                
                {/* Video Player Placeholder */}
                <div className="bg-black/50 rounded-xl mb-6 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-white/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400">Video content will be displayed here</p>
                  </div>
                </div>

                {/* Content Description */}
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-bold mb-4">About this module</h3>
                  <p className="text-gray-300 mb-4">
                    This is a placeholder for the course content. In production, this would display the actual course materials, videos, and interactive elements.
                  </p>
                  <p className="text-gray-300 mb-4">
                    You can integrate video players, PDF viewers, code editors, and other interactive learning tools here.
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                    Previous Module
                  </button>
                  <button
                    onClick={() => router.push(`/user/test/${courseId}`)}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Take Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Content;
