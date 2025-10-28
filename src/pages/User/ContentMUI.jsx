'use client';

import React from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  PlayArrow,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { getCourseContent } from '../../api/user';

const ContentMUI = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId;

  const { data: content, isLoading } = useQuery({
    queryKey: ['courseContent', courseId],
    queryFn: () => getCourseContent(courseId),
    enabled: !!courseId,
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push('/user/courses')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Course Content
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Course Modules Sidebar */}
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)', position: 'sticky', top: 100 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Course Modules
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {content?.modules?.map((module, idx) => (
                      <Paper
                        key={module.id}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          bgcolor: module.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid',
                          borderColor: module.completed ? 'success.main' : 'divider',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {module.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {module.duration}
                            </Typography>
                          </Box>
                          {module.completed && (
                            <CheckCircle color="success" />
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Content Area */}
            <Grid item xs={12} md={8}>
              <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" gutterBottom fontWeight="bold">
                    {content?.title}
                  </Typography>
                  
                  {/* Video Player Placeholder */}
                  <Box
                    sx={{
                      bgcolor: 'black',
                      borderRadius: 2,
                      aspectRatio: '16/9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <PlayArrow sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.3)' }} />
                      <Typography variant="body2" color="text.secondary">
                        Video content will be displayed here
                      </Typography>
                    </Box>
                  </Box>

                  {/* Content Description */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      About this module
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      This is a placeholder for the course content. In production, this would display the actual course materials, videos, and interactive elements.
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      You can integrate video players, PDF viewers, code editors, and other interactive learning tools here.
                    </Typography>
                  </Box>

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<NavigateBefore />}
                    >
                      Previous Module
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => router.push(`/user/test/${courseId}`)}
                      endIcon={<PlayArrow />}
                    >
                      Take Test
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ContentMUI;



