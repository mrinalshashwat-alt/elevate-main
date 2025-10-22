'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { submitTest } from '../../api/user';

const Test: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: 1,
      question: 'What is the primary purpose of React hooks?',
      options: [
        'To style components',
        'To manage state and side effects in functional components',
        'To create class components',
        'To handle routing'
      ],
    },
    {
      id: 2,
      question: 'Which hook is used for side effects in React?',
      options: ['useState', 'useEffect', 'useContext', 'useReducer'],
    },
    {
      id: 3,
      question: 'What does the virtual DOM do?',
      options: [
        'Stores user data',
        'Improves performance by minimizing direct DOM manipulation',
        'Handles API calls',
        'Manages routing'
      ],
    },
  ];

  const submitMutation = useMutation({
    mutationFn: () => submitTest(courseId!, answers),
    onSuccess: () => {
      setShowResults(true);
    },
  });

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate();
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Test Completed!</h2>
            <p className="text-xl text-gray-300 mb-2">Your Score: 85%</p>
            <p className="text-gray-400 mb-8">Great job! You passed the test.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/user/courses')}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Back to Courses
              </button>
              <button
                onClick={() => router.push('/user/dashboard')}
                className="w-full py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => router.push(`/user/content/${courseId}`)} className="flex items-center space-x-2 hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Content</span>
          </button>
          <h1 className="text-2xl font-bold">Course Test</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-400">
                {Object.keys(answers).length} answered
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">{questions[currentQuestion].question}</h3>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    answers[currentQuestion] === option
                      ? 'bg-orange-500/20 border-orange-500'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === option
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-white/30'
                    }`}>
                      {answers[currentQuestion] === option && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Test;
