'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiBook, FiPlay } from 'react-icons/fi';

const Content = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <FiArrowLeft className="text-xl" />
            <span>Back to Courses</span>
          </button>
        </div>

        {/* Course Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <FiBook className="text-3xl text-purple-400" />
            <h1 className="text-3xl font-bold">Course Content</h1>
          </div>

          <div className="space-y-6">
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <FiPlay className="text-6xl text-purple-400 mx-auto mb-4" />
                <p className="text-gray-400">Video content will load here</p>
              </div>
            </div>

            {/* Course Description */}
            <div className="prose prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">About This Course</h2>
              <p className="text-gray-300 leading-relaxed">
                This course content page is ready for integration with your backend API.
                Once connected, it will display video lessons, reading materials, and interactive content.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => router.push('/user/courses')}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back to Courses
              </button>
              <button
                onClick={() => router.push('/user/test/1')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Take Course Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Content;

