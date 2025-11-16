/**
 * Code Sandbox - Execute code in a safe environment
 * Supports JavaScript execution in browser
 * For other languages, integrates with backend API
 */

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

// Execute Python code (requires backend API or Pyodide)
export const executePython = async (code, input = '') => {
  // This would typically call a backend API
  // For now, return a placeholder
  return {
    success: false,
    output: '',
    error: 'Python execution requires backend API integration. Please configure a code execution service.',
    executionTime: 0,
  };
};

// Execute Java code (requires backend API)
export const executeJava = async (code, input = '') => {
  return {
    success: false,
    output: '',
    error: 'Java execution requires backend API integration. Please configure a code execution service.',
    executionTime: 0,
  };
};

// Execute C++ code (requires backend API)
export const executeCpp = async (code, input = '') => {
  return {
    success: false,
    output: '',
    error: 'C++ execution requires backend API integration. Please configure a code execution service.',
    executionTime: 0,
  };
};

// Execute C code (requires backend API)
export const executeC = async (code, input = '') => {
  return {
    success: false,
    output: '',
    error: 'C execution requires backend API integration. Please configure a code execution service.',
    executionTime: 0,
  };
};

// Execute Go code (requires backend API)
export const executeGo = async (code, input = '') => {
  return {
    success: false,
    output: '',
    error: 'Go execution requires backend API integration. Please configure a code execution service.',
    executionTime: 0,
  };
};

// Main execution function
export const executeCode = async (language, code, input = '', testCases = []) => {
  const startTime = Date.now();
  
  let result;
  
  switch (language) {
    case 'javascript':
      result = await executeJavaScript(code, input);
      break;
    case 'python':
      result = await executePython(code, input);
      break;
    case 'java':
      result = await executeJava(code, input);
      break;
    case 'cpp':
    case 'c++':
      result = await executeCpp(code, input);
      break;
    case 'c':
      result = await executeC(code, input);
      break;
    case 'go':
      result = await executeGo(code, input);
      break;
    default:
      result = {
        success: false,
        output: '',
        error: `Unsupported language: ${language}`,
        executionTime: 0,
      };
  }
  
  result.executionTime = Date.now() - startTime;
  
  // If test cases provided, run them
  if (testCases.length > 0 && result.success) {
    const testResults = await runTestCases(language, code, testCases);
    result.testResults = testResults;
  }
  
  return result;
};

// Run test cases against code
export const runTestCases = async (language, code, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    const result = await executeCode(language, code, testCase.input);
    
    const passed = result.success && 
                   result.output.trim() === testCase.expectedOutput.trim();
    
    results.push({
      ...testCase,
      passed,
      actualOutput: result.output,
      error: result.error,
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

