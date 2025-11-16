# Code Sandbox Guide

## Overview

The code sandbox allows users to write, test, and execute code directly in the browser during assessments. It supports multiple programming languages and provides real-time feedback.

## Features

- ✅ **JavaScript Execution** - Full browser-based execution
- ✅ **Code Validation** - Syntax checking before execution
- ✅ **Test Case Execution** - Run predefined test cases
- ✅ **Custom Input** - Test with your own input
- ✅ **Output Display** - Real-time output and error messages
- ✅ **Multiple Languages** - Support for Python, Java, C++, C, Go, JavaScript

## How to Use

### 1. Writing Code

1. Navigate to the **Coding Section** in an assessment
2. Select your preferred programming language from the dropdown
3. Write your code in the editor
4. Use the provided template as a starting point

### 2. Running Code

#### Run Test Cases
- Click **"Run Test Cases"** to execute your code against all predefined test cases
- View results showing which tests passed/failed
- See expected vs actual output for failed tests

#### Run Custom Input
- Enter your custom input in the "Custom Input" field
- Click **"Run Custom Input"** to execute with your input
- View the output in the results panel

#### Compile
- Click **"Compile"** to check for syntax errors
- Useful for compiled languages (Java, C++, C)

### 3. Viewing Results

The output panel shows:
- **Success/Error Status** - Green for success, red for errors
- **Execution Output** - Console output from your code
- **Test Results** - Detailed breakdown of each test case
- **Execution Time** - How long the code took to run

## Supported Languages

### JavaScript (Node.js)
- ✅ Full browser execution
- ✅ Supports console.log output
- ✅ Handles readline/process.stdin patterns

### Python
- ⚠️ Requires backend API integration
- Currently shows placeholder message
- To enable: Integrate with Pyodide or backend service

### Java, C++, C, Go
- ⚠️ Requires backend API integration
- Currently shows placeholder message
- To enable: Integrate with code execution service (e.g., Judge0 API)

## Integration with Backend

To enable execution for languages other than JavaScript, you need to integrate with a code execution service:

### Option 1: Judge0 API
```javascript
// In src/lib/codeSandbox.js
export const executePython = async (code, input = '') => {
  const response = await fetch('https://api.judge0.com/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code: code,
      language_id: 71, // Python 3
      stdin: input,
    }),
  });
  
  const submission = await response.json();
  // Poll for results...
  return result;
};
```

### Option 2: Custom Backend
Create an API endpoint that executes code safely:
```javascript
export const executePython = async (code, input = '') => {
  const response = await axiosInstance.post('/api/execute', {
    language: 'python',
    code,
    input,
  });
  return response.data;
};
```

## File Structure

```
src/
├── lib/
│   └── codeSandbox.js      # Sandbox execution logic
└── pages/
    └── User/
        └── Assessment.jsx  # Assessment UI with sandbox integration
```

## API Reference

### `executeCode(language, code, input, testCases)`
Execute code in the specified language.

**Parameters:**
- `language` (string): Language identifier ('javascript', 'python', etc.)
- `code` (string): Source code to execute
- `input` (string): Input data (optional)
- `testCases` (array): Test cases to run (optional)

**Returns:**
```javascript
{
  success: boolean,
  output: string,
  error: string | null,
  executionTime: number,
  testResults?: array
}
```

### `runTestCases(language, code, testCases)`
Run test cases against code.

**Parameters:**
- `language` (string): Language identifier
- `code` (string): Source code
- `testCases` (array): Array of test case objects

**Test Case Format:**
```javascript
{
  id: number,
  input: string,
  expectedOutput: string
}
```

### `validateCode(language, code)`
Validate code syntax.

**Returns:**
```javascript
{
  valid: boolean,
  error?: string
}
```

## Security Considerations

⚠️ **Important**: The current JavaScript execution uses `eval()`, which has security implications:

1. **For Production**: Consider using a sandboxed environment
2. **For Other Languages**: Always use a backend service
3. **Input Validation**: Sanitize all user input
4. **Timeout**: Implement execution timeouts
5. **Resource Limits**: Limit memory and CPU usage

## Example Usage

```javascript
import { executeCode, runTestCases } from '../../lib/codeSandbox';

// Execute JavaScript code
const result = await executeCode('javascript', `
  function twoSum(nums, target) {
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
  
  const result = twoSum([2, 7, 11, 15], 9);
  console.log(result.join(' '));
`, '');

console.log(result.output); // "0 1"
```

## Troubleshooting

### Code Not Executing
- Check browser console for errors
- Verify code syntax is correct
- Ensure input format matches expected format

### Test Cases Failing
- Verify output format matches expected output exactly
- Check for trailing whitespace or newlines
- Ensure your algorithm handles edge cases

### Timeout Errors
- Code may be taking too long to execute
- Check for infinite loops
- Optimize your algorithm

## Future Enhancements

- [ ] Syntax highlighting in code editor
- [ ] Auto-completion
- [ ] Code formatting
- [ ] Multiple file support
- [ ] Debugging tools
- [ ] Performance metrics
- [ ] Code history/versioning


