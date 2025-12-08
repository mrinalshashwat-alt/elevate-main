'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiSave, FiChevronLeft, FiChevronRight, FiSend, FiShield, FiCheckCircle, FiPlay, FiRefreshCw, FiGrid, FiArrowRight, FiSquare, FiPause, FiRotateCw, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { executeCode, runTestCases, formatOutput, validateCode } from '../../lib/codeSandbox';
import { saveResponse, submitAttempt, sendHeartbeat, reportViolation, executeCode as executeCodeAPI, getCodeResult } from '../../api/candidate';

// Proctoring Alert Modal Component
const ProctoringAlert = ({ isOpen, violation, onClose, violationCount }) => {
  if (!isOpen) return null;

  const getViolationMessage = () => {
    switch (violation?.type) {
      case 'copy':
        return 'Copy operation detected. Copying content is not allowed during the assessment.';
      case 'paste':
        return 'Paste operation detected. Pasting content is not allowed during the assessment.';
      case 'cut':
        return 'Cut operation detected. Cutting content is not allowed during the assessment.';
      case 'context_menu':
        return 'Right-click context menu detected. Right-clicking is disabled during the assessment.';
      case 'tab_switch':
        return 'Tab/window switching detected. You must remain on the assessment page at all times.';
      case 'devtools':
        return 'Developer tools detected. Opening developer tools is not allowed during the assessment.';
      case 'print_screen':
        return 'Print screen detected. Taking screenshots is not allowed during the assessment.';
      case 'multiple_persons':
        return 'Multiple persons detected in the camera view. Only one person is allowed during the assessment.';
      case 'face_not_detected':
        return 'Face not detected. Please ensure your face is visible in the camera at all times.';
      case 'looking_away':
        return 'Looking away detected. Please keep your attention focused on the assessment screen.';
      case 'suspicious_hand_position':
        return 'Suspicious hand position detected. Please keep your hands away from your face and maintain proper posture.';
      default:
        return 'Suspicious activity detected. Please remain focused on the assessment.';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gradient-to-br from-red-900/95 to-orange-900/95 border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{ boxShadow: '0 20px 60px rgba(255, 0, 0, 0.3)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <FiAlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white">Proctoring Alert</h2>
              </div>
              {violationCount > 0 && (
                <div className="px-3 py-1 bg-red-500/30 rounded-full text-red-300 text-sm font-semibold">
                  Violation {violationCount}
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-gray-200 text-lg leading-relaxed mb-4">
                {getViolationMessage()}
              </p>
              <p className="text-red-300 text-sm font-semibold">
                ⚠️ Continued violations may result in assessment disqualification.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-red-500/30">
              <span className="text-gray-400 text-sm">
                Time: {violation?.timestamp ? new Date(violation.timestamp).toLocaleTimeString() : ''}
              </span>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold text-white transition-colors flex items-center space-x-2"
              >
                <span>Acknowledge</span>
                <FiCheck className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Custom glass popover select component matching AIMockInterview style
const GlassSelect = ({ value, onChange, options, placeholder = 'Select', className = '', required = false }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-300 flex items-center justify-between"
      >
        <span className={`${selected ? 'text-gray-200' : 'text-gray-500'}`}>{selected ? selected.label : placeholder}</span>
        <svg className={`w-4 h-4 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden border border-orange-500/30 backdrop-blur-md" style={{ background: 'linear-gradient(180deg, rgba(33,20,14,0.9) 0%, rgba(191,54,12,0.6) 100%)', boxShadow: '0 12px 32px rgba(255,87,34,0.25)' }}>
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value || 'empty'}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-white/10 text-white' : 'text-gray-200 hover:bg-white/10'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Assessment = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const hiddenProctoringVideoRef = useRef(null);
  
  // Backend integration state
  const [attemptId, setAttemptId] = useState(null);
  const [attemptData, setAttemptData] = useState(null);
  const [backendQuestions, setBackendQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [failedSaveCount, setFailedSaveCount] = useState(0);
  const autoSaveTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  // Helper function to get language template (must be defined before useEffect)
  const getLanguageTemplate = (lang) => {
    const langObj = languages.find(l => l.value === lang);
    return langObj ? langObj.template : '';
  };

  // Check if user has completed the pre-assessment flow and load attempt data
  useEffect(() => {
    console.log('Assessment.jsx: Checking flow completion...');
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    const hasCompletedFlow = localStorage.getItem('assessment_flow_completed');
    const storedAttemptData = localStorage.getItem('attempt_data');
    const storedAttemptId = localStorage.getItem('attempt_id');
    const assessmentToken = localStorage.getItem('assessment_token');

    console.log('Flow check:', {
      hasCompletedFlow,
      hasAttemptData: !!storedAttemptData,
      attemptDataLength: storedAttemptData?.length,
      hasAttemptId: !!storedAttemptId,
      attemptId: storedAttemptId,
      hasToken: !!assessmentToken
    });

    if (storedAttemptData) {
      console.log('Attempt data preview:', storedAttemptData.substring(0, 200));
    }

    if (!hasCompletedFlow) {
      console.log('Flow not completed, redirecting to assessment start with token');
      // Redirect to assessment start page with token if available
      if (assessmentToken) {
        router.push(`/user/assessment-start?token=${assessmentToken}`);
      } else {
        router.push('/user/assessment-start');
      }
      return;
    }

    // Load attempt data from localStorage (set by SystemCheck.jsx)
    const canResume = localStorage.getItem('can_resume') === 'true';

    if (storedAttemptData && storedAttemptId) {
      try {
        const data = JSON.parse(storedAttemptData);
        console.log('Loaded attempt data:', data);
        setAttemptData(data);
        setAttemptId(storedAttemptId);

        // Update URL with attempt ID for proper state management and bookmarking
        if (typeof window !== 'undefined' && storedAttemptId) {
          const url = new URL(window.location.href);
          if (!url.searchParams.has('attempt')) {
            url.searchParams.set('attempt', storedAttemptId);
            window.history.replaceState({}, '', url.toString());
          }
        }

        const questions = data.questions || [];
        console.log('Questions from backend:', questions);
        setBackendQuestions(questions);

        // Set timer from stored data initially (will be updated by heartbeat)
        if (data.time_remaining_seconds) {
          console.log('Setting initial timer from stored data:', data.time_remaining_seconds, 'seconds');
          setTimeLeft(data.time_remaining_seconds);
        }
        
        // Immediately fetch fresh time from backend on page load
        const fetchFreshTime = async () => {
          try {
            console.log('Fetching fresh time from backend for attempt:', storedAttemptId);
            const heartbeatResponse = await sendHeartbeat(storedAttemptId);
            console.log('Heartbeat response:', heartbeatResponse);
            if (heartbeatResponse.time_remaining_seconds !== undefined) {
              console.log('✅ Updated timer from backend:', heartbeatResponse.time_remaining_seconds, 'seconds');
              setTimeLeft(heartbeatResponse.time_remaining_seconds);
            } else {
              console.warn('⚠️ Heartbeat response missing time_remaining_seconds');
            }
          } catch (err) {
            console.error('❌ Failed to fetch fresh time:', err);
            console.error('Error details:', err.response?.data || err.message);
            // Keep using stored time if fetch fails
          }
        };
        fetchFreshTime();

        // Initialize questions state from backend
        const mcqQuestions = questions.filter(q => q.type === 'mcq');
        const codingQuestions = questions.filter(q => q.type === 'coding');
        const videoQuestions = questions.filter(q => q.type === 'video' || q.type === 'subjective');
        
        console.log('MCQ questions:', mcqQuestions.length);
        console.log('Coding questions:', codingQuestions.length);
        console.log('Video questions:', videoQuestions.length);
        
        if (mcqQuestions.length > 0) {
          const initialQuestions = mcqQuestions.map((q, index) => ({
            id: index + 1,
            backendId: q.id,
            attempted: false,
            current: index === 0
          }));
          setQuestions(initialQuestions);
          setTotalQuestions(mcqQuestions.length);
          setCurrentQuestion(1);
        } else {
          console.warn('No MCQ questions found in assessment');
          setQuestions([]);
          setTotalQuestions(0);
        }

        // Initialize coding problems from backend
        if (codingQuestions.length > 0) {
          const initialCodingProblems = codingQuestions.map((q, index) => {
            const existingResponse = data.existing_responses?.find(r => r.question_id === q.id);
            const savedCode = existingResponse?.answer?.code || '';
            const savedLanguage = existingResponse?.answer?.language || 'python';
            
            return {
              id: q.id,
              backendId: q.id,
              title: q.content?.title || `Problem ${index + 1}`,
              description: q.content?.problem_statement || q.content?.description || q.content?.question || '',
              code: savedCode || getLanguageTemplate(savedLanguage),
              customInput: '',
              selectedLanguage: savedLanguage,
              testResults: [],
              executionResult: null,
              testCases: q.content?.test_cases || [],
              order: q.order || index,
              difficulty: q.difficulty
            };
          });
          setCodingProblems(initialCodingProblems);
          setTotalCodingProblems(codingQuestions.length);
        }

        // Initialize video questions from backend
        if (videoQuestions.length > 0) {
          setVideoQuestions(videoQuestions.map((q, index) => ({
            id: q.id,
            backendId: q.id,
            question: q.content?.question || q.content?.description || '',
            order: q.order || index + 1
          })));
          setTotalVideoQuestions(videoQuestions.length);
          setCurrentVideoQuestion(1);
        }

        // If resuming, load existing responses
        if (canResume && data.existing_responses) {
          console.log('Resuming attempt with existing responses:', data.existing_responses);
          // Populate answers from existing_responses
          const savedAnswers = {};
          data.existing_responses.forEach((response) => {
            // Find question index by backend ID (questions array has raw backend data with 'id' property)
            const questionIndex = questions.findIndex(q => q.id === response.question_id);
            if (questionIndex !== -1) {
              const question = questions[questionIndex];
              if (question.type === 'mcq') {
                // Map to frontend question number (1-indexed)
                const frontendQuestionNum = mcqQuestions.findIndex(q => q.id === question.id) + 1;
                if (frontendQuestionNum > 0) {
                  savedAnswers[frontendQuestionNum] = response.answer?.selected_option || '';
                }
              }
            }
          });

          // Update localStorage with saved answers
          if (Object.keys(savedAnswers).length > 0) {
            console.log('Loaded saved MCQ answers:', savedAnswers);
            localStorage.setItem('assessment_mcq_answers', JSON.stringify(savedAnswers));
          }

          // Update question states to mark attempted questions
          setQuestions(prev => prev.map((q, index) => ({
            ...q,
            attempted: savedAnswers[index + 1] !== undefined && savedAnswers[index + 1] !== ''
          })));
        }

        // Load existing violations from localStorage
        const savedViolations = JSON.parse(localStorage.getItem('assessment_violations') || '[]');
        if (savedViolations.length > 0) {
          console.log('Loaded saved violations:', savedViolations.length);
          violationsRef.current = savedViolations;
          setViolationCount(savedViolations.length);
        }
      } catch (err) {
        console.error('Error loading attempt data:', err);
        // Show error to user
        alert('Error loading assessment data. Please try starting the assessment again.');
        router.push('/user/assessment-start');
      }
    } else {
      console.error('No attempt data found in localStorage');
      console.error('This should not happen - system check should have set attempt_data and attempt_id');
      // Redirect to start with token if no attempt data
      const assessmentToken = localStorage.getItem('assessment_token');
      if (assessmentToken) {
        router.push(`/user/assessment-start?token=${assessmentToken}`);
      } else {
        router.push('/user/assessment-start');
      }
    }
  }, [router]);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [stream, setStream] = useState(null);
  
  // Proctoring state
  const [proctoringAlert, setProctoringAlert] = useState({ isOpen: false, violation: null });
  const [violationCount, setViolationCount] = useState(0);
  const violationsRef = useRef([]);
  const alertCooldownRef = useRef(false);
  const lastTabSwitchRef = useRef(null);
  const devToolsOpenRef = useRef(false);
  const mediaPipeProctoringRef = useRef(null);
  
  // Coding section state - support multiple problems
  const [currentCodingProblem, setCurrentCodingProblem] = useState(0);
  const [totalCodingProblems, setTotalCodingProblems] = useState(0);
  const [codingProblems, setCodingProblems] = useState([]);
  

  // Current problem state (derived from codingProblems array)
  const currentProblem = codingProblems[currentCodingProblem] || codingProblems[0];
  const code = currentProblem?.code || '';
  const customInput = currentProblem?.customInput || '';
  const selectedLanguage = currentProblem?.selectedLanguage || 'python';
  const testResults = currentProblem?.testResults || [];
  const executionResult = currentProblem?.executionResult || null;
  
  // Autosave state
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveIntervalRef = useRef(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const floatingCameraRef = useRef(null);
  
  // Sandbox execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  // Get test cases from current problem
  const problemTestCases = currentProblem?.testCases?.filter(tc => tc.is_public !== false).slice(0, 3) || [];
  const hiddenTestCases = currentProblem?.testCases?.filter(tc => tc.is_public === false) || [];
  
  const languages = [
    { value: 'python', label: 'Python 3.10', template: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        complement = target - n
        if complement in seen:
            return [seen[complement], i]
        seen[n] = i
    return []

if __name__ == "__main__":
    import sys
    n = int(sys.stdin.readline().strip())
    nums = list(map(int, sys.stdin.readline().strip().split()))
    target = int(sys.stdin.readline().strip())
    result = two_sum(nums, target)
    print(f"{result[0]} {result[1]}")
` },
    { value: 'javascript', label: 'JavaScript (Node.js)', template: `function twoSum(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) {
            return [seen[complement], i];
        }
        seen[nums[i]] = i;
    }
    return [];
}

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = [];
rl.on('line', (line) => {
    input.push(line);
});

rl.on('close', () => {
    const n = parseInt(input[0]);
    const nums = input[1].split(' ').map(Number);
    const target = parseInt(input[2]);
    const result = twoSum(nums, target);
    console.log(\`\${result[0]} \${result[1]}\`);
});
` },
    { value: 'java', label: 'Java', template: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[]{seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[]{};
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();
        int[] result = twoSum(nums, target);
        System.out.println(result[0] + " " + result[1]);
    }
}
` },
    { value: 'cpp', label: 'C++', template: `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }
    int target;
    cin >> target;
    vector<int> result = twoSum(nums, target);
    cout << result[0] << " " << result[1] << endl;
    return 0;
}
` },
    { value: 'c', label: 'C', template: `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}

int main() {
    int n;
    scanf("%d", &n);
    int* nums = (int*)malloc(n * sizeof(int));
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }
    int target;
    scanf("%d", &target);
    int returnSize;
    int* result = twoSum(nums, n, target, &returnSize);
    printf("%d %d\\n", result[0], result[1]);
    free(nums);
    free(result);
    return 0;
}
` },
    { value: 'go', label: 'Go', template: `package main

import (
    "fmt"
)

func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if idx, exists := seen[complement]; exists {
            return []int{idx, i}
        }
        seen[num] = i
    }
    return []int{}
}

func main() {
    var n int
    fmt.Scan(&n)
    nums := make([]int, n)
    for i := 0; i < n; i++ {
        fmt.Scan(&nums[i])
    }
    var target int
    fmt.Scan(&target)
    result := twoSum(nums, target)
    fmt.Printf("%d %d\\n", result[0], result[1])
}
` },
  ];
  
  // Video section state
  const [currentVideoQuestion, setCurrentVideoQuestion] = useState(1);
  const [totalVideoQuestions, setTotalVideoQuestions] = useState(0);
  const [videoQuestions, setVideoQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const videoRecorderRef = useRef(null);
  const videoPreviewRef = useRef(null);

  // Proctoring: Handle violation alerts (use useCallback to stabilize reference)
  const handleViolationRef = useRef(null);
  
  useEffect(() => {
    handleViolationRef.current = (type, details = {}) => {
      // Prevent spam with cooldown
      if (alertCooldownRef.current) return;

      const violation = {
        type,
        timestamp: Date.now(),
        ...details
      };

      violationsRef.current.push(violation);
      setViolationCount(prev => prev + 1);
      setProctoringAlert({ isOpen: true, violation });

      // Save violation to localStorage for reporting
      const savedViolations = JSON.parse(localStorage.getItem('assessment_violations') || '[]');
      savedViolations.push(violation);
      localStorage.setItem('assessment_violations', JSON.stringify(savedViolations));

      // Report to backend
      const severity = ['multiple_persons', 'tab_switch', 'devtools'].includes(type) ? 'high' : 'medium';
      reportViolationToBackend(type, severity, details);

      // Set cooldown to prevent spam (3 seconds)
      alertCooldownRef.current = true;
      setTimeout(() => {
        alertCooldownRef.current = false;
      }, 3000);
    };
  }, [attemptId]);

  const handleViolation = (type, details = {}) => {
    if (handleViolationRef.current) {
      handleViolationRef.current(type, details);
    }
  };

  const closeProctoringAlert = () => {
    setProctoringAlert({ isOpen: false, violation: null });
  };

  // Proctoring: Copy/Paste/Cut detection
  useEffect(() => {
    const handleCopy = (e) => {
      // Allow copying within Monaco editor for normal editor operations
      const target = e.target;
      const isMonacoEditor = target.closest('.monaco-editor') || target.closest('[class*="monaco"]');
      
      if (!isMonacoEditor) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '');
        }
        if (handleViolationRef.current) {
          handleViolationRef.current('copy', { key: 'copy', clipboardData: true });
        }
      }
    };

    const handlePaste = (e) => {
      // Always block paste - even in editor
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
      if (handleViolationRef.current) {
        handleViolationRef.current('paste', { key: 'paste', clipboardData: true });
      }
    };

    const handleCut = (e) => {
      // Allow cutting within Monaco editor for normal editor operations
      const target = e.target;
      const isMonacoEditor = target.closest('.monaco-editor') || target.closest('[class*="monaco"]');
      
      if (!isMonacoEditor) {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '');
        }
        if (handleViolationRef.current) {
          handleViolationRef.current('cut', { key: 'cut', clipboardData: true });
        }
      }
    };

    const handleKeyDown = (e) => {
      // Detect Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const target = e.target;
        const isMonacoEditor = target.closest('.monaco-editor') || target.closest('[class*="monaco"]');
        if (!isMonacoEditor) {
          e.preventDefault();
          if (handleViolationRef.current) {
            handleViolationRef.current('copy', { key: 'Ctrl+C' });
          }
        }
      }
      // Detect Ctrl+V / Cmd+V (always block)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (handleViolationRef.current) {
          handleViolationRef.current('paste', { key: 'Ctrl+V' });
        }
      }
      // Detect Ctrl+X / Cmd+X
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        const target = e.target;
        const isMonacoEditor = target.closest('.monaco-editor') || target.closest('[class*="monaco"]');
        if (!isMonacoEditor) {
          e.preventDefault();
          if (handleViolationRef.current) {
            handleViolationRef.current('cut', { key: 'Ctrl+X' });
          }
        }
      }
      // Detect Print Screen (Windows) / Cmd+Shift+3/4 (Mac)
      if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))) {
        e.preventDefault();
        if (handleViolationRef.current) {
          handleViolationRef.current('print_screen', { key: e.key });
        }
      }
      // Detect DevTools shortcuts
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        ((e.ctrlKey || e.metaKey) && e.key === 'U')
      ) {
        e.preventDefault();
        if (handleViolationRef.current) {
          handleViolationRef.current('devtools', { key: e.key });
        }
      }
    };

    // Right-click context menu detection
    const handleContextMenu = (e) => {
      // Allow context menu in Monaco editor for editor functionality
      const target = e.target;
      const isMonacoEditor = target.closest('.monaco-editor') || target.closest('[class*="monaco"]');
      
      if (!isMonacoEditor) {
        e.preventDefault();
        if (handleViolationRef.current) {
          handleViolationRef.current('context_menu', { x: e.clientX, y: e.clientY });
        }
        return false;
      }
    };

    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Proctoring: Tab/Window switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab/window switched or minimized
        lastTabSwitchRef.current = Date.now();
        if (handleViolationRef.current) {
          handleViolationRef.current('tab_switch', { 
            type: 'visibility_hidden',
            duration: null 
          });
        }
      } else {
        // Tab/window focused again
        if (lastTabSwitchRef.current) {
          const duration = Date.now() - lastTabSwitchRef.current;
          // Only alert if it was away for more than 1 second
          if (duration > 1000 && handleViolationRef.current) {
            handleViolationRef.current('tab_switch', { 
              type: 'visibility_visible',
              duration: Math.round(duration / 1000) 
            });
          }
          lastTabSwitchRef.current = null;
        }
      }
    };

    const handleBlur = () => {
      // Window lost focus
      lastTabSwitchRef.current = Date.now();
    };

    const handleFocus = () => {
      // Window regained focus
      if (lastTabSwitchRef.current) {
        const duration = Date.now() - lastTabSwitchRef.current;
        if (duration > 1000 && handleViolationRef.current) {
          handleViolationRef.current('tab_switch', { 
            type: 'window_focus',
            duration: Math.round(duration / 1000) 
          });
        }
        lastTabSwitchRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Proctoring: DevTools detection (advanced)
  useEffect(() => {
    let devToolsCheckInterval;
    
    const detectDevTools = () => {
      // Method 1: Check window dimensions
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      // Method 2: Check console (less reliable, can cause performance issues)
      let consoleTime = 0;
      try {
        const startTime = performance.now();
        // This is a minimal console check
        const endTime = performance.now();
        consoleTime = endTime - startTime;
      } catch (e) {
        // Ignore
      }

      if ((widthThreshold || heightThreshold) && !devToolsOpenRef.current) {
        devToolsOpenRef.current = true;
        if (handleViolationRef.current) {
          handleViolationRef.current('devtools', { method: 'dimension_detection', detected: true });
        }
      } else if (!widthThreshold && !heightThreshold && devToolsOpenRef.current) {
        devToolsOpenRef.current = false;
      }
    };

    // Check periodically (every 2 seconds to reduce performance impact)
    devToolsCheckInterval = setInterval(detectDevTools, 2000);

    return () => {
      if (devToolsCheckInterval) clearInterval(devToolsCheckInterval);
    };
  }, []);

  useEffect(() => {
    // Save start time
    if (!localStorage.getItem('assessment_start_time')) {
      localStorage.setItem('assessment_start_time', Date.now().toString());
    }
    
    // Start camera for proctoring
    startProctoring();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        
        if (newTime <= 0) {
          clearInterval(timer);
          // Time's up - save all current state and submit entire assessment
          if (currentSection === 'mcq') {
            // Save MCQ answers
            if (selectedAnswer) {
              const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
              mcqAnswers[currentQuestion.toString()] = selectedAnswer;
              localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
            }
          } else if (currentSection === 'coding') {
            saveCodingState();
          } else if (currentSection === 'video') {
            // Save video answer if recording
            const videoAnswers = JSON.parse(localStorage.getItem('assessment_video_answers') || '[]');
            if (!videoAnswers.includes(currentVideoQuestion)) {
              videoAnswers.push(currentVideoQuestion);
              localStorage.setItem('assessment_video_answers', JSON.stringify(videoAnswers));
            }
          }
          // Clear flow completion flag and navigate to end
          localStorage.removeItem('assessment_flow_completed');
          router.push('/user/assessment-end');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // REMOVED: Auto-save interval (causes conflicts with debounced saves)
    // Coding section uses debounced saves on code change (2s delay)
    // + heartbeat sync every 30s as backup
    // This is the industry best practice approach

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      // Stop MediaPipe proctoring
      if (mediaPipeProctoringRef.current) {
        try {
          mediaPipeProctoringRef.current.stop();
        } catch (e) {
          console.warn('Error stopping MediaPipe:', e);
        }
        mediaPipeProctoringRef.current = null;
      }
      
      // Remove hidden video element if it exists
      if (hiddenProctoringVideoRef.current) {
        hiddenProctoringVideoRef.current.remove();
        hiddenProctoringVideoRef.current = null;
      }
    };
  }, []);

  // Autosave function
  const saveCodingState = async () => {
    const stateToSave = {
      codingProblems,
      currentCodingProblem,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('assessment_coding_state', JSON.stringify(stateToSave));
    setLastSaved(new Date());

    // Save current coding problem to backend
    if (attemptId && currentProblem && currentProblem.backendId) {
      await saveToBackend(currentProblem.backendId, {
        code: currentProblem.code,
        language: currentProblem.selectedLanguage,
        custom_input: currentProblem.customInput
      });
    }
  };

  // Load saved state on mount
  useEffect(() => {
    if (currentSection === 'coding') {
      const saved = localStorage.getItem('assessment_coding_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.codingProblems) {
            setCodingProblems(parsed.codingProblems);
            setCurrentCodingProblem(parsed.currentCodingProblem || 0);
            setLastSaved(new Date(parsed.timestamp));
          }
        } catch (e) {
          console.error('Error loading saved state:', e);
        }
      }
    }
    
    // Load saved MCQ answers when question changes
    if (currentSection === 'mcq') {
      const savedAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
      const answerKey = currentQuestion.toString();
      if (savedAnswers[answerKey] || savedAnswers[currentQuestion]) {
        const savedAnswer = savedAnswers[answerKey] || savedAnswers[currentQuestion];
        setSelectedAnswer(savedAnswer);
        // Mark question as attempted
        setQuestions(prev => prev.map(q => 
          q.id === currentQuestion ? { ...q, attempted: true } : q
        ));
      } else {
        setSelectedAnswer('');
      }
    }

    // Load saved coding state when switching to coding section
    if (currentSection === 'coding' && codingProblems.length > 0) {
      const saved = localStorage.getItem('assessment_coding_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.codingProblems) {
            setCodingProblems(parsed.codingProblems);
            setCurrentCodingProblem(parsed.currentCodingProblem || 0);
            setLastSaved(new Date(parsed.timestamp));
          }
        } catch (e) {
          console.error('Error loading saved coding state:', e);
        }
      }
    }
  }, [currentSection, currentQuestion]);

  // Update video element when stream changes or section changes
  useEffect(() => {
    if (stream && videoRef.current) {
      // Always set the stream when section changes or stream changes
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream, currentSection]);

  // Update video preview element when switching to video section
  useEffect(() => {
    if (currentSection === 'video' && stream && videoPreviewRef.current) {
      // Set the stream to video preview when in video section
      // Only set if not recording (recording uses its own stream)
      if (!isRecording && !recordedBlob) {
        if (videoPreviewRef.current.srcObject !== stream) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.play().catch(err => {
            console.error('Error playing video preview:', err);
          });
        }
      }
    }
  }, [stream, currentSection, isRecording, recordedBlob]);

  const startProctoring = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setStream(mediaStream);
      
      // Set video stream to visible video element (if exists)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Determine which video element to use for MediaPipe
      // Use visible video if available, otherwise use hidden video
      let proctoringVideoElement = videoRef.current;
      
      // Always ensure hidden video exists for MediaPipe (works in all sections)
      if (!hiddenProctoringVideoRef.current) {
        const hiddenVideo = document.createElement('video');
        hiddenVideo.id = 'proctoring-video-hidden';
        hiddenVideo.style.position = 'absolute';
        hiddenVideo.style.width = '1px';
        hiddenVideo.style.height = '1px';
        hiddenVideo.style.opacity = '0';
        hiddenVideo.style.pointerEvents = 'none';
        hiddenVideo.style.zIndex = '-1';
        hiddenVideo.autoplay = true;
        hiddenVideo.playsInline = true;
        hiddenVideo.muted = true;
        document.body.appendChild(hiddenVideo);
        hiddenProctoringVideoRef.current = hiddenVideo;
      }
      
      // Set stream to hidden video for MediaPipe (always active)
      hiddenProctoringVideoRef.current.srcObject = mediaStream;
      proctoringVideoElement = hiddenProctoringVideoRef.current;
      
      // Initialize MediaPipe proctoring (optional, graceful failure)
      // TEMPORARILY DISABLED: MediaPipe has WASM loading errors with Next.js
      // Basic proctoring (tab switching, copy/paste, etc.) still works without it
      const ENABLE_MEDIAPIPE = false; // Set to true when MediaPipe is fixed

      if (ENABLE_MEDIAPIPE && proctoringVideoElement && !mediaPipeProctoringRef.current) {
        try {
          // Dynamically import MediaPipe to avoid blocking if it fails
          const { MediaPipeProctoring } = await import('../../lib/mediapipeProctoring');

          mediaPipeProctoringRef.current = new MediaPipeProctoring(
            proctoringVideoElement,
            (violation) => {
              // Handle MediaPipe violations - violation is an object with type and details
              // MediaPipe passes: { type, details: { timestamp, ... }, violationCount }
              const violationType = violation.type || 'unknown';
              const violationDetails = violation.details || {};

              // Map MediaPipe violation types to backend types
              const backendViolationType = violationType === 'multiple_persons' ? 'multiple_faces' :
                                          violationType === 'face_not_detected' ? 'face_not_detected' :
                                          violationType === 'looking_away' ? 'eye_tracking_away' :
                                          violationType === 'suspicious_hand_position' ? 'suspicious_hand_position' :
                                          violationType;

              handleViolation(backendViolationType, violationDetails);
            }
          );

          // Start MediaPipe detection once video is ready
          const startMediaPipe = async () => {
            if (proctoringVideoElement && proctoringVideoElement.readyState >= 2 && mediaPipeProctoringRef.current) {
              try {
                await mediaPipeProctoringRef.current.start();
                console.log('MediaPipe proctoring started successfully');
              } catch (error) {
                console.error('Error starting MediaPipe:', error);
                // Gracefully handle MediaPipe failure - continue without it
                mediaPipeProctoringRef.current = null;
              }
            } else if (proctoringVideoElement) {
              // Retry after a short delay
              setTimeout(startMediaPipe, 100);
            }
          };

          proctoringVideoElement.addEventListener('loadedmetadata', startMediaPipe);
          proctoringVideoElement.addEventListener('canplay', startMediaPipe);
          startMediaPipe(); // Also try immediately
        } catch (error) {
          console.warn('MediaPipe proctoring not available:', error);
          // Continue without MediaPipe - basic proctoring still works
        }
      } else if (!ENABLE_MEDIAPIPE) {
        console.log('MediaPipe proctoring disabled. Using basic proctoring only (tab switching, copy/paste, etc.)');
      }
    } catch (error) {
      console.error('Proctoring camera error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevious = async () => {
    if (currentQuestion > 1) {
      // Save current answer before moving (AWAIT to prevent data loss)
      if (selectedAnswer) {
        const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
        mcqAnswers[currentQuestion.toString()] = selectedAnswer;
        localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));

        // Save to backend - AWAIT to ensure save completes before navigation
        const currentQuestionObj = questions.find(q => q.id === currentQuestion);
        if (currentQuestionObj && currentQuestionObj.backendId) {
          await saveToBackend(currentQuestionObj.backendId, { selected_option: selectedAnswer });
        }
      }

      setCurrentQuestion(currentQuestion - 1);
      // Update question state
      setQuestions(prev => prev.map(q => ({
        ...q,
        current: q.id === currentQuestion - 1
      })));
    }
  };

  // Backend helper functions
  const saveToBackend = async (questionId, answer) => {
    if (!attemptId) {
      console.warn('No attempt ID available for saving');
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');

      await saveResponse(attemptId, {
        question_id: questionId,
        answer: answer
      });

      setLastAutoSave(new Date());
      setSaveStatus('saved');
      console.log('✅ Saved response to backend:', questionId);

      // Remove from failed queue if it was there
      const failedQueue = JSON.parse(localStorage.getItem('assessment_failed_saves') || '[]');
      const filtered = failedQueue.filter(item => item.question_id !== questionId);
      localStorage.setItem('assessment_failed_saves', JSON.stringify(filtered));
      setFailedSaveCount(filtered.length);

      // Reset to idle after showing "saved" for 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);

    } catch (err) {
      console.error('❌ Error saving to backend:', err);
      setSaveStatus('error');

      // INDUSTRY BEST PRACTICE: Add to failed saves queue for retry
      const failedQueue = JSON.parse(localStorage.getItem('assessment_failed_saves') || '[]');
      const failedSave = {
        question_id: questionId,
        answer: answer,
        timestamp: Date.now(),
        attempt_count: 1
      };

      // Check if already in queue
      const existing = failedQueue.find(item => item.question_id === questionId);
      if (existing) {
        existing.answer = answer;  // Update with latest answer
        existing.attempt_count += 1;
        existing.timestamp = Date.now();
      } else {
        failedQueue.push(failedSave);
      }

      localStorage.setItem('assessment_failed_saves', JSON.stringify(failedQueue));
      setFailedSaveCount(failedQueue.length);
      console.log('📝 Added to retry queue. Will retry on next heartbeat.');

      // Reset error status after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);

      // Note: User already has localStorage backup, so no data is lost
    } finally {
      setIsSaving(false);
    }
  };

  const sendHeartbeatToBackend = async () => {
    if (!attemptId) return;

    try {
      const response = await sendHeartbeat(attemptId);

      // Sync time with backend to prevent drift (INDUSTRY BEST PRACTICE)
      if (response.time_remaining_seconds !== undefined) {
        console.log('Syncing time from backend:', response.time_remaining_seconds);
        setTimeLeft(response.time_remaining_seconds);
      }

      // Reconcile violation count with backend (INDUSTRY BEST PRACTICE)
      // Backend is source of truth - local count may drift due to network failures
      if (response.total_violations !== undefined) {
        const localCount = violationCount;
        const serverCount = response.total_violations;

        if (serverCount !== localCount) {
          console.log(`Reconciling violations: local=${localCount}, server=${serverCount}`);
          setViolationCount(serverCount);

          // Optionally: Retry failed violations from localStorage queue
          // This handles cases where reportViolation() failed due to network issues
          const savedViolations = JSON.parse(localStorage.getItem('assessment_violations') || '[]');
          if (savedViolations.length > serverCount) {
            console.log('Found unsent violations in queue, retrying...');
            // Backend will de-duplicate based on timestamp
            const unsentViolations = savedViolations.slice(serverCount);
            for (const violation of unsentViolations) {
              const severity = ['multiple_persons', 'tab_switch', 'devtools'].includes(violation.type) ? 'high' : 'medium';
              try {
                await reportViolation(attemptId, {
                  type: violation.type,
                  severity: severity,
                  metadata: violation
                });
              } catch (err) {
                // Will retry on next heartbeat
                console.error('Failed to retry violation:', err);
                break;
              }
            }
          }
        }
      }

      // INDUSTRY BEST PRACTICE: Periodic save during heartbeat
      // Ensures coding answers are saved even if debounced save missed
      if (currentSection === 'coding') {
        console.log('Heartbeat: Syncing coding state to backend');
        await saveCodingState();
      }

      // INDUSTRY BEST PRACTICE: Retry failed answer saves
      const failedQueue = JSON.parse(localStorage.getItem('assessment_failed_saves') || '[]');
      if (failedQueue.length > 0) {
        console.log(`📝 Retrying ${failedQueue.length} failed saves...`);
        const remainingFailed = [];

        for (const failedSave of failedQueue) {
          try {
            await saveResponse(attemptId, {
              question_id: failedSave.question_id,
              answer: failedSave.answer
            });
            console.log(`✅ Successfully retried save for question ${failedSave.question_id}`);
          } catch (err) {
            // Keep in queue for next retry
            console.log(`❌ Retry failed for question ${failedSave.question_id}, will retry again`);
            remainingFailed.push(failedSave);
          }
        }

        // Update queue with remaining failed saves
        localStorage.setItem('assessment_failed_saves', JSON.stringify(remainingFailed));
        setFailedSaveCount(remainingFailed.length);
      }

      if (response.status === 'invalidated' || response.status === 'inactive') {
        // Attempt was invalidated or expired
        alert('Your assessment session has ended. ' + (response.reason || 'Time expired'));
        handleSubmitSection(); // Force submit
      }
    } catch (err) {
      console.error('Heartbeat error:', err);
    }
  };

  const reportViolationToBackend = async (violationType, severity = 'medium', metadata = {}) => {
    if (!attemptId) return;

    try {
      await reportViolation(attemptId, {
        type: violationType,
        severity: severity,
        metadata: metadata
      });
      console.log('Reported violation to backend:', violationType);
    } catch (err) {
      console.error('Error reporting violation:', err);
    }
  };

  // Setup heartbeat timer
  useEffect(() => {
    if (attemptId) {
      // Send heartbeat every 30 seconds
      heartbeatTimerRef.current = setInterval(() => {
        sendHeartbeatToBackend();
      }, 30000);

      // Send initial heartbeat
      sendHeartbeatToBackend();

      return () => {
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
        }
      };
    }
  }, [attemptId]);

  const handleNext = async () => {
    if (currentQuestion < totalQuestions) {
      // Save current answer before moving (AWAIT to prevent data loss)
      if (selectedAnswer) {
        const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
        mcqAnswers[currentQuestion.toString()] = selectedAnswer;
        localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));

        // Save to backend - AWAIT to ensure save completes before navigation
        const currentQuestionObj = questions.find(q => q.id === currentQuestion);
        if (currentQuestionObj && currentQuestionObj.backendId) {
          await saveToBackend(currentQuestionObj.backendId, { selected_option: selectedAnswer });
        }
      }

      setCurrentQuestion(currentQuestion + 1);
      // Update question state
      setQuestions(prev => prev.map(q => ({
        ...q,
        current: q.id === currentQuestion + 1,
        attempted: q.id === currentQuestion ? selectedAnswer !== '' : q.attempted
      })));
    }
  };

  const handleClearResponse = () => {
    setSelectedAnswer('');
    // Update question state
    setQuestions(prev => prev.map(q => 
      q.id === currentQuestion ? { ...q, attempted: false } : q
    ));
    // Remove from saved answers
    const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
    delete mcqAnswers[currentQuestion.toString()];
    delete mcqAnswers[currentQuestion];
    localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
  };

  const handleSubmitSection = async () => {
    // INDUSTRY BEST PRACTICE: Clear failed save queue before section transition
    // This ensures all answers are synced before moving forward
    const failedQueue = JSON.parse(localStorage.getItem('assessment_failed_saves') || '[]');
    if (failedQueue.length > 0) {
      console.log(`⏳ Syncing ${failedQueue.length} pending saves before submission...`);
      setSaveStatus('saving');

      for (const failedSave of failedQueue) {
        try {
          await saveResponse(attemptId, {
            question_id: failedSave.question_id,
            answer: failedSave.answer
          });
          console.log(`✅ Synced question ${failedSave.question_id}`);
        } catch (err) {
          console.error(`❌ Failed to sync question ${failedSave.question_id}:`, err);
          // Continue trying other saves
        }
      }

      // Clear queue after attempting all syncs
      localStorage.setItem('assessment_failed_saves', JSON.stringify([]));
      setFailedSaveCount(0);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1000);
    }

    // Save final state before submission
    if (currentSection === 'mcq') {
      // Save all MCQ answers before moving to next section
      if (selectedAnswer) {
        const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
        mcqAnswers[currentQuestion.toString()] = selectedAnswer;
        localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));

        // Save to backend
        const currentQuestionObj = questions.find(q => q.id === currentQuestion);
        if (currentQuestionObj && currentQuestionObj.backendId) {
          await saveToBackend(currentQuestionObj.backendId, { selected_option: selectedAnswer });
        }
      }
      // Navigate to coding section
      setCurrentSection('coding');
    } else if (currentSection === 'coding') {
      // Save coding state
      await saveCodingState();
      // Navigate to video section
      setCurrentSection('video');
    } else if (currentSection === 'video') {
      // Final submission - submit to backend
      if (attemptId) {
        try {
          const response = await submitAttempt(attemptId);
          console.log('Attempt submitted successfully:', response);
        } catch (err) {
          console.error('Error submitting attempt:', err);
          alert('Error submitting assessment. Please try again.');
          return;
        }
      }

      // Clear flow completion flag
      localStorage.removeItem('assessment_flow_completed');
      localStorage.removeItem('attempt_data');
      localStorage.removeItem('attempt_id');
      localStorage.removeItem('can_resume');
      localStorage.removeItem('assessment_failed_saves');

      router.push('/user/assessment-end');
    }
  };

  const handleSaveAndExit = () => {
    // Save current state before navigating to summary
    if (currentSection === 'coding') {
      saveCodingState();
    }
    
    // Save current MCQ answer if selected
    if (currentSection === 'mcq' && selectedAnswer) {
      const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
      mcqAnswers[currentQuestion.toString()] = selectedAnswer;
      localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
    }
    
    // Navigate to summary page
    router.push('/user/assessment-summary');
  };

  // Coding section handlers
  const handleRunTestCases = async () => {
    setIsExecuting(true);
    setShowOutput(true);
    
    const currentCode = codingProblems[currentCodingProblem].code;
    const currentLang = codingProblems[currentCodingProblem].selectedLanguage;
    
    try {
      // Validate code first
      const validation = validateCode(currentLang, currentCode);
      if (!validation.valid) {
        const updatedProblems = [...codingProblems];
        updatedProblems[currentCodingProblem] = {
          ...updatedProblems[currentCodingProblem],
          executionResult: {
            success: false,
            output: '',
            error: validation.error,
            executionTime: 0,
          },
          testResults: [],
        };
        setCodingProblems(updatedProblems);
        setIsExecuting(false);
        return;
      }
      
      // Run visible sample test cases
      const results = await runTestCases(currentLang, currentCode, problemTestCases);
      
      // Calculate summary
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        testResults: results,
        executionResult: {
          success: true,
          output: `Sample Test Results: ${passed}/${total} passed`,
          error: null,
          executionTime: 0,
          testSummary: { passed, total },
        },
      };
      setCodingProblems(updatedProblems);
      saveCodingState();
    } catch (error) {
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        executionResult: {
          success: false,
          output: '',
          error: error.toString(),
          executionTime: 0,
        },
      };
      setCodingProblems(updatedProblems);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    const lang = languages.find(l => l.value === selectedLanguage);
    const resetCode = lang ? lang.template : '';
    
    // Update current problem's code
    const updatedProblems = [...codingProblems];
    updatedProblems[currentCodingProblem] = {
      ...updatedProblems[currentCodingProblem],
      code: resetCode,
      executionResult: null,
      testResults: [],
    };
    setCodingProblems(updatedProblems);
    setShowOutput(false);
    saveCodingState();
  };

  const handleLanguageChange = (langValue) => {
    const lang = languages.find(l => l.value === langValue);
    const updatedProblems = [...codingProblems];
    updatedProblems[currentCodingProblem] = {
      ...updatedProblems[currentCodingProblem],
      selectedLanguage: langValue,
      code: lang ? lang.template : updatedProblems[currentCodingProblem].code,
      executionResult: null,
      testResults: [],
    };
    setCodingProblems(updatedProblems);
    setShowOutput(false);
    saveCodingState();
  };

  const codeChangeTimeoutRef = useRef(null);
  
  const handleCodeChange = (newCode) => {
    const updatedProblems = [...codingProblems];
    updatedProblems[currentCodingProblem] = {
      ...updatedProblems[currentCodingProblem],
      code: newCode,
    };
    setCodingProblems(updatedProblems);
    // Debounced autosave
    if (codeChangeTimeoutRef.current) {
      clearTimeout(codeChangeTimeoutRef.current);
    }
    codeChangeTimeoutRef.current = setTimeout(() => saveCodingState(), 2000);
  };

  const handleCustomInputChange = (newInput) => {
    const updatedProblems = [...codingProblems];
    updatedProblems[currentCodingProblem] = {
      ...updatedProblems[currentCodingProblem],
      customInput: newInput,
    };
    setCodingProblems(updatedProblems);
  };

  const handleProblemChange = (index) => {
    setCurrentCodingProblem(index);
    setShowOutput(false);
  };
  
  // Draggable camera handlers
  const handleMouseDown = (e) => {
    if (floatingCameraRef.current) {
      e.preventDefault();
      const rect = floatingCameraRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setCameraPosition({
          x: Math.max(0, Math.min(newX, window.innerWidth - 200)),
          y: Math.max(0, Math.min(newY, window.innerHeight - 200))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Helper function to poll for code execution result
  const pollCodeResult = async (jobId, maxRetries = 30) => {
    for (let i = 0; i < maxRetries; i++) {
      const response = await getCodeResult(attemptId, jobId);

      if (response.status === 'completed') {
        return {
          success: response.success,
          output: response.output || '',
          error: response.error || '',
          executionTime: response.execution_time || 0
        };
      }

      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Code execution timeout');
  };

  const handleRunCustomInput = async () => {
    if (!customInput.trim()) {
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        executionResult: {
          success: false,
          output: '',
          error: 'Please provide custom input',
          executionTime: 0,
        },
      };
      setCodingProblems(updatedProblems);
      setShowOutput(true);
      return;
    }
    
    setIsExecuting(true);
    setShowOutput(true);
    
    try {
      const validation = validateCode(selectedLanguage, code);
      if (!validation.valid) {
        const updatedProblems = [...codingProblems];
        updatedProblems[currentCodingProblem] = {
          ...updatedProblems[currentCodingProblem],
          executionResult: {
            success: false,
            output: '',
            error: validation.error,
            executionTime: 0,
          },
          testResults: [],
        };
        setCodingProblems(updatedProblems);
        setIsExecuting(false);
        return;
      }

      // MOCKED: Replace with real backend API when you have Judge0 keys
      const MOCK_CODE_EXECUTION = true; // Set to false when you have Judge0 API keys

      let result;
      if (MOCK_CODE_EXECUTION) {
        // ============ MOCKED FLOW ============
        console.log('💻 [MOCKED] Code execution (waiting for Judge0 keys)');
        console.log('Language:', selectedLanguage);
        console.log('Code length:', code.length, 'chars');
        console.log('Input:', customInput);

        // Simulate execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        result = {
          success: true,
          output: '[MOCKED OUTPUT]\nYour code will execute here when Judge0 keys are configured.\nInput received: ' + customInput,
          error: '',
          executionTime: 145
        };
        console.log('✅ [MOCKED] Execution complete');
        // ====================================
      } else {
        // ============ REAL FLOW (when you have Judge0 keys) ============
        // Get current coding question
        const currentCodingQ = codingQuestions.find(q => q.order === currentCodingProblem) || codingQuestions[currentCodingProblem - 1];

        // Step 1: Submit code to backend (backend will call Judge0)
        const executeResponse = await executeCodeAPI(
          attemptId,
          currentCodingQ.backendId,
          code,
          selectedLanguage,
          0 // test_case_index for custom input
        );

        const { job_id } = executeResponse;
        console.log('⏳ Code submitted, job ID:', job_id);

        // Step 2: Poll for result
        result = await pollCodeResult(job_id);
        console.log('✅ Execution complete:', result);
        // ============================================================
      }

      // Continue with existing logic...
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        executionResult: result,
        testResults: [],
      };
      setCodingProblems(updatedProblems);
      saveCodingState();
    } catch (error) {
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        executionResult: {
          success: false,
          output: '',
          error: error.toString(),
          executionTime: 0,
        },
        testResults: [], // Clear test results on error too
      };
      setCodingProblems(updatedProblems);
    } finally {
      setIsExecuting(false);
    }
  };

  // Submit code and run visible + hidden test cases
  const handleSubmitCoding = async () => {
    setIsExecuting(true);
    setShowOutput(true);

    const currentCode = codingProblems[currentCodingProblem].code;
    const currentLang = codingProblems[currentCodingProblem].selectedLanguage;

    try {
      // Validate code first
      const validation = validateCode(currentLang, currentCode);
      if (!validation.valid) {
        const updatedProblems = [...codingProblems];
        updatedProblems[currentCodingProblem] = {
          ...updatedProblems[currentCodingProblem],
          executionResult: {
            success: false,
            output: '',
            error: validation.error,
            executionTime: 0,
          },
          testResults: [],
        };
        setCodingProblems(updatedProblems);
        setIsExecuting(false);
        return;
      }

      const allTestCases = [...problemTestCases, ...hiddenTestCases];
      const results = await runTestCases(currentLang, currentCode, allTestCases);

      const passed = results.filter((r) => r.passed).length;
      const total = results.length;

      // Only show visible test cases in UI, keep hidden ones secret
      const visibleResults = results.slice(0, problemTestCases.length);

      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        testResults: visibleResults,
        executionResult: {
          success: passed === total,
          output:
            passed === total
              ? `All test cases passed (${passed}/${total}). Code submitted successfully.`
              : `Some test cases failed (${passed}/${total}). Please review your solution.`,
          error: null,
          executionTime: 0,
          testSummary: { passed, total },
        },
      };
      setCodingProblems(updatedProblems);
      saveCodingState();
    } catch (error) {
      const updatedProblems = [...codingProblems];
      updatedProblems[currentCodingProblem] = {
        ...updatedProblems[currentCodingProblem],
        executionResult: {
          success: false,
          output: '',
          error: error.toString(),
          executionTime: 0,
        },
      };
      setCodingProblems(updatedProblems);
    } finally {
      setIsExecuting(false);
    }
  };

  // Video section handlers
  const handleStartRecording = async () => {
    try {
      // Request video and audio permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      setVideoStream(mediaStream);
      setIsRecording(true);
      
      // Set video stream to preview element
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.play().catch(err => console.error('Error playing video:', err));
      }

      // Initialize MediaRecorder with supported MIME type
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      let recorder;
      
      if (MediaRecorder.isTypeSupported(options.mimeType)) {
        recorder = new MediaRecorder(mediaStream, options);
      } else {
        // Fallback to default
        recorder = new MediaRecorder(mediaStream);
      }
      
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setIsRecording(false);
        
        // Stop all tracks
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
      };

      videoRecorderRef.current = recorder;
      recorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Failed to start recording. Please check camera and microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    if (videoRecorderRef.current && isRecording) {
      try {
        videoRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
      }
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setIsRecording(false);
    
    // Stop current recording if active
    if (videoRecorderRef.current && isRecording) {
      try {
        videoRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
    }
    
    // Stop and cleanup video stream
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    
    // Clear video preview
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    
    videoRecorderRef.current = null;
  };

  const handleSubmitVideo = async () => {
    console.log('Submitting video answer...');

    if (!recordedBlob) {
      console.error('No video recorded');
      return;
    }

    // Get current video question from backend
    const currentVideoQ = videoQuestions.find(q => q.order === currentVideoQuestion) || videoQuestions[currentVideoQuestion - 1];

    if (!attemptId || !currentVideoQ || !currentVideoQ.backendId) {
      console.error('Missing attempt or question data');
      return;
    }

    try {
      // MOCKED: Replace with real API call when you have AWS keys
      const MOCK_MODE = true; // Set to false when you have real API keys

      if (MOCK_MODE) {
        // ============ MOCKED FLOW ============
        console.log('📹 [MOCKED] Video upload flow (waiting for AWS S3 keys)');
        console.log('Video blob size:', recordedBlob.size, 'bytes');
        console.log('Video type:', recordedBlob.type);

        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('✅ [MOCKED] Video upload successful');
        // ====================================
      } else {
        // ============ REAL FLOW (when you have AWS keys) ============

        // Step 1: Request presigned URL from backend
        const requestResponse = await fetch(
          `/api/attempts/${attemptId}/request_video_upload/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              question_id: currentVideoQ.backendId,
              filename: 'answer.webm',
              content_type: recordedBlob.type || 'video/webm',
              file_size_bytes: recordedBlob.size
            })
          }
        );

        if (!requestResponse.ok) {
          throw new Error('Failed to request upload URL');
        }

        const { upload_url, fields, s3_key } = await requestResponse.json();
        console.log('📤 Got presigned URL, uploading to S3...');

        // Step 2: Upload directly to S3 using presigned POST
        const formData = new FormData();

        // Add all fields from presigned POST (MUST come before file)
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value);
        });

        // Add file last
        formData.append('file', recordedBlob, 'answer.webm');

        const uploadResponse = await fetch(upload_url, {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error('S3 upload failed');
        }

        console.log('✅ S3 upload successful');

        // Step 3: Confirm upload with backend
        const confirmResponse = await fetch(
          `/api/attempts/${attemptId}/confirm_video_upload/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              question_id: currentVideoQ.backendId,
              s3_key: s3_key
            })
          }
        );

        if (!confirmResponse.ok) {
          throw new Error('Failed to confirm upload');
        }

        const { video_url } = await confirmResponse.json();
        console.log('✅ Upload confirmed, video URL:', video_url);

        // ============================================================
      }

      // Save video answer to localStorage
      const videoAnswers = JSON.parse(localStorage.getItem('assessment_video_answers') || '[]');
      if (!videoAnswers.includes(currentVideoQuestion)) {
        videoAnswers.push(currentVideoQuestion);
        localStorage.setItem('assessment_video_answers', JSON.stringify(videoAnswers));
      }

      // Check if this is the last video question
      if (currentVideoQuestion < totalVideoQuestions) {
        // Move to next video question
        setCurrentVideoQuestion(currentVideoQuestion + 1);
        handleRetake();
      } else {
        // All sections completed - navigate to assessment end
        localStorage.removeItem('assessment_flow_completed');
        router.push('/user/assessment-end');
      }

    } catch (err) {
      console.error('Error uploading video:', err);
      alert('Failed to upload video. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Proctoring Alert Modal */}
      <ProctoringAlert
        isOpen={proctoringAlert.isOpen}
        violation={proctoringAlert.violation}
        onClose={closeProctoringAlert}
        violationCount={violationCount}
      />
      
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center bg-black">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold">AI Assessment</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Assessment In Progress</span>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
            <FiClock className="text-orange-500" />
            <span className="text-orange-500 font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={handleSaveAndExit}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>Save & Exit</span>
            <FiSave className="text-orange-500" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Proctoring and Navigation (only visible in MCQ section) */}
        {currentSection === 'mcq' && (
          <div className="w-80 bg-black border-r border-gray-800 p-6 overflow-y-auto">
            {/* Proctoring Active */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold leading-tight">Proctoring Active</h3>
                <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                  Good
                </span>
              </div>
              
              {/* Video Feed */}
              <div className="rounded-xl overflow-hidden mb-4 bg-black relative" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-black"
                  style={{ backgroundColor: '#000' }}
                />
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm bg-black/80">
                    <div className="text-center">
                      <div className="w-12 h-12 border-2 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
                      <p>Initializing camera...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Assessment Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Total: {totalQuestions}</span>
                  <span className="text-gray-400">Attempted: {questions.filter(q => q.attempted).length}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${totalQuestions > 0 ? (questions.filter(q => q.attempted).length / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">Pending</span>
              </div>
            </div>

            {/* Question Map */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
              <h3 className="font-semibold mb-4 leading-tight">Question Map</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestion(q.id)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      q.current
                        ? 'bg-orange-500 text-white'
                        : q.attempted
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {q.id}
                  </button>
                ))}
              </div>
            </div>

            {/* System Check */}
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-500 font-semibold">
              <FiCheckCircle />
              <span>System Check: All Good</span>
            </button>
          </div>
        )}

        {/* Floating Camera for Coding Section */}
        {currentSection === 'coding' && stream && (
          <div
            ref={floatingCameraRef}
            onMouseDown={handleMouseDown}
            className={`fixed z-50 ${isDragging ? 'cursor-grabbing' : 'cursor-move'} select-none`}
            style={{
              top: `${cameraPosition.y}px`,
              right: cameraPosition.x === 0 ? '20px' : 'auto',
              left: cameraPosition.x > 0 ? `${cameraPosition.x}px` : 'auto',
              width: '200px',
            }}
          >
            <div className="bg-gray-900 border border-orange-500/30 rounded-lg p-3 shadow-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 flex items-center space-x-1">
                  <FiShield className="text-green-500" />
                  <span>Proctoring</span>
                </span>
              </div>
              <div className="rounded-lg overflow-hidden bg-black relative" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover bg-black"
                  style={{ backgroundColor: '#000' }}
                />
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs bg-black/80">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-600 border-t-orange-500 rounded-full animate-spin mx-auto mb-1"></div>
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Section Tabs */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-800">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'mcq'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('mcq')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>MCQ Section</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'coding'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('coding')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>Coding Section</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'video'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('video')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Video Section</span>
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {currentSection === 'mcq' && (
              <div className="flex-1 px-6 py-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-sm text-gray-400">MCQ — Question {currentQuestion} of {totalQuestions}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FiShield />
                        <span>Proctoring enabled</span>
                      </div>

                      {/* Save Status Indicator - Industry Best Practice */}
                      {saveStatus === 'saving' && (
                        <span className="text-orange-500 flex items-center space-x-1 animate-fade-in">
                          <FiSave className="animate-spin" />
                          <span>Saving...</span>
                        </span>
                      )}

                      {saveStatus === 'saved' && (
                        <span className="text-green-400 flex items-center space-x-1 animate-fade-in">
                          <FiCheckCircle />
                          <span>Saved</span>
                        </span>
                      )}

                      {saveStatus === 'error' && (
                        <span className="text-yellow-400 flex items-center space-x-1 animate-fade-in">
                          <FiRefreshCw className="animate-spin" />
                          <span>Retrying...</span>
                        </span>
                      )}

                      {saveStatus === 'idle' && lastAutoSave && (
                        <span className="text-gray-500 text-xs flex items-center space-x-1">
                          <FiCheckCircle className="w-3 h-3" />
                          <span>{new Date(lastAutoSave).toLocaleTimeString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {(() => {
                    if (totalQuestions === 0 || questions.length === 0) {
                      return (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                          <p className="text-gray-400">No questions available. Please check if the assessment has questions configured.</p>
                          <p className="text-gray-500 text-sm mt-2">Questions loaded: {backendQuestions.length}</p>
                        </div>
                      );
                    }
                    
                    const currentQuestionObj = questions.find(q => q.id === currentQuestion);
                    const backendQuestion = currentQuestionObj 
                      ? backendQuestions.find(q => q.id === currentQuestionObj.backendId)
                      : null;
                    
                    if (!backendQuestion) {
                      console.warn('Backend question not found for current question:', currentQuestion, 'Question obj:', currentQuestionObj);
                      return (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                          <p className="text-gray-400">Question not found. Current: {currentQuestion}, Total: {totalQuestions}</p>
                          <p className="text-gray-500 text-sm mt-2">Backend questions: {backendQuestions.length}</p>
                        </div>
                      );
                    }

                    const questionContent = backendQuestion.content || {};
                    const options = questionContent.options || [];
                    const questionText = questionContent.question || questionContent.description || '';

                    return (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-6 leading-tight">
                          {questionText}
                        </h2>

                        <div className="space-y-3">
                          {options.map((option, index) => {
                            // IMPORTANT: Use index as optionId to match backend's correct_answer field
                            // Backend stores correct_answer as index (0, 1, 2, 3)
                            const optionId = index;
                            const optionLabel = typeof option === 'string' ? option : option.label || option.text || option;

                            return (
                              <label
                                key={index}
                                className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                                  selectedAnswer === optionId
                                    ? 'bg-orange-500/20 border border-orange-500/50'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="answer"
                                  value={optionId}
                                  checked={selectedAnswer === optionId}
                                  onChange={() => {
                                    setSelectedAnswer(optionId);
                                    // Mark question as attempted
                                    setQuestions(prev => prev.map(q =>
                                      q.id === currentQuestion ? { ...q, attempted: true } : q
                                    ));
                                    // Save answer immediately
                                    const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
                                    mcqAnswers[currentQuestion.toString()] = optionId;
                                    localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));

                                    // Save to backend
                                    if (currentQuestionObj && currentQuestionObj.backendId) {
                                      saveToBackend(currentQuestionObj.backendId, { selected_option: optionId });
                                    }
                                  }}
                                  className="w-5 h-5 text-orange-500 focus:ring-orange-500 focus:ring-2"
                                />
                                <span className="text-lg">{optionLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestion === 1}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      <FiChevronLeft />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={handleClearResponse}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      Clear Response
                    </button>

                    <div className="flex items-center space-x-2">
                      {currentQuestion < totalQuestions ? (
                        <button
                          onClick={handleNext}
                          className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <span>Next</span>
                          <FiChevronRight />
                        </button>
                      ) : (
                        <button
                          onClick={handleSubmitSection}
                          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
                        >
                          <span>Continue to Coding</span>
                          <FiArrowRight />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSection === 'coding' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Problem Tabs */}
                <div className="border-b border-gray-800 px-6 py-3 flex items-center space-x-2 bg-gray-900/50">
                  {codingProblems.map((problem, index) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemChange(index)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        currentCodingProblem === index
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {problem.title}
                      {problem.testResults && problem.testResults.length > 0 && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          problem.testResults.every(r => r.passed)
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {problem.testResults.filter(r => r.passed).length}/{problem.testResults.length}
                        </span>
                      )}
                    </button>
                  ))}
                  {lastSaved && (
                    <span className="ml-auto text-xs text-gray-500">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Left Panel - Problem Description */}
                  <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Coding — Problem {currentCodingProblem + 1} of {totalCodingProblems}</span>
                    </div>
                  
                  {currentProblem ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <h1 className="text-2xl font-bold mb-4">{currentProblem.title || 'Coding Problem'}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                        {currentProblem.difficulty && <span>Difficulty: {currentProblem.difficulty}</span>}
                        <span>Language: {currentProblem.selectedLanguage || 'Python'}</span>
                      </div>
                      
                      {currentProblem.description && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-2">Description</h2>
                          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {currentProblem.description}
                          </div>
                        </div>
                      )}
                      
                      {currentProblem.testCases && currentProblem.testCases.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-2">Examples</h2>
                          {currentProblem.testCases.slice(0, 2).map((testCase, idx) => (
                            <div key={idx} className="mb-4">
                              <h3 className="text-sm font-semibold mb-2 text-gray-400">Example {idx + 1}</h3>
                              <div className="bg-gray-800 rounded-lg p-4 mb-2">
                                <div className="text-gray-400 text-sm mb-1">Input:</div>
                                <div className="text-gray-300 font-mono whitespace-pre-wrap">{testCase.input || testCase.stdin}</div>
                              </div>
                              <div className="bg-gray-800 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Output:</div>
                                <div className="text-gray-300 font-mono">{testCase.output || testCase.stdout || testCase.expected_output}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <p className="text-gray-400">Loading problem...</p>
                    </div>
                  )}
                </div>

                {/* Right Panel - Code Editor */}
                <div className="w-1/2 flex flex-col bg-gray-900">
                  {/* Editor Header */}
                  <div className="border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded text-orange-400 text-sm font-semibold">
                        {selectedLanguage === 'python' ? 'main.py' : 
                         selectedLanguage === 'javascript' ? 'main.js' :
                         selectedLanguage === 'java' ? 'Main.java' :
                         selectedLanguage === 'cpp' || selectedLanguage === 'c' ? 'main.cpp' :
                         selectedLanguage === 'go' ? 'main.go' : 'main'}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Language Dropdown */}
                      <div className="relative">
                        <GlassSelect
                          value={selectedLanguage}
                          onChange={(value) => handleLanguageChange(value)}
                          placeholder="Select language"
                          options={languages.map((lang) => ({
                            value: lang.value,
                            label: lang.label
                          }))}
                          className="text-sm"
                        />
                      </div>
                      {/* Reset Button - Moved to top right */}
                      <button
                        onClick={handleReset}
                        disabled={isExecuting}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                        title="Reset code to template"
                      >
                        <FiRefreshCw />
                        <span>Reset</span>
                      </button>
                      <span className="text-sm text-gray-400">Default Template</span>
                    </div>
                  </div>

                  {/* Code Editor */}
                  <div className="flex-1 p-4" style={{ minHeight: 0 }}>
                    <Editor
                      height="100%"
                      language={selectedLanguage === 'python' ? 'python' : 
                               selectedLanguage === 'javascript' ? 'javascript' :
                               selectedLanguage === 'java' ? 'java' :
                               selectedLanguage === 'cpp' ? 'cpp' :
                               selectedLanguage === 'c' ? 'c' :
                               selectedLanguage === 'go' ? 'go' : 'python'}
                      value={code}
                      onChange={(value) => handleCodeChange(value || '')}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        insertSpaces: true,
                        wordWrap: 'on',
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        acceptSuggestionOnCommitCharacter: true,
                        acceptSuggestionOnEnter: 'on',
                        snippetSuggestions: 'top',
                        suggestSelection: 'first',
                        tabCompletion: 'on',
                        wordBasedSuggestions: 'allDocuments',
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                        fontLigatures: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        padding: { top: 16, bottom: 16 },
                        renderWhitespace: 'selection',
                        renderLineHighlight: 'all',
                        scrollbar: {
                          vertical: 'auto',
                          horizontal: 'auto',
                          useShadows: false,
                          verticalHasArrows: false,
                          horizontalHasArrows: false,
                        },
                      }}
                      loading={
                        <div className="flex items-center justify-center h-full">
                          <div className="text-gray-400">Loading editor...</div>
                        </div>
                      }
                    />
                  </div>

                  {/* Custom Input */}
                  <div className="border-t border-gray-800 p-4">
                    <div className="text-sm font-semibold mb-2">Custom Input</div>
                    <textarea
                      value={customInput}
                      onChange={(e) => handleCustomInputChange(e.target.value)}
                      className="w-full h-24 bg-gray-800 text-gray-300 font-mono text-sm p-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
                      placeholder="Enter custom input here..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-800 p-4 flex items-center space-x-2">
                    <button
                      onClick={handleRunTestCases}
                      disabled={isExecuting}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExecuting ? (
                        <FiRefreshCw className="animate-spin" />
                      ) : (
                        <FiPlay />
                      )}
                      <span>Run</span>
                    </button>
                    <button
                      onClick={handleRunCustomInput}
                      disabled={isExecuting}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Run Custom Input</span>
                      <FiArrowRight />
                    </button>
                    <button
                      onClick={handleSubmitCoding}
                      disabled={isExecuting}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Submit Code</span>
                      <FiSend />
                    </button>
                  </div>

                  {/* Output Panel */}
                  {showOutput && (
                    <div className="border-t border-gray-800 flex flex-col" style={{ maxHeight: '300px' }}>
                      <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-300">Output</span>
                          {executionResult && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              executionResult.success 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {executionResult.success ? 'Success' : 'Error'}
                            </span>
                          )}
                          {executionResult?.executionTime > 0 && (
                            <span className="text-xs text-gray-500">
                              ({executionResult.executionTime}ms)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setShowOutput(false)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4">
                        {isExecuting ? (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <FiRefreshCw className="animate-spin" />
                            <span>Executing...</span>
                          </div>
                        ) : executionResult ? (
                          <div className="space-y-4">
                            {/* Main Output */}
                            {executionResult.error ? (
                              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                <div className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                                  {executionResult.error}
                                </div>
                              </div>
                            ) : executionResult.output && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                                  {executionResult.output}
                                </div>
                              </div>
                            )}
                            
                            {/* Test Results */}
                            {testResults.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-semibold text-gray-300 mb-2">
                                  Test Cases ({executionResult.testSummary?.passed || 0}/{executionResult.testSummary?.total || testResults.length} passed)
                                </div>
                                {testResults.map((test, index) => (
                                  <div
                                    key={index}
                                    className={`border rounded-lg p-3 ${
                                      test.passed
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-red-500/10 border-red-500/30'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center space-x-2">
                                        {test.passed ? (
                                          <FiCheckCircle className="text-green-400 w-5 h-5" />
                                        ) : (
                                          <FiX className="text-red-400 w-5 h-5" />
                                        )}
                                        <span className="text-sm font-semibold text-gray-300">
                                          Test Case {index + 1}
                                        </span>
                                      </div>
                                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                        test.passed
                                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      }`}>
                                        {test.passed ? '✓ Passed' : '✗ Failed'}
                                      </span>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div>
                                        <span className="text-gray-500">Input: </span>
                                        <span className="text-gray-300 font-mono">{test.input}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Output: </span>
                                        <span className={`font-mono ${test.passed ? 'text-green-400' : 'text-red-400'}`}>{test.actualOutput || 'No output'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Expected: </span>
                                        <span className="text-green-400 font-mono">{test.expectedOutput}</span>
                                      </div>
                                      {test.error && (
                                        <div className="text-red-400 font-mono text-xs mt-1">
                                          {test.error}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">No output yet. Run your code to see results.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}

            {currentSection === 'video' && (() => {
              const currentVideoQ = videoQuestions.find(q => q.order === currentVideoQuestion) || videoQuestions[currentVideoQuestion - 1];
              
              return (
                <div className="flex-1 flex overflow-hidden">
                  {/* Left Panel - Question */}
                  <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-semibold">Video Interview — Question {currentVideoQuestion} of {totalVideoQuestions}</h1>
                        <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">2 min</button>
                      </div>
                      
                      {currentVideoQ ? (
                        <>
                          <h2 className="text-2xl font-bold mb-6">{currentVideoQ.question || currentVideoQ.content?.question || 'Video Question'}</h2>
                          
                          {currentVideoQ.content?.description && (
                            <p className="text-gray-300 leading-relaxed mb-6">
                              {currentVideoQ.content.description}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400">Loading question...</p>
                      )}

                      {/* Question Map */}
                      <div className="mt-8">
                        <h3 className="text-sm font-semibold mb-3 text-gray-400">Question Map</h3>
                        <div className="flex items-center space-x-2">
                          {Array.from({ length: totalVideoQuestions }, (_, i) => i + 1).map((num) => (
                            <button
                              key={num}
                              onClick={() => setCurrentVideoQuestion(num)}
                              className={`w-10 h-10 rounded-full font-semibold transition-colors ${
                                currentVideoQuestion === num
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Right Panel - Video Recording */}
                <div className="w-1/2 flex flex-col bg-gray-900">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                      <FiShield className="text-white" />
                      <span className="text-sm text-gray-300">Proctored</span>
                    </div>

                    {/* Video Preview */}
                    <div className="flex-1 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                      {recordedBlob ? (
                        <video
                          src={URL.createObjectURL(recordedBlob)}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <>
                          <video
                            ref={videoPreviewRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover bg-black"
                            style={{ backgroundColor: '#000' }}
                          />
                          {!isRecording && !stream && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-center bg-gray-800/50">
                              <div>
                                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <p>Video preview will appear here</p>
                                <p className="text-sm mt-2">Click "Start Recording" to begin</p>
                              </div>
                            </div>
                          )}
                          {isRecording && (
                            <div className="absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 bg-red-500/90 rounded-lg">
                              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                              <span className="text-white text-sm font-semibold">Recording...</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Recording Controls */}
                    <div className="flex items-center space-x-2 mb-4">
                      {!isRecording && !recordedBlob && (
                        <button
                          onClick={handleStartRecording}
                          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
                        >
                          <FiSquare />
                          <span>Start Recording</span>
                        </button>
                      )}
                      {isRecording && (
                        <button
                          onClick={handleStopRecording}
                          className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <FiPause />
                          <span>Stop</span>
                        </button>
                      )}
                      {recordedBlob && (
                        <>
                          <button
                            onClick={handleRetake}
                            className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FiRotateCw />
                            <span>Retake</span>
                          </button>
                          <button
                            onClick={handleSubmitVideo}
                            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
                          >
                            <span>{currentVideoQuestion < totalVideoQuestions ? 'Submit & Continue' : 'Submit Assessment'}</span>
                            <FiArrowRight />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Monitoring Status */}
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <FiShield />
                      <span>Camera and mic monitoring enabled</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}
          </div>

          {/* Bottom Navigation for Coding Section */}
          {currentSection === 'coding' && (
            <div className="border-t border-gray-800 px-6 py-4 flex justify-end space-x-4">
              <button
                onClick={() => {
                  if (currentCodingProblem < totalCodingProblems - 1) {
                    handleProblemChange(currentCodingProblem + 1);
                  } else {
                    // On last coding problem, move to next section
                    saveCodingState();
                    setCurrentSection('video');
                  }
                }}
                className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
              >
                <span>{currentCodingProblem < totalCodingProblems - 1 ? 'Next Problem' : 'Continue to Video'}</span>
                {currentCodingProblem < totalCodingProblems - 1 ? <FiChevronRight /> : <FiArrowRight />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;

