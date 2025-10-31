"""
OpenAI Integration for Question Generation
"""
import openai
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    """Service for generating questions using OpenAI GPT-4"""
    
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY
        self.model = settings.AI_MODEL
    
    def generate_mcq_questions(self, topic, difficulty, count=5, options_count=4):
        """
        Generate multiple choice questions.
        
        Args:
            topic: Subject/topic for questions
            difficulty: 1-5 difficulty level
            count: Number of questions to generate
            options_count: Number of options per question
        
        Returns:
            list: Generated questions
        """
        prompt = f"""Generate {count} multiple choice questions about {topic}.
Difficulty level: {difficulty}/5 (1=very easy, 5=very hard)
Each question should have {options_count} options with exactly one correct answer.

Return a JSON array of questions with this exact format:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Why this answer is correct",
    "difficulty": {difficulty},
    "tags": ["tag1", "tag2"]
  }}
]

Make questions challenging, relevant, and educational."""
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert educator creating high-quality assessment questions. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Parse JSON response
            questions = json.loads(content)
            
            # Convert to our question format
            formatted_questions = []
            for q in questions:
                formatted_questions.append({
                    'type': 'mcq',
                    'content': {
                        'question': q['question'],
                        'options': q['options'],
                        'correct_answer': q['correct_answer'],
                        'explanation': q.get('explanation', '')
                    },
                    'scoring': {'max_marks': 2},
                    'difficulty': q.get('difficulty', difficulty),
                    'tags': q.get('tags', [topic]),
                    'source': 'ai'
                })
            
            return formatted_questions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI response: {str(e)}")
            raise Exception("AI generated invalid response format")
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise
    
    def generate_coding_question(self, topic, difficulty, include_test_cases=5):
        """
        Generate a coding question with test cases.
        
        Args:
            topic: Programming topic/concept
            difficulty: 1-5 difficulty level
            include_test_cases: Number of test cases to generate
        
        Returns:
            dict: Generated coding question
        """
        prompt = f"""Create a coding problem about {topic}.
Difficulty: {difficulty}/5

Return a JSON object with this exact format:
{{
  "title": "Problem Title",
  "problem_statement": "Detailed problem description",
  "input_format": "Description of input format",
  "output_format": "Description of output format",
  "constraints": "Input constraints and limits",
  "sample_input": "Example input",
  "sample_output": "Example output",
  "test_cases": [
    {{"input": "test input", "output": "expected output", "is_hidden": false}},
    {{"input": "test input 2", "output": "expected output 2", "is_hidden": true}}
  ],
  "time_limit_ms": 2000,
  "memory_limit_mb": 256,
  "difficulty": {difficulty},
  "tags": ["tag1", "tag2"]
}}

Include {include_test_cases} test cases (mix of public and hidden).
Make the problem clear, well-structured, and solvable."""
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert competitive programming problem setter. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=2500
            )
            
            content = response.choices[0].message.content
            question_data = json.loads(content)
            
            # Format for our system
            return {
                'type': 'coding',
                'content': {
                    'title': question_data['title'],
                    'problem_statement': question_data['problem_statement'],
                    'input_format': question_data.get('input_format', ''),
                    'output_format': question_data.get('output_format', ''),
                    'constraints': question_data.get('constraints', ''),
                    'sample_input': question_data.get('sample_input', ''),
                    'sample_output': question_data.get('sample_output', ''),
                    'test_cases': question_data['test_cases'],
                    'time_limit_ms': question_data.get('time_limit_ms', 2000),
                    'memory_limit_mb': question_data.get('memory_limit_mb', 256)
                },
                'scoring': {
                    'max_marks': 25,
                    'partial_marks_enabled': True
                },
                'difficulty': question_data.get('difficulty', difficulty),
                'tags': question_data.get('tags', [topic]),
                'source': 'ai'
            }
            
        except Exception as e:
            logger.error(f"Error generating coding question: {str(e)}")
            raise
    
    def generate_subjective_question(self, topic, difficulty, expected_length=300):
        """
        Generate a subjective (essay) question.
        
        Args:
            topic: Subject area
            difficulty: 1-5 difficulty level
            expected_length: Expected answer length in words
        
        Returns:
            dict: Generated subjective question
        """
        prompt = f"""Create a subjective/essay question about {topic}.
Difficulty: {difficulty}/5
Expected answer length: {expected_length} words

Return a JSON object with this format:
{{
  "question": "The question text with clear instructions",
  "rubric": "Grading rubric - what a good answer should cover",
  "expected_length": {expected_length},
  "difficulty": {difficulty},
  "tags": ["tag1", "tag2"]
}}

Make it thought-provoking and assess deep understanding."""
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert educator creating assessment questions. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=1000
            )
            
            content = response.choices[0].message.content
            question_data = json.loads(content)
            
            return {
                'type': 'subjective',
                'content': {
                    'question': question_data['question'],
                    'expected_length': question_data.get('expected_length', expected_length),
                    'rubric': question_data.get('rubric', '')
                },
                'scoring': {'max_marks': 10},
                'difficulty': question_data.get('difficulty', difficulty),
                'tags': question_data.get('tags', [topic]),
                'source': 'ai'
            }
            
        except Exception as e:
            logger.error(f"Error generating subjective question: {str(e)}")
            raise

