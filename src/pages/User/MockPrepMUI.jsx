'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  CircularProgress,
  CardActions,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMockInterviews } from '../../api/user';

const MockPrepMUI = () => {
  const router = useRouter();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ['mockInterviews'],
    queryFn: getMockInterviews,
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push('/user/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mock Prep
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Practice Interviews & Assessments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Prepare for your next interview with AI-powered mock sessions
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {interviews?.map((interview) => (
              <Grid item xs={12} sm={6} md={4} key={interview.id}>
                <Card
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Chip
                        label={interview.difficulty}
                        size="small"
                        color={
                          interview.difficulty === 'easy' ? 'success' :
                          interview.difficulty === 'medium' ? 'warning' :
                          'error'
                        }
                      />
                      <Typography variant="caption" color="text.secondary">
                        {interview.duration}
                      </Typography>
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      {interview.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {interview.type}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                    >
                      Start Practice
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MockPrepMUI;



