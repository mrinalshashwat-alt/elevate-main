'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiClock, FiSave, FiChevronLeft, FiChevronRight, FiSend, FiShield, FiCheckCircle, FiPlay, FiRefreshCw, FiGrid, FiArrowRight, FiSquare, FiStop, FiRotateCw, FiX, FiCheck } from 'react-icons/fi';
import { executeCode, runTestCases, formatOutput, validateCode } from '../../lib/codeSandbox';

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
  
  // Check if user has completed the pre-assessment flow
  useEffect(() => {
    const hasCompletedFlow = localStorage.getItem('assessment_flow_completed');
    if (!hasCompletedFlow) {
      // Redirect to assessment start page if flow not completed
      router.push('/user/assessment-start');
    }
  }, [router]);
  
  const [timeLeft, setTimeLeft] = useState(34 * 60 + 18); // 34:18 in seconds
  const [currentQuestion, setCurrentQuestion] = useState(5);
  const [totalQuestions] = useState(20);
  const [attempted] = useState(8);
  const [selectedAnswer, setSelectedAnswer] = useState('merge-sort');
  const [questions, setQuestions] = useState([
    { id: 1, attempted: true },
    { id: 2, attempted: true },
    { id: 3, attempted: true },
    { id: 4, attempted: true },
    { id: 5, attempted: true, current: true },
    ...Array.from({ length: 15 }, (_, i) => ({ id: i + 6, attempted: false })),
  ]);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [stream, setStream] = useState(null);
  
  // Coding section state - support multiple problems
  const [currentCodingProblem, setCurrentCodingProblem] = useState(0);
  const [totalCodingProblems] = useState(3);
  const [codingProblems, setCodingProblems] = useState([
    {
      id: 1,
      title: 'Two Sum',
      code: `def two_sum(nums, target):
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
`,
      customInput: '4\n2 7 11 15\n9',
      selectedLanguage: 'python',
      testResults: [],
      executionResult: null,
    },
    {
      id: 2,
      title: 'Reverse Linked List',
      code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    current = head
    while current:
        next_node = current.next
        current.next = prev
        prev = current
        current = next_node
    return prev
`,
      customInput: '',
      selectedLanguage: 'python',
      testResults: [],
      executionResult: null,
    },
    {
      id: 3,
      title: 'Binary Search',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
`,
      customInput: '',
      selectedLanguage: 'python',
      testResults: [],
      executionResult: null,
    },
  ]);
  
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
  
  // Test cases for the current problem
  const [problemTestCases] = useState([
    { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' },
    { input: '5\n3 2 4 8 1\n6', expectedOutput: '1 2' },
    { input: '3\n1 2 3\n4', expectedOutput: '0 2' },
  ]);
  
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
  const [currentVideoQuestion, setCurrentVideoQuestion] = useState(2);
  const [totalVideoQuestions] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const videoRecorderRef = useRef(null);
  const videoPreviewRef = useRef(null);

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
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Autosave interval for coding section
    const autosaveTimer = setInterval(() => {
      if (currentSection === 'coding') {
        saveCodingState();
      }
    }, 30000); // Autosave every 30 seconds
    autosaveIntervalRef.current = autosaveTimer;

    return () => {
      clearInterval(timer);
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Autosave function
  const saveCodingState = () => {
    const stateToSave = {
      codingProblems,
      currentCodingProblem,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('assessment_coding_state', JSON.stringify(stateToSave));
    setLastSaved(new Date());
    // In production, this would call the backend API
    // await saveAssessmentState(stateToSave);
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
  }, [currentSection, currentQuestion]);

  const startProctoring = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
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

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
      // Update question state
      setQuestions(prev => prev.map(q => ({
        ...q,
        current: q.id === currentQuestion - 1
      })));
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      // Update question state
      setQuestions(prev => prev.map(q => ({
        ...q,
        current: q.id === currentQuestion + 1,
        attempted: q.id === currentQuestion ? selectedAnswer !== '' : q.attempted
      })));
      // Save MCQ answer
      if (selectedAnswer) {
        const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
        mcqAnswers[currentQuestion.toString()] = selectedAnswer;
        localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
      }
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

  const handleSubmitSection = () => {
    // Save final state before submission
    if (currentSection === 'coding') {
      saveCodingState();
    }
    // Clear flow completion flag
    localStorage.removeItem('assessment_flow_completed');
    // Navigate to assessment end page
    router.push('/user/assessment-end');
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
      
      // Run test cases
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
          output: `Test Results: ${passed}/${total} passed`,
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

  const handleCompile = async () => {
    setIsExecuting(true);
    setShowOutput(true);
    setExecutionResult(null);
    
    try {
      const validation = validateCode(selectedLanguage, code);
      if (!validation.valid) {
        setExecutionResult({
          success: false,
          output: '',
          error: validation.error,
          executionTime: 0,
        });
        setIsExecuting(false);
        return;
      }
      
      setExecutionResult({
        success: true,
        output: 'Compilation successful!',
        error: null,
        executionTime: 0,
      });
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error.toString(),
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunCustomInput = async () => {
    if (!customInput.trim()) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'Please provide custom input',
        executionTime: 0,
      });
      setShowOutput(true);
      return;
    }
    
    setIsExecuting(true);
    setShowOutput(true);
    setExecutionResult(null);
    setTestResults([]);
    
    try {
      const validation = validateCode(selectedLanguage, code);
      if (!validation.valid) {
        setExecutionResult({
          success: false,
          output: '',
          error: validation.error,
          executionTime: 0,
        });
        setIsExecuting(false);
        return;
      }
      
      const result = await executeCode(selectedLanguage, code, customInput);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: error.toString(),
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCoding = () => {
    console.log('Submitting coding solution...');
    // Implement submission
  };

  const handleNextCodingProblem = () => {
    if (currentCodingProblem < totalCodingProblems) {
      setCurrentCodingProblem(currentCodingProblem + 1);
    }
  };

  // Video section handlers
  const handleStartRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setVideoStream(mediaStream);
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
      }

      const recorder = new MediaRecorder(mediaStream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      videoRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = () => {
    if (videoRecorderRef.current && isRecording) {
      videoRecorderRef.current.stop();
      setIsRecording(false);
      
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setIsRecording(false);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  const handleSubmitVideo = () => {
    console.log('Submitting video answer...');
    // Save video answer
    const videoAnswers = JSON.parse(localStorage.getItem('assessment_video_answers') || '[]');
    if (!videoAnswers.includes(currentVideoQuestion)) {
      videoAnswers.push(currentVideoQuestion);
      localStorage.setItem('assessment_video_answers', JSON.stringify(videoAnswers));
    }
    // Implement video submission
    if (currentVideoQuestion < totalVideoQuestions) {
      setCurrentVideoQuestion(currentVideoQuestion + 1);
      handleRetake();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
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
        {/* Left Panel - Proctoring and Navigation (hidden in coding and video sections) */}
        {currentSection !== 'coding' && currentSection !== 'video' && (
          <div className="w-80 bg-black border-r border-gray-800 p-6 overflow-y-auto">
          {/* Proctoring Active */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold leading-tight">Proctoring Active</h3>
              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                Good
              </span>
            </div>
            
            {/* Video Feed */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Assessment Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Total: {totalQuestions}</span>
                <span className="text-gray-400">Attempted: {attempted}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(attempted / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-gray-400">Pending</span>
            </div>
            </div>
          </motion.div>

          {/* Question Map */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-20">
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
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {q.id}
                </button>
              ))}
            </div>
            </div>
          </motion.div>

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
              <div className="rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
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
              <span>&lt;/&gt; Coding Section</span>
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
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiShield />
                      <span>Proctoring enabled</span>
                    </div>
                  </div>

                  <motion.div 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                      <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-20">
                    <h2 className="text-xl font-semibold mb-6 leading-tight">
                      Which sorting algorithm has the best average time complexity for large, randomly distributed datasets?
                    </h2>

                    <div className="space-y-4">
                      {[
                        { id: 'bubble-sort', label: 'Bubble Sort' },
                        { id: 'merge-sort', label: 'Merge Sort' },
                        { id: 'insertion-sort', label: 'Insertion Sort' },
                        { id: 'selection-sort', label: 'Selection Sort' },
                      ].map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedAnswer === option.id
                              ? 'bg-orange-500/20 border border-orange-500/50'
                              : 'bg-gray-700/50 border border-gray-700 hover:bg-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={option.id}
                            checked={selectedAnswer === option.id}
                            onChange={() => {
                              setSelectedAnswer(option.id);
                              // Mark question as attempted
                              setQuestions(prev => prev.map(q => 
                                q.id === currentQuestion ? { ...q, attempted: true } : q
                              ));
                              // Save answer immediately
                              const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
                              mcqAnswers[currentQuestion.toString()] = option.id;
                              localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
                            }}
                            className="w-5 h-5 text-orange-500 focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="text-lg">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    </div>
                  </motion.div>

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
                          <span>Submit Section</span>
                          <FiSend />
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
                  
                  <motion.div 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                      <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-20">
                    <h1 className="text-2xl font-bold mb-4">{currentProblem?.title || 'Coding Problem'}</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                      <span>Difficulty: Easy</span>
                      <span>Language: Python</span>
                      <span>Time Limit: 2s</span>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Description</h2>
                      <p className="text-gray-300 leading-relaxed">
                        Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
                        Assume that each input would have exactly one solution, and you may not use the same element twice.
                      </p>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Input Format</h2>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        <li>Line 1: n (length of array)</li>
                        <li>Line 2: n space-separated integers</li>
                        <li>Line 3: target</li>
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Output Format</h2>
                      <p className="text-gray-300">Indices i and j (0-based) such that nums[i] + nums[j] = target.</p>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Example 1</h2>
                      <div className="bg-gray-800 rounded-lg p-4 mb-2">
                        <div className="text-gray-400 text-sm mb-1">Input:</div>
                        <div className="text-gray-300 font-mono">4</div>
                        <div className="text-gray-300 font-mono">2 7 11 15</div>
                        <div className="text-gray-300 font-mono">9</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Output:</div>
                        <div className="text-gray-300 font-mono">0 1</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold mb-2">Example 2</h2>
                      <div className="bg-gray-800 rounded-lg p-4 mb-2">
                        <div className="text-gray-400 text-sm mb-1">Input:</div>
                        <div className="text-gray-300 font-mono">5</div>
                        <div className="text-gray-300 font-mono">3 2 4 8 1</div>
                        <div className="text-gray-300 font-mono">6</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <div className="text-gray-400 text-sm mb-1">Output:</div>
                        <div className="text-gray-300 font-mono">1 2</div>
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Explanation</h2>
                      <p className="text-gray-300 leading-relaxed">
                        Use a hash map to store seen numbers and their indices. For each number at index i, check if target - n is already seen. 
                        If yes, return the stored index and i. This yields linear time complexity O(n) and O(1) space.
                      </p>
                    </div>
                    </div>
                  </motion.div>
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
                  <div className="flex-1 p-4">
                    <textarea
                      value={code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="w-full h-full bg-black text-green-400 font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
                      spellCheck={false}
                      placeholder="Write your code here..."
                      style={{ 
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
                        lineHeight: '1.5',
                        tabSize: 4
                      }}
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
                        <FiGrid />
                      )}
                      <span>Run Test Cases</span>
                    </button>
                    <button
                      onClick={handleCompile}
                      disabled={isExecuting}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm disabled:opacity-50"
                    >
                      <FiPlay />
                      <span>Compile</span>
                    </button>
                    <button
                      onClick={handleRunCustomInput}
                      disabled={isExecuting}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
                    >
                      <span>Run Custom Input</span>
                      <FiArrowRight />
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
                                        <span className="text-gray-500">Expected: </span>
                                        <span className="text-green-400 font-mono">{test.expectedOutput}</span>
                                      </div>
                                      {!test.passed && (
                                        <div>
                                          <span className="text-gray-500">Got: </span>
                                          <span className="text-red-400 font-mono">{test.actualOutput || 'No output'}</span>
                                        </div>
                                      )}
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

            {currentSection === 'video' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Question */}
                <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
                  <motion.div 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                      <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-20">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-xl font-semibold">Video Interview — Question {currentVideoQuestion} of {totalVideoQuestions}</h1>
                      <button className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-gray-300">2 min</button>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-6">Explain a challenging bug you fixed recently.</h2>
                    
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Walk through the debugging process, tools you used, and how you verified the fix. Focus on impact and lessons learned.
                    </p>

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
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    </div>
                  </motion.div>
                </div>

                {/* Right Panel - Video Recording */}
                <div className="w-1/2 flex flex-col bg-gray-900">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 mb-4">
                      <FiShield className="text-white" />
                      <span className="text-sm text-gray-300">Proctored</span>
                    </div>

                    {/* Video Preview */}
                    <div className="flex-1 bg-gray-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                      {recordedBlob ? (
                        <video
                          src={URL.createObjectURL(recordedBlob)}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <video
                          ref={videoPreviewRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-contain ${isRecording ? '' : 'hidden'}`}
                        />
                      )}
                      {!isRecording && !recordedBlob && (
                        <div className="text-gray-500 text-center">
                          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <p>Video preview will appear here</p>
                        </div>
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
                          <FiStop />
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
                            <span>Submit</span>
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
            )}
          </div>

          {/* Bottom Navigation for Coding Section */}
          {currentSection === 'coding' && (
            <div className="border-t border-gray-800 px-6 py-4 flex justify-end space-x-4">
              <button
                onClick={handleNextCodingProblem}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span>Next Code</span>
                <FiChevronRight />
              </button>
              <button
                onClick={handleSubmitCoding}
                className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
              >
                <span>Submit</span>
                <FiSend />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;

