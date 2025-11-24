'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiSave, FiChevronLeft, FiChevronRight, FiSend, FiShield, FiCheckCircle, FiPlay, FiRefreshCw, FiGrid, FiArrowRight, FiSquare, FiStop, FiRotateCw, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { executeCode, runTestCases, formatOutput, validateCode } from '../../lib/codeSandbox';

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
  
  // Test cases for the current problem (visible sample test cases)
  const [problemTestCases] = useState([
    { input: '4\n2 7 11 15\n9', expectedOutput: '0 1' },
    { input: '5\n3 2 4 8 1\n6', expectedOutput: '1 2' },
    { input: '3\n1 2 3\n4', expectedOutput: '0 2' },
  ]);

  // Hidden test cases (not shown in UI, used when submitting code)
  const [hiddenTestCases] = useState([
    { input: '2\n1 3\n4', expectedOutput: '0 1' },
    { input: '6\n1 5 3 7 9 2\n10', expectedOutput: '1 3' },
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

      // Set cooldown to prevent spam (3 seconds)
      alertCooldownRef.current = true;
      setTimeout(() => {
        alertCooldownRef.current = false;
      }, 3000);
    };
  }, []);

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
        if (prev <= 1) {
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

    // Autosave interval for coding section
    const autosaveTimer = setInterval(() => {
      if (currentSection === 'coding') {
        saveCodingState();
      }
    }, 2000); // Autosave every 2 seconds
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
      if (proctoringVideoElement && !mediaPipeProctoringRef.current) {
        try {
          // Dynamically import MediaPipe to avoid blocking if it fails
          const { MediaPipeProctoring } = await import('../../lib/mediapipeProctoring');
          
          mediaPipeProctoringRef.current = new MediaPipeProctoring(
            proctoringVideoElement,
            (violation) => {
              // Handle MediaPipe violations
              handleViolation(violation.type, violation.details);
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
    if (currentSection === 'mcq') {
      // Save all MCQ answers before moving to next section
      if (selectedAnswer) {
        const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
        mcqAnswers[currentQuestion.toString()] = selectedAnswer;
        localStorage.setItem('assessment_mcq_answers', JSON.stringify(mcqAnswers));
      }
      // Navigate to coding section
      setCurrentSection('coding');
    } else if (currentSection === 'coding') {
      // Save coding state
      saveCodingState();
      // Navigate to video section
      setCurrentSection('video');
    } else if (currentSection === 'video') {
      // Final submission - navigate to assessment end
      // Clear flow completion flag
      localStorage.removeItem('assessment_flow_completed');
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
      
      const result = await executeCode(selectedLanguage, code, customInput);
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

  const handleSubmitVideo = () => {
    console.log('Submitting video answer...');
    // Save video answer
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
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiShield />
                      <span>Proctoring enabled</span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6 leading-tight">
                      Which sorting algorithm has the best average time complexity for large, randomly distributed datasets?
                    </h2>

                    <div className="space-y-3">
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
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
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
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
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

            {currentSection === 'video' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Left Panel - Question */}
                <div className="w-1/2 border-r border-gray-800 overflow-y-auto p-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-xl font-semibold">Video Interview — Question {currentVideoQuestion} of {totalVideoQuestions}</h1>
                      <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300">2 min</button>
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
                <span>{currentCodingProblem < totalCodingProblems - 1 ? 'Next' : 'Submit'}</span>
                {currentCodingProblem < totalCodingProblems - 1 ? <FiChevronRight /> : <FiSend />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;

