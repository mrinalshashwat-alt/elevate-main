'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  NavigateBefore,
  NavigateNext,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { submitTest } from '../../api/user';

const Test = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
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
    mutationFn: () => submitTest(courseId, answers),
    onSuccess: () => {
      setShowResults(true);
    },
  });

  const handleAnswer = (answer) => {
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

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="sm">
          <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', p: 6, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Test Completed!
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your Score: 85%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Great job! You passed the test.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/user/courses')}
                >
                  Back to Courses
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => router.push('/user/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push(`/user/content/${courseId}`)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Course Test
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Question {currentQuestion + 1} of {questions.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Object.keys(answers).length} answered
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
              {questions[currentQuestion].question}
            </Typography>

            <FormControl fullWidth>
              <RadioGroup
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
              >
                {questions[currentQuestion].options.map((option, idx) => (
                  <Card
                    key={idx}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: answers[currentQuestion] === option ? '2px solid' : '1px solid',
                      borderColor: answers[currentQuestion] === option ? 'primary.main' : 'divider',
                      bgcolor: answers[currentQuestion] === option ? 'rgba(255, 107, 53, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    onClick={() => handleAnswer(option)}
                  >
                    <FormControlLabel
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Card>
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<NavigateBefore />}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  endIcon={submitMutation.isPending && <CircularProgress size={20} />}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Test'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  endIcon={<NavigateNext />}
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Test;

