"""
Judge0 Integration Service
Handles code execution via Judge0 API
"""
import requests
import time
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Judge0Service:
    """Service for interacting with Judge0 code execution engine"""
    
    # Language IDs for Judge0
    LANGUAGE_MAP = {
        'python3': 71,  # Python 3.8.1
        'python': 71,
        'cpp': 54,      # C++ (GCC 9.2.0)
        'c++': 54,
        'java': 62,     # Java (OpenJDK 13.0.1)
        'javascript': 63,  # JavaScript (Node.js 12.14.0)
        'c': 50,        # C (GCC 9.2.0)
    }
    
    def __init__(self):
        self.base_url = settings.JUDGE0_HOST
        self.api_key = settings.JUDGE0_API_KEY
        self.rapid_api_host = settings.JUDGE0_RAPID_API_HOST
        self.rapid_api_key = settings.JUDGE0_RAPID_API_KEY
        
        # Use RapidAPI if configured, otherwise local Judge0
        self.use_rapid_api = bool(self.rapid_api_key)
    
    def get_headers(self):
        """Get request headers"""
        if self.use_rapid_api:
            return {
                'content-type': 'application/json',
                'X-RapidAPI-Key': self.rapid_api_key,
                'X-RapidAPI-Host': self.rapid_api_host
            }
        else:
            headers = {'content-type': 'application/json'}
            if self.api_key:
                headers['X-Auth-Token'] = self.api_key
            return headers
    
    def get_language_id(self, language):
        """Get Judge0 language ID from language name"""
        return self.LANGUAGE_MAP.get(language.lower(), 71)  # Default to Python
    
    def submit_code(self, code, language, stdin='', expected_output=''):
        """
        Submit code for execution.
        
        Args:
            code: Source code to execute
            language: Programming language (python3, cpp, java, etc.)
            stdin: Standard input for the program
            expected_output: Expected output (for comparison)
        
        Returns:
            token: Job token/ID for checking results
        """
        language_id = self.get_language_id(language)
        
        payload = {
            'source_code': code,
            'language_id': language_id,
            'stdin': stdin,
            'expected_output': expected_output
        }
        
        url = f"{self.base_url}/submissions?base64_encoded=false&wait=false"
        
        try:
            response = requests.post(
                url,
                json=payload,
                headers=self.get_headers(),
                timeout=10
            )
            response.raise_for_status()
            
            result = response.json()
            token = result.get('token')
            
            logger.info(f"Code submitted to Judge0. Token: {token}")
            return token
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to submit code to Judge0: {str(e)}")
            raise Exception(f"Code execution service unavailable: {str(e)}")
    
    def get_result(self, token, wait=True, max_wait=30):
        """
        Get execution result for a submission.
        
        Args:
            token: Submission token from submit_code()
            wait: Whether to poll until completion
            max_wait: Maximum seconds to wait
        
        Returns:
            dict: Execution result
        """
        url = f"{self.base_url}/submissions/{token}?base64_encoded=false"
        
        start_time = time.time()
        
        while True:
            try:
                response = requests.get(
                    url,
                    headers=self.get_headers(),
                    timeout=10
                )
                response.raise_for_status()
                
                result = response.json()
                status_id = result.get('status', {}).get('id')
                
                # Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4=Wrong Answer, 5=Time Limit Exceeded, etc.
                if status_id in [1, 2]:  # In Queue or Processing
                    if wait and (time.time() - start_time) < max_wait:
                        time.sleep(1)
                        continue
                    else:
                        return {
                            'status': 'processing',
                            'message': 'Code is still being executed'
                        }
                
                # Execution completed
                return self._parse_result(result)
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to get result from Judge0: {str(e)}")
                raise Exception(f"Failed to get execution result: {str(e)}")
    
    def _parse_result(self, raw_result):
        """Parse Judge0 result into standardized format"""
        status = raw_result.get('status', {})
        status_id = status.get('id')
        
        # Map status IDs to our statuses
        if status_id == 3:  # Accepted
            passed = True
            error = None
        elif status_id == 4:  # Wrong Answer
            passed = False
            error = "Wrong Answer"
        elif status_id == 5:  # Time Limit Exceeded
            passed = False
            error = "Time Limit Exceeded"
        elif status_id == 6:  # Compilation Error
            passed = False
            error = "Compilation Error"
        elif status_id in [7, 8, 9, 10, 11, 12]:  # Various runtime errors
            passed = False
            error = status.get('description', 'Runtime Error')
        else:
            passed = False
            error = status.get('description', 'Unknown Error')
        
        return {
            'status': 'completed',
            'passed': passed,
            'output': raw_result.get('stdout', '').strip(),
            'expected': raw_result.get('expected_output', '').strip(),
            'error': error,
            'stderr': raw_result.get('stderr', ''),
            'compile_output': raw_result.get('compile_output', ''),
            'execution_time_ms': float(raw_result.get('time', 0)) * 1000 if raw_result.get('time') else 0,
            'memory_used_mb': float(raw_result.get('memory', 0)) / 1024 if raw_result.get('memory') else 0
        }
    
    def execute_test_cases(self, code, language, test_cases):
        """
        Execute code against multiple test cases.
        
        Args:
            code: Source code
            language: Programming language
            test_cases: List of test case dicts with 'input' and 'output'
        
        Returns:
            dict: Aggregated results
        """
        results = []
        passed_count = 0
        total_time = 0
        total_memory = 0
        
        for test_case in test_cases:
            token = self.submit_code(
                code=code,
                language=language,
                stdin=test_case.get('input', ''),
                expected_output=test_case.get('output', '')
            )
            
            # Wait for result
            result = self.get_result(token, wait=True)
            
            if result['status'] == 'completed':
                if result['passed']:
                    passed_count += 1
                
                total_time += result.get('execution_time_ms', 0)
                total_memory += result.get('memory_used_mb', 0)
            
            results.append(result)
        
        total_cases = len(test_cases)
        
        return {
            'test_cases_passed': passed_count,
            'total_test_cases': total_cases,
            'test_case_results': results,
            'execution_time_ms': total_time / total_cases if total_cases > 0 else 0,
            'memory_used_mb': total_memory / total_cases if total_cases > 0 else 0,
            'all_passed': passed_count == total_cases
        }

