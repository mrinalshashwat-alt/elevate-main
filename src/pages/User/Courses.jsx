'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  LinearProgress,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Book,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getUserCourses } from '../../api/user';

const CoursesMUI = () => {
  const router = useRouter();
  const { data: courses, isLoading } = useQuery({
    queryKey: ['userCourses'],
    queryFn: getUserCourses,
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push('/user/dashboard')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Courses
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Your Learning Journey
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Continue learning and developing your skills
          </Typography>
        </Box>

        {isLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {courses?.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
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
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    <Book sx={{ fontSize: 80, color: 'white', opacity: 0.5 }} />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                      {course.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {course.duration}
                      </Typography>
                      <Chip
                        label={`${course.progress}% Complete`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={course.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'primary.main',
                        },
                      }}
                    />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => router.push(`/user/content/${course.id}`)}
                      sx={{ py: 1.5 }}
                    >
                      {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
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

export default CoursesMUI;

