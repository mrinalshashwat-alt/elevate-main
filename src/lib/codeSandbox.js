/**
 * Code Sandbox - Execute code in a safe environment
 * Supports JavaScript execution in browser
 * For other languages, integrates with Judge0 API
 */

import { executeWithJudge0, isJudge0Available, getSupportedLanguages } from './judge0';

// Test case structure
export const createTestCases = (testCasesString) => {
  if (!testCasesString) return [];
  
  try {
    // Parse test cases from string format
    // Expected format: "input1|output1\ninput2|output2"
    const lines = testCasesString.trim().split('\n').filter(line => line.trim());
    return lines.map((line, index) => {
      const [input, expectedOutput] = line.split('|').map(s => s.trim());
      return {
        id: index + 1,
        input,
        expectedOutput,
      };
    });
  } catch (error) {
    console.error('Error parsing test cases:', error);
    return [];
  }
};

// Execute JavaScript code
export const executeJavaScript = async (code, input = '') => {
  return new Promise((resolve) => {
    try {
      // Capture console output
      let output = '';
      let errorOutput = '';
      
      // Override console methods to capture output
      const originalLog = console.log;
      const originalError = console.error;
      const logs = [];
      const errors = [];
      
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      console.error = (...args) => {
        errors.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      // Create a safe execution context
      const executeCode = () => {
        try {
          // Parse input if provided (format: "n\nnums\ntarget")
          let parsedInput = null;
          if (input.trim()) {
            const lines = input.trim().split('\n');
            if (lines.length >= 3) {
              parsedInput = {
                n: parseInt(lines[0]),
                nums: lines[1].split(' ').map(Number),
                target: parseInt(lines[2]),
              };
            }
          }
          
          // If code expects input from stdin (readline), simulate it
          if (code.includes('readline') || code.includes('process.stdin')) {
            // Mock readline for Node.js-style code
            const mockReadline = {
              createInterface: () => ({
                input: {
                  on: () => {},
                },
                on: (event, callback) => {
                  if (event === 'line' && parsedInput) {
                    const inputLines = input.trim().split('\n');
                    inputLines.forEach((line, index) => {
                      setTimeout(() => {
                        if (callback) callback(line);
                      }, index * 10);
                    });
                  }
                  if (event === 'close' && parsedInput) {
                    setTimeout(() => {
                      // Execute the main logic after input is read
                      try {
                        // Extract function and call it
                        const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*}/);
                        if (functionMatch && parsedInput) {
                          const funcName = functionMatch[1];
                          const result = eval(`(${code.match(/function\s+\w+\s*\([^)]*\)\s*{[\s\S]*}/)[0]})`);
                          const output = result(parsedInput.nums, parsedInput.target);
                          if (Array.isArray(output)) {
                            console.log(output.join(' '));
                          } else {
                            console.log(output);
                          }
                        }
                      } catch (e) {
                        errorOutput = e.toString();
                      }
                    }, 100);
                  }
                },
              }),
            };
            
            // Mock process
            const mockProcess = {
              stdin: {
                on: () => {},
              },
            };
            
            // Execute in a context with mocked modules
            const context = {
              require: (module) => {
                if (module === 'readline') return mockReadline;
                return {};
              },
              process: mockProcess,
              console,
            };
            
            // Wrap code execution
            const wrappedCode = `
              (function() {
                ${code}
              })();
            `;
            
            try {
              eval(wrappedCode);
            } catch (e) {
              // If that fails, try extracting just the function
              const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*}/);
              if (functionMatch && parsedInput) {
                const funcCode = functionMatch[0];
                eval(funcCode);
                const funcName = functionMatch[1];
                const result = eval(`${funcName}(${JSON.stringify(parsedInput.nums)}, ${parsedInput.target})`);
                if (Array.isArray(result)) {
                  console.log(result.join(' '));
                } else {
                  console.log(result);
                }
              } else {
                throw e;
              }
            }
          } else {
            // For simpler code, try to extract and execute the function
            if (parsedInput) {
              // Look for function definition
              const functionMatch = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*}/);
              if (functionMatch) {
                // Execute function definition
                eval(functionMatch[0]);
                const funcName = functionMatch[1];
                // Call the function with parsed input
                const result = eval(`${funcName}(${JSON.stringify(parsedInput.nums)}, ${parsedInput.target})`);
                if (Array.isArray(result)) {
                  console.log(result.join(' '));
                } else if (result !== undefined) {
                  console.log(result);
                }
              } else {
                // Try to execute code directly
                eval(code);
              }
            } else {
              // Execute code directly
              eval(code);
            }
          }
          
          output = logs.join('\n');
          errorOutput = errors.join('\n');
        } catch (error) {
          errorOutput = error.toString();
        } finally {
          // Restore console methods
          console.log = originalLog;
          console.error = originalError;
          
          resolve({
            success: !errorOutput,
            output: output || (errorOutput ? '' : 'No output'),
            error: errorOutput || null,
            executionTime: 0, // Browser execution is instant
          });
        }
      };
      
      // Execute with timeout
      setTimeout(executeCode, 0);
      
      // Safety timeout
      setTimeout(() => {
        if (!output && !errorOutput) {
          console.log = originalLog;
          console.error = originalError;
          resolve({
            success: false,
            output: '',
            error: 'Execution timeout',
            executionTime: 5000,
          });
        }
      }, 5000);
      
    } catch (error) {
      resolve({
        success: false,
        output: '',
        error: error.toString(),
        executionTime: 0,
      });
    }
  });
};

// Execute Python code using Judge0
export const executePython = async (code, input = '') => {
  if (isJudge0Available()) {
    return await executeWithJudge0('python', code, input);
  }
  return {
    success: false,
    output: '',
    error: 'Judge0 API not configured. Please set NEXT_PUBLIC_JUDGE0_API_URL or NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY',
    executionTime: 0,
  };
};

// Execute Java code using Judge0
export const executeJava = async (code, input = '') => {
  if (isJudge0Available()) {
    return await executeWithJudge0('java', code, input);
  }
  return {
    success: false,
    output: '',
    error: 'Judge0 API not configured. Please set NEXT_PUBLIC_JUDGE0_API_URL or NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY',
    executionTime: 0,
  };
};

// Execute C++ code using Judge0
export const executeCpp = async (code, input = '') => {
  if (isJudge0Available()) {
    return await executeWithJudge0('cpp', code, input);
  }
  return {
    success: false,
    output: '',
    error: 'Judge0 API not configured. Please set NEXT_PUBLIC_JUDGE0_API_URL or NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY',
    executionTime: 0,
  };
};

// Execute C code using Judge0
export const executeC = async (code, input = '') => {
  if (isJudge0Available()) {
    return await executeWithJudge0('c', code, input);
  }
  return {
    success: false,
    output: '',
    error: 'Judge0 API not configured. Please set NEXT_PUBLIC_JUDGE0_API_URL or NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY',
    executionTime: 0,
  };
};

// Execute Go code using Judge0
export const executeGo = async (code, input = '') => {
  if (isJudge0Available()) {
    return await executeWithJudge0('go', code, input);
  }
  return {
    success: false,
    output: '',
    error: 'Judge0 API not configured. Please set NEXT_PUBLIC_JUDGE0_API_URL or NEXT_PUBLIC_JUDGE0_RAPIDAPI_KEY',
    executionTime: 0,
  };
};

// Main execution function
export const executeCode = async (language, code, input = '', testCases = []) => {
  const startTime = Date.now();
  
  let result;
  
  // Normalize language name
  const normalizedLang = language.toLowerCase().trim();
  
  switch (normalizedLang) {
    case 'javascript':
    case 'js':
    case 'nodejs':
    case 'node':
      // Use browser execution for JavaScript (faster) or Judge0 if preferred
      // You can change this to use Judge0 for consistency: result = await executeWithJudge0('javascript', code, input);
      result = await executeJavaScript(code, input);
      break;
    case 'python':
    case 'py':
      result = await executePython(code, input);
      break;
    case 'java':
      result = await executeJava(code, input);
      break;
    case 'cpp':
    case 'c++':
    case 'cplusplus':
      result = await executeCpp(code, input);
      break;
    case 'c':
      result = await executeC(code, input);
      break;
    case 'go':
    case 'golang':
      result = await executeGo(code, input);
      break;
    default:
      // Try Judge0 for other languages if available
      if (isJudge0Available()) {
        const supportedLangs = getSupportedLanguages();
        if (supportedLangs.includes(normalizedLang)) {
          result = await executeWithJudge0(normalizedLang, code, input);
        } else {
          result = {
            success: false,
            output: '',
            error: `Unsupported language: ${language}. Supported languages: ${supportedLangs.join(', ')}`,
            executionTime: 0,
          };
        }
      } else {
        result = {
          success: false,
          output: '',
          error: `Unsupported language: ${language}. Judge0 API not configured.`,
          executionTime: 0,
        };
      }
  }
  
  // Execution time is already set by individual functions, but ensure it's accurate
  if (!result.executionTime) {
    result.executionTime = Date.now() - startTime;
  }
  
  // If test cases provided, run them
  if (testCases.length > 0 && result.success) {
    const testResults = await runTestCases(language, code, testCases);
    result.testResults = testResults;
  }
  
  return result;
};

// Normalize output for comparison (handles newlines, whitespace, etc.)
const normalizeOutput = (output) => {
  if (!output) return '';
  // Remove trailing newlines and whitespace, normalize line endings
  return output
    .replace(/\r\n/g, '\n')  // Normalize Windows line endings
    .replace(/\r/g, '\n')    // Normalize Mac line endings
    .split('\n')
    .map(line => line.trimEnd())  // Remove trailing spaces from each line
    .join('\n')
    .trim();  // Remove leading/trailing newlines and whitespace
};

// Run test cases against code
export const runTestCases = async (language, code, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    const result = await executeCode(language, code, testCase.input);
    
    // Normalize both outputs for comparison
    const normalizedActual = normalizeOutput(result.output);
    const normalizedExpected = normalizeOutput(testCase.expectedOutput);
    
    const passed = result.success && normalizedActual === normalizedExpected;
    
    results.push({
      ...testCase,
      passed,
      actualOutput: result.output,  // Keep original for display
      normalizedActual,  // Add normalized version for debugging
      normalizedExpected,  // Add normalized expected for debugging
      error: result.error,
      executionTime: result.executionTime,
    });
  }
  
  return results;
};

// Format output for display
export const formatOutput = (result) => {
  if (result.error) {
    return {
      type: 'error',
      content: result.error,
      color: 'text-red-400',
    };
  }
  
  return {
    type: 'output',
    content: result.output || 'No output',
    color: 'text-green-400',
  };
};

// Validate code syntax (basic validation)
export const validateCode = (language, code) => {
  if (!code || code.trim().length === 0) {
    return {
      valid: false,
      error: 'Code cannot be empty',
    };
  }
  
  // Basic syntax checks
  if (language === 'javascript') {
    try {
      // Try to parse as JavaScript
      new Function(code);
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Syntax error: ${error.message}`,
      };
    }
  }
  
  return { valid: true };
};

