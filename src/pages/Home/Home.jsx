'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, useScroll, useSpring, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { FiEye, FiEyeOff, FiX, FiCheck, FiLoader } from 'react-icons/fi';

// Custom Hooks
const useTypewriter = (text, speed = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
};

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { 
    opacity: 1, 
    x: 0
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { 
    opacity: 1, 
    x: 0
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const Home = () => {
  const router = useRouter();
  const { login } = useAuth();
  
  // State management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isTestimonialVideoPlaying, setIsTestimonialVideoPlaying] = useState({});
  const testimonialVideoRefs = useRef({});
  
  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Typewriter effect for hero
  const { displayText: heroText } = useTypewriter('Elevate Your Career', 100);

  // Refs for animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const achievementsRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.2 });
  const achievementsInView = useInView(achievementsRef, { once: true, amount: 0.2 });

  // Data arrays
  const carouselItems = [
    {
      title: "AI Communication Coach",
      description: "Master professional communication with AI-powered feedback and personalized coaching sessions for interviews and presentations.",
      buttonText: "Try Now",
      gradient: "from-blue-500 to-purple-600",
      videoSrc: "video1.mp4",
      route: "/user/ai-communication"
    },
    {
      title: "AI Mock Interview",
      description: "Practice realistic interviews with AI agents tailored to your field, experience level, and target companies.",
      buttonText: "Try Now",
      gradient: "from-green-500 to-teal-600",
      videoSrc: "video3.mp4",
      route: "/user/ai-mock-interview"
    },
    {
      title: "AI Career Guide",
      description: "Get personalized career advice, planning, and strategic guidance for your professional journey and growth.",
      buttonText: "Try Now",
      gradient: "from-orange-500 to-red-600",
      videoSrc: "video3.mp4",
      route: "/user/ai-career-coach"
    },
    {
      title: "Coder Arena",
      description: "Sharpen your coding skills with interactive challenges, contests, algorithm practice and real-time feedback.",
      buttonText: "Try Now",
      gradient: "from-purple-500 to-pink-600",
      videoSrc: "video2.mp4",
      route: "/user/courses"
    },
    {
      title: "Interview Prep Hub",
      description: "Comprehensive interview preparation with curated resources, mock tests, industry insights and expert tips.",
      buttonText: "Try Now",
      gradient: "from-indigo-500 to-blue-600",
      videoSrc: "video2.mp4",
      route: "/user/mock-prep"
    }
  ];

  const featuresData = [
    {
      title: "AI Career Coach – Discover Your Best-Fit Career",
      description: "87% of students and professionals fail to identify roles that truly fit their skills and values. Our AI-powered Career Coach analyzes your strengths, competencies, work-life values, and cultural fit.",
      statistics: "72% higher clarity | 65% increase in satisfaction",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "AI Mock Interview Agent – Real-Time Practice",
      description: "76% of candidates underperform in interviews due to lack of practice. The AI Mock Interview Agent creates realistic simulations with instant, personalized feedback.",
      statistics: "91% skill improvement | 3x higher success",
      icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      title: "AI Communication Coach – Master Professional Skills",
      description: "68% of hiring managers cite poor communication as the #1 reason candidates fail. Our AI Communication Coach helps practice grammar, fluency, tone, and scenarios.",
      statistics: "80% fluency improvement | 63% confidence boost",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Mock Interview Hub – Practice Makes Perfect",
      description: "Step into your next interview with confidence! Our AI-driven mock interviews provide personalized feedback, helping you refine skills and perfect answers.",
      statistics: "78% better impressions | 64% faster offers",
      icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Coder Arena – Sharpen Technical Skills",
      description: "7 out of 10 tech candidates struggle with coding rounds. Practice algorithm challenges, data structures, and mock technical tests in real-time.",
      statistics: "60% faster coding | 85% better chances",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      title: "AI Resume Builder – ATS-Optimized Perfection",
      description: "85% of resumes get rejected by ATS systems. Our AI Resume Builder creates perfectly formatted, keyword-optimized resumes that pass filters.",
      statistics: "89% callback increase | 73% faster responses",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      gradient: "from-teal-500 to-cyan-600"
    }
  ];

  const achievementsData = [
    {
      number: "50000",
      label: "Students Placed",
      description: "Successfully placed in top companies",
      color: "from-green-400 to-emerald-600"
    },
    {
      number: "91",
      label: "Success Rate",
      description: "Average career improvement rate",
      color: "from-blue-400 to-indigo-600"
    },
    {
      number: "500",
      label: "Partner Companies",
      description: "Leading organizations worldwide",
      color: "from-purple-400 to-pink-600"
    },
    {
      number: "24",
      label: "AI Support",
      description: "Round-the-clock assistance",
      color: "from-orange-400 to-red-600"
    },
    {
      number: "10000",
      label: "Active Users",
      description: "Monthly active users",
      color: "from-cyan-400 to-blue-600"
    }
  ];

  const testimonialsData = [
    {
      name: "Chandrashekhar Rao",
      role: "Senior Software Engineer",
      location: "Bangalore",
      content: "ElevateCareer has transformed my career trajectory. The AI-powered mock interviews were incredibly realistic, and the personalized feedback helped me identify and improve my weak areas. I landed my dream job at a top tech company with a 40% salary increase!",
      avatar: "C",
      videoUrl: "/video.mp4"
    },
    {
      name: "Arpad Czimbalmos",
      role: "Product Owner",
      location: "US",
      content: "The platform's AI-driven career guidance was spot-on. It analyzed my skills and suggested career paths I hadn't considered. The resume optimization feature alone increased my interview callbacks by 300%. Highly recommended!",
      avatar: "A",
      videoUrl: "/video.mp4"
    },
    {
      name: "Jeff Henry",
      role: "Product Manager",
      location: "US",
      content: "As someone transitioning into product management, ElevateCareer's structured learning paths and AI mentorship were invaluable. The mock interviews prepared me for real scenarios, and I successfully made the career switch with confidence.",
      avatar: "J",
      videoUrl: "/video.mp4"
    },
    {
      name: "Drew Edwards",
      role: "Senior Software Engineer",
      location: "US",
      content: "The coding challenges and technical interview prep on ElevateCareer are exceptional. The AI feedback on my solutions helped me improve my problem-solving approach. I aced multiple interviews and now work at a leading FAANG company.",
      avatar: "D",
      videoUrl: "/video.mp4"
    },
    {
      name: "Vikrant Dhawan",
      role: "VP of Data Science",
      location: "Wells Fargo",
      content: "ElevateCareer's data science track is comprehensive and practical. The hands-on projects and AI-powered skill assessments gave me the confidence to pursue leadership roles. The platform's industry connections opened doors I didn't know existed.",
      avatar: "V",
      videoUrl: "/video.mp4"
    },
    {
      name: "Ritesh Joshi",
      role: "Co-Founder & CEO",
      location: "Anyaudit.in",
      content: "As an entrepreneur, I used ElevateCareer to build my technical team. The candidate screening tools and skill verification features helped us hire top talent efficiently. It's now an integral part of our recruitment process.",
      avatar: "R",
      videoUrl: "/video.mp4"
    },
    {
      name: "Vaishnavi Paturu",
      role: "Product Owner",
      location: "Oragano Urban Living",
      content: "The communication skills training on ElevateCareer was transformative. The AI-powered feedback on my presentation and leadership skills helped me excel in product management. I successfully led multiple high-impact projects.",
      avatar: "V",
      videoUrl: "/video.mp4"
    }
  ];

  // Auto-advance carousels
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % Math.ceil(featuresData.length / 2));
    }, 6000);
    return () => clearInterval(interval);
  }, [featuresData.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialsData.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAchievementIndex(prev => (prev + 1) % achievementsData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [achievementsData.length]);

  const toggleTestimonialVideo = (index) => {
    const videoRef = testimonialVideoRefs.current[index];
    if (videoRef) {
      if (isTestimonialVideoPlaying[index]) {
        videoRef.pause();
        setIsTestimonialVideoPlaying(prev => ({ ...prev, [index]: false }));
      } else {
        videoRef.play();
        setIsTestimonialVideoPlaying(prev => ({ ...prev, [index]: true }));
      }
    }
  };

  const scrollToTestimonials = (e) => {
    e.preventDefault();
    document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      await login(email, password, loginRole);
      setLoginSuccess(true);
      
      setTimeout(() => {
        if (loginRole === 'user') {
          router.push('/user/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openLoginModal = (role) => {
    setLoginRole(role);
    setShowLoginModal(true);
    setLoginError('');
    setLoginSuccess(false);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setLoginError('');
    setLoginSuccess(false);
  };

  const getAchievementPosition = (index) => {
    const relativePos = (index - currentAchievementIndex + achievementsData.length) % achievementsData.length;
    
    switch(relativePos) {
      case 0: return { x: 0, z: 100, rotateY: 0, opacity: 1, scale: 1.1 };
      case 1: return { x: 120, z: 50, rotateY: -10, opacity: 0.9, scale: 0.95 };
      case 2: return { x: 240, z: 0, rotateY: -20, opacity: 0.7, scale: 0.9 };
      case 3: return { x: -120, z: 50, rotateY: 10, opacity: 0.9, scale: 0.95 };
      case 4: return { x: -240, z: 0, rotateY: 20, opacity: 0.7, scale: 0.9 };
      default: return { x: 0, z: 0, rotateY: 0, opacity: 0.5, scale: 0.8 };
    }
  };

  const navigateToFeature = (route) => {
    router.push(route);
  };

  const handleLearnMore = (featureTitle) => {
    const routeMap = {
      "AI Career Coach – Discover Your Best-Fit Career": "/user/ai-career-coach",
      "AI Mock Interview Agent – Real-Time Practice": "/user/ai-mock-interview",
      "AI Communication Coach – Master Professional Skills": "/user/ai-communication",
      "Mock Interview Hub – Practice Makes Perfect": "/user/mock-prep",
      "Coder Arena – Sharpen Technical Skills": "/user/courses",
      "AI Resume Builder – ATS-Optimized Perfection": "/user/dashboard"
    };
    
    const route = routeMap[featureTitle] || "/user/dashboard";
    router.push(route);
  };

  return (
    <div className="font-sans overflow-x-hidden bg-black min-h-screen relative">

      {/* Three.js Neuron Chain Particle System */}
      <canvas 
        ref={(canvas) => {
          if (!canvas || typeof window === 'undefined') return;
          
          const initThree = () => {
            if (typeof window.THREE === 'undefined') {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
              script.onload = () => setupScene();
              document.head.appendChild(script);
            } else {
              setupScene();
            }
          };

          const setupScene = () => {
            const THREE = window.THREE;
            if (!THREE || !canvas) return;

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ 
              canvas, 
              alpha: true, 
              antialias: false,
              powerPreference: "high-performance"
            });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.setClearColor(0x000000, 0);

            const neuronCount = 50;
            const maxConnections = 3;
            const connectionDistance = 6;

            const neurons = [];

            for (let i = 0; i < neuronCount; i++) {
              neurons.push({
                position: new THREE.Vector3(
                  (Math.random() - 0.5) * 30,
                  (Math.random() - 0.5) * 30,
                  (Math.random() - 0.5) * 15
                ),
                velocity: new THREE.Vector3(
                  (Math.random() - 0.5) * 0.03,
                  (Math.random() - 0.5) * 0.03,
                  (Math.random() - 0.5) * 0.015
                )
              });
            }

            const neuronGeometry = new THREE.SphereGeometry(0.12, 6, 6);
            const neuronMaterial = new THREE.MeshBasicMaterial({
              color: 0xF97316,
              transparent: true,
              opacity: 0.9
            });

            const neuronMeshes = [];
            neurons.forEach(() => {
              const mesh = new THREE.Mesh(neuronGeometry, neuronMaterial);
              neuronMeshes.push(mesh);
              scene.add(mesh);
            });

            const connectionMaterial = new THREE.LineBasicMaterial({
              color: 0xF97316,
              transparent: true,
              opacity: 0.3
            });

            const maxLines = neuronCount * maxConnections;
            const linePool = [];
            
            for (let i = 0; i < maxLines; i++) {
              const geometry = new THREE.BufferGeometry();
              const positions = new Float32Array(6);
              geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
              const line = new THREE.Line(geometry, connectionMaterial.clone());
              line.visible = false;
              linePool.push(line);
              scene.add(line);
            }

            const pulseGeometry = new THREE.SphereGeometry(0.06, 4, 4);
            const pulseMaterial = new THREE.MeshBasicMaterial({
              color: 0xFB923C,
              transparent: true,
              opacity: 0.8
            });

            const pulses = [];
            for (let i = 0; i < 8; i++) {
              const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
              pulses.push({
                mesh,
                fromIndex: Math.floor(Math.random() * neuronCount),
                toIndex: Math.floor(Math.random() * neuronCount),
                progress: Math.random(),
                speed: 0.008 + Math.random() * 0.012
              });
              scene.add(mesh);
            }

            camera.position.z = 12;

            let animationId;
            let frameCount = 0;

            const animate = () => {
              frameCount++;

              neurons.forEach((neuron, index) => {
                neuron.position.add(neuron.velocity);

                if (Math.abs(neuron.position.x) > 15) {
                  neuron.velocity.x *= -1;
                  neuron.position.x = Math.sign(neuron.position.x) * 15;
                }
                if (Math.abs(neuron.position.y) > 15) {
                  neuron.velocity.y *= -1;
                  neuron.position.y = Math.sign(neuron.position.y) * 15;
                }
                if (Math.abs(neuron.position.z) > 8) {
                  neuron.velocity.z *= -1;
                  neuron.position.z = Math.sign(neuron.position.z) * 8;
                }

                neuronMeshes[index].position.copy(neuron.position);
              });

              if (frameCount % 2 === 0) {
                let lineIndex = 0;
                
                linePool.forEach(line => line.visible = false);

                for (let i = 0; i < neuronCount && lineIndex < maxLines; i++) {
                  let connectionCount = 0;
                  
                  for (let j = i + 1; j < neuronCount && connectionCount < maxConnections && lineIndex < maxLines; j++) {
                    const distance = neurons[i].position.distanceTo(neurons[j].position);
                    
                    if (distance < connectionDistance) {
                      const line = linePool[lineIndex];
                      const positions = line.geometry.attributes.position.array;
                      
                      positions[0] = neurons[i].position.x;
                      positions[1] = neurons[i].position.y;
                      positions[2] = neurons[i].position.z;
                      positions[3] = neurons[j].position.x;
                      positions[4] = neurons[j].position.y;
                      positions[5] = neurons[j].position.z;
                      
                      line.geometry.attributes.position.needsUpdate = true;
                      line.material.opacity = Math.max(0, 0.4 * (1 - distance / connectionDistance));
                      line.visible = true;
                      
                      lineIndex++;
                      connectionCount++;
                    }
                  }
                }
              }

              pulses.forEach(pulse => {
                pulse.progress += pulse.speed;
                
                if (pulse.progress >= 1) {
                  pulse.progress = 0;
                  pulse.fromIndex = Math.floor(Math.random() * neuronCount);
                  pulse.toIndex = Math.floor(Math.random() * neuronCount);
                }

                const from = neurons[pulse.fromIndex].position;
                const to = neurons[pulse.toIndex].position;
                pulse.mesh.position.lerpVectors(from, to, pulse.progress);
              });

              scene.rotation.y += 0.0003;

              renderer.render(scene, camera);
              animationId = requestAnimationFrame(animate);
            };

            animate();

            const handleResize = () => {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            const handleVisibilityChange = () => {
              if (document.hidden) {
                cancelAnimationFrame(animationId);
              } else {
                animate();
              }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
              window.removeEventListener('resize', handleResize);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
              cancelAnimationFrame(animationId);
              
              linePool.forEach(line => {
                scene.remove(line);
                line.geometry.dispose();
                line.material.dispose();
              });
              neuronMeshes.forEach(mesh => scene.remove(mesh));
              pulses.forEach(pulse => scene.remove(pulse.mesh));
              
              neuronGeometry.dispose();
              neuronMaterial.dispose();
              pulseGeometry.dispose();
              pulseMaterial.dispose();
              connectionMaterial.dispose();
              renderer.dispose();
            };
          };

          initThree();
        }}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 15, opacity: 0.65 }}
      />

      {/* Header with Navigation Dropdowns */}
      <motion.header 
        className="fixed top-0 w-full z-[150] transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <button className="flex items-center space-x-3 filter drop-shadow-lg">
              <img 
                src="/logo.jpg" 
                alt="Elevate Career AI Logo" 
                className="w-28 h-28 object-contain"
              />
            </button>
          </motion.div>

          <div className="glass-stripe flex items-center space-x-4 rounded-full px-4 py-2 relative z-[100] shadow-card-elevated">
            <div className="relative group">
              <button className="nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-400 font-medium text-sm">
                AI Mock Agents
                <svg className="inline ml-1 w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[200] mt-2 pointer-events-none group-hover:pointer-events-auto">
                <a href="/user/ai-communication" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Communication Coach</a>
                <a href="/user/ai-mock-interview" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Mock Interview Agent</a>
                <a href="/user/ai-career-coach" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Career Guide</a>
              </div>
            </div>

            <div className="relative group">
              <button className="nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-400 font-medium text-sm">
                Mock Prep
                <svg className="inline ml-1 w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[200] mt-2 pointer-events-none group-hover:pointer-events-auto">
                <a href="/user/courses" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Coder Arena</a>
                <a href="/user/mock-prep" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Interview Prep</a>
                <a href="/user/ai-mock-interview" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Mock Interviews</a>
                <a href="/user/ai-communication" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Communication Practice</a>
              </div>
            </div>

            <div className="relative group">
              <button className="nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-400 font-medium text-sm">
                Exam Prep
                <svg className="inline ml-1 w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[200] mt-2 pointer-events-none group-hover:pointer-events-auto">
                <a href="/user/test" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Aptitude Prep</a>
                <a href="/user/content" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Exam Prep</a>
              </div>
            </div>

            <div className="relative group">
              <button className="nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 hover:bg-orange-500/10 hover:text-orange-400 font-medium text-sm">
                Career Essentials
                <svg className="inline ml-1 w-3 h-3 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-[200] mt-2 pointer-events-none group-hover:pointer-events-auto">
                <a href="/user/ai-career-coach" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Career Guide</a>
                <a href="/user/ai-mock-interview" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Mock Interview</a>
                <a href="/user/ai-communication" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">AI Communication Coach</a>
                <a href="/user/mock-prep" className="block px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Interview Questions</a>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.button 
              onClick={() => openLoginModal('user')}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/90 rounded-full font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400/40"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              User Login
            </motion.button>
            <motion.button 
              onClick={() => openLoginModal('admin')}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold text-sm shadow-lg shadow-orange-500/30"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Admin Login
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Professional Redesign */}
      {/* Hero Section - Redesigned */}
<main ref={heroRef} className="min-h-screen flex items-center relative z-10 pt-20" id="hero">
  {/* Background Video */}
  <div className="absolute inset-0 w-full h-full overflow-hidden">
    <video
      src="/vdoo.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="w-full h-full object-cover"
    />
  </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-8 w-full relative z-20">
          {/* Left Side - Text Content Only */}
          <motion.div 
            className="max-w-2xl space-y-8"
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {/* Announcement Badge */}
            <motion.div 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm hover:bg-white/10 transition-all cursor-pointer group"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-white/80 group-hover:text-white transition-colors"></span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl lg:text-6xl font-black leading-[0.9] mb-6">
                <span className="text-orange-500">ELEVATE</span>
                <span className="text-white"> YOUR</span>
                <br />
                <span className="text-white">CAREER</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                Our AI powered platform connects academia to industry, offering targeted training, upskilling, and placements to help you secure your dream job.
              </p>
            </motion.div>

            {/* Feature Card with Carousel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="bg-gradient-to-br from-gray-900/90 to-black border-2 border-orange-500/40 rounded-2xl p-8 space-y-6 backdrop-blur-sm"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {carouselItems[currentSlide].title}
                  </h2>
                  <p className="text-base text-gray-300 leading-relaxed mb-2">
                    {carouselItems[currentSlide].description}
                  </p>
                  <p className="text-orange-400 font-semibold text-sm">
                    72% higher clarity | 65% increase in satisfaction
                  </p>
                </div>
                
                <div className="relative z-10">
                  <motion.button 
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-full font-bold text-base shadow-lg"
                    onClick={() => navigateToFeature(carouselItems[currentSlide].route)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    TRY NOW
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Indicators */}
            <motion.div className="flex gap-3" variants={fadeInUp}>
              {carouselItems.map((_, index) => (
                <motion.button
                  key={index}
                  className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-orange-500 w-16' 
                      : 'bg-gray-600 w-8'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </motion.div>

            {/* Bottom Action Buttons */}
            <motion.div 
              className="flex items-center space-x-6"
              variants={fadeInUp}
            >
              <motion.button 
                className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                GET STARTED
              </motion.button>
              <motion.button 
                className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                onClick={scrollToTestimonials}
                whileHover={{ x: 5 }}
              >
                <span className="text-2xl">▶</span>
                <span>See Our Product</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side - Brain Video (Floating) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[700px] pointer-events-none hidden lg:block">
            <video
              src="/brain.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain opacity-70"
            />
          </div>
        </div>

        {/* Scroll Indicator - Keep */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <motion.div 
              className="w-1.5 h-3 bg-white/50 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </main>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20" id="testimonials">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-4xl md:text-5xl font-black text-center mb-16 text-white"
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            What Our <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Users Say</span>
          </motion.h2>

          <div className="relative">
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
              onClick={() => setCurrentTestimonialIndex(prev => (prev - 1 + testimonialsData.length) % testimonialsData.length)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center"
              onClick={() => setCurrentTestimonialIndex(prev => (prev + 1) % testimonialsData.length)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-16">
              {[0, 1].map((offset) => {
                const index = (currentTestimonialIndex + offset) % testimonialsData.length;
                const testimonial = testimonialsData[index];
                const gradientClasses = [
                  'from-orange-400 to-red-500',
                  'from-blue-400 to-purple-500',
                  'from-green-400 to-teal-500',
                  'from-purple-400 to-pink-500',
                  'from-indigo-400 to-blue-500',
                  'from-teal-400 to-cyan-500',
                  'from-pink-400 to-rose-500'
                ];
                const gradientClass = gradientClasses[index % gradientClasses.length];

                return (
                  <motion.div 
                    key={index} 
                    className="gradient-card-orange p-8 rounded-3xl backdrop-blur-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {testimonial.videoUrl && (
                      <div className="relative mb-6 rounded-2xl overflow-hidden">
                        <video
                          ref={(el) => { testimonialVideoRefs.current[index] = el; }}
                          src={testimonial.videoUrl}
                          className="w-full h-48 object-cover"
                          loop
                          muted
                        />
                        <button
                          onClick={() => toggleTestimonialVideo(index)}
                          className="absolute inset-0 flex items-center justify-center bg-black/30"
                        >
                          <div className={`w-16 h-16 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center`}>
                            {isTestimonialVideoPlaying[index] ? (
                              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xl text-white">{testimonial.name}</h4>
                        <p className="text-sm text-orange-400 font-medium">{testimonial.role}</p>
                        <p className="text-xs text-gray-400">{testimonial.location}</p>
                      </div>
                    </div>
                    <p className="text-lg leading-relaxed text-gray-300 italic">"{testimonial.content}"</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Carousel with 3 Cards */}
      <section ref={featuresRef} className="py-20" id="features">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white"
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              Key Features of <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">ElevateCareer.AI</span>
            </motion.h2>
            <motion.p 
              className="text-xl max-w-3xl mx-auto mb-8 text-gray-300"
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              Experience cutting-edge AI-powered tools designed to accelerate your career growth
            </motion.p>
            
            {/* Success Rate Card */}
            <motion.div 
              className="glass-effect bg-gradient-to-r from-green-900/30 via-emerald-900/40 to-green-900/30 border-2 border-green-500/40 rounded-2xl p-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={featuresInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-green-300 mb-2">
                    Overall Success Rate: <span className="text-3xl text-green-200">91%</span>
                  </h3>
                  <p className="text-green-200 text-lg font-semibold">
                    ElevateCareer.Cloud users experience up to a <span className="text-white font-bold">91% increase</span> in their chances of landing a better job, building a stronger career path, and excelling in real-life job simulations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features Carousel - 2 Cards at Once */}
          <div className="overflow-hidden relative max-w-full">
            <motion.div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ 
                transform: `translateX(-${currentFeature * (100 / Math.ceil(featuresData.length / 2))}%)`,
                width: `${Math.ceil(featuresData.length / 2) * 100}%`
              }}
            >
              {featuresData.map((feature, index) => {
                const cardStyles = [
                  'gradient-card-orange card-glow-orange',
                  'gradient-card-blue card-glow-blue',
                  'gradient-card-green card-glow-green',
                  'gradient-card-orange card-glow-orange',
                  'gradient-card-blue card-glow-blue',
                  'gradient-card-green card-glow-green'
                ];
                const cardStyle = cardStyles[index % cardStyles.length];
                
                return (
                  <motion.div 
                    key={index} 
                    className={`${cardStyle} flex-shrink-0 p-8 min-h-[400px] flex flex-col justify-between mx-2 rounded-3xl shadow-card-elevated backdrop-blur-xl transition-all duration-500 hover:scale-[1.02]`}
                    style={{ 
                      width: `calc(${100 / Math.ceil(featuresData.length / 2) / 2}% - 16px)`,
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <div className="relative z-10">
                      <div className="mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                        <p className="text-orange-400 font-semibold text-sm mb-4">{feature.statistics}</p>
                      </div>
                      <p className="text-gray-300 text-base leading-relaxed">{feature.description}</p>
                    </div>
                    <button 
                      className="relative z-10 px-6 py-3 text-white font-semibold transition-all duration-300 hover:text-orange-400 flex items-center space-x-2 group mt-6"
                      onClick={() => handleLearnMore(feature.title)}
                    >
                      <span>Learn More</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          
          {/* Navigation dots */}
          <div className="flex justify-center space-x-3 mt-12">
            {Array.from({ length: Math.ceil(featuresData.length / 2) }).map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  index === currentFeature 
                    ? 'bg-orange-500 w-8 shadow-lg shadow-orange-500/50' 
                    : 'bg-gray-600'
                }`}
                onClick={() => setCurrentFeature(index)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section - Same Card Style */}
      <section className="py-20" id="why-choose" style={{ perspective: '1200px' }}>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-8 leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">ElevateCareer.Cloud?</span>
            </motion.h2>
            <motion.p 
              className="max-w-4xl mx-auto text-xl mb-8 text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Take control of your career with AI-powered features that outperform the competition.
            </motion.p>
          </div>

          {/* Comparison Cards Grid - Same Style as Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {[
              {
                title: "1. AI-Powered Career Coaching",
                subtitle: "Go beyond generic advice with AI-driven career roadmaps based on your strengths, competencies, and values.",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                competitor: "One-size-fits-all guidance with only 45% career fit accuracy",
                elevate: "Context-aware AI delivering 91% role alignment accuracy, with users reporting a 3.2x higher career satisfaction",
                cardStyle: "gradient-card-orange card-glow-orange"
              },
              {
                title: "2. Real-Time Mock Interviews & Feedback",
                subtitle: "Practice with real interview simulations and get instant insights to boost confidence and readiness.",
                icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
                competitor: "Feedback delays of 3–5 days, with only 48% relevance to real hiring scenarios",
                elevate: "92% skill improvement rate, 70% faster interview readiness, and 2.8x higher job offer conversions",
                cardStyle: "gradient-card-blue card-glow-blue"
              },
              {
                title: "3. AI Communication & Soft Skills Training",
                subtitle: "Strengthen your grammar, fluency, and workplace communication with personalized AI coaching.",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                competitor: "Outdated exercises with only 50% real-world application",
                elevate: "85% of users improve professional fluency, 67% make better recruiter impressions, and 74% gain higher confidence in presentations",
                cardStyle: "gradient-card-green card-glow-green"
              },
              {
                title: "4. Coder Arena – Technical Mastery Made Easy",
                subtitle: "Level up your coding with real-time challenges, algorithms, and interview prep tools.",
                icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
                competitor: "Static problem sets with <55% skill transferability to job interviews",
                elevate: "88% improvement in coding efficiency, 60% faster problem-solving speed, and 85% higher success rates in tech interview coding rounds",
                cardStyle: "gradient-card-orange card-glow-orange"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`${item.cardStyle} p-8 shadow-2xl rounded-3xl transition-all duration-600 hover:scale-103 hover:shadow-3xl backdrop-blur-xl`}
                style={{ transformStyle: 'preserve-3d' }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-orange-300">{item.title}</h3>
                      <p className="text-sm text-gray-400">{item.subtitle}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-red-900/20 rounded-xl border border-red-500/30">
                      <span className="text-red-400 text-xl font-bold">❌</span>
                      <div>
                        <p className="text-red-300 font-semibold">Competitors:</p>
                        <p className="text-sm text-gray-400">{item.competitor}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-900/20 rounded-xl border border-green-500/30">
                      <span className="text-green-400 text-xl font-bold">✅</span>
                      <div>
                        <p className="text-green-300 font-semibold">ElevateCareer:</p>
                        <p className="text-sm text-gray-400">{item.elevate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section - Clean Carousel */}
      <section ref={achievementsRef} className="py-20" id="achievements">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            className="text-4xl md:text-5xl font-black mb-16 text-center text-white"
            initial="hidden"
            animate={achievementsInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Our <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Achievements</span>
          </motion.h2>

          {/* Carousel Container */}
          <div className="relative overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ 
                transform: `translateX(-${currentAchievementIndex * (100 / 3)}%)`,
                width: `${(achievementsData.length / 3) * 100}%`
              }}
            >
              {achievementsData.map((achievement, index) => (
                <motion.div
                  key={index}
                  className="gradient-card-orange p-8 rounded-3xl backdrop-blur-xl shadow-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 flex-shrink-0 mx-4"
                  style={{ 
                    width: `calc(${100 / (achievementsData.length / 3) / 3}% - 32px)`,
                    minHeight: '300px'
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={achievementsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-center h-full flex flex-col justify-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                      <span className="text-white font-bold text-2xl">{index + 1}</span>
                    </div>
                    
                    {/* Number */}
                    <h3 className="text-4xl font-black text-white mb-3">
                      {achievement.label.includes('Rate') || achievement.label.includes('Support') ? (
                        <>{achievement.number}%</>
                      ) : (
                        <CountUp end={parseInt(achievement.number)} duration={2.5} separator="," suffix="+" />
                      )}
                    </h3>
                    
                    {/* Label */}
                    <p className="text-orange-400 font-bold text-lg mb-3">{achievement.label}</p>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center space-x-8 mt-12">
            <motion.button
              onClick={() => setCurrentAchievementIndex(prev => (prev - 1 + Math.ceil(achievementsData.length / 3)) % Math.ceil(achievementsData.length / 3))}
              className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex space-x-3">
              {Array.from({ length: Math.ceil(achievementsData.length / 3) }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentAchievementIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentAchievementIndex 
                      ? 'bg-orange-500 w-8 shadow-lg shadow-orange-500/50' 
                      : 'bg-gray-600 w-3'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <motion.button
              onClick={() => setCurrentAchievementIndex(prev => (prev + 1) % Math.ceil(achievementsData.length / 3))}
              className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Comprehensive Solutions Section */}
      <section className="py-20" id="solutions">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-6 leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Comprehensive <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Solutions</span>
            </motion.h2>
            <motion.p 
              className="text-xl max-w-3xl mx-auto text-gray-300"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Everything you need to accelerate your career journey in one integrated platform
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Targeted Training",
                description: "Personalized learning paths designed to bridge the gap between academia and industry requirements.",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                gradient: "gradient-card-orange card-glow-orange"
              },
              {
                title: "Upskilling",
                description: "Access to mock interviews, coding practice, and video interviews to sharpen your skills.",
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                gradient: "gradient-card-blue card-glow-blue"
              },
              {
                title: "Placement Assistance",
                description: "Connect with top companies and get assistance in securing your dream job.",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                gradient: "gradient-card-green card-glow-green"
              }
            ].map((solution, index) => (
              <motion.div 
                key={index}
                className={`${solution.gradient} p-10 rounded-3xl shadow-card-elevated backdrop-blur-xl`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <div className="space-y-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={solution.icon} />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">{solution.title}</h3>
                  <p className="leading-relaxed text-gray-300">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.jpg" 
                  alt="Elevate Career AI Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 max-w-xs">
                Empowering careers with AI-driven insights and personalized learning experiences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/user/ai-mock-interview" className="hover:text-orange-500 transition-colors">AI Mock Interviews</a></li>
                <li><a href="/user/ai-career-coach" className="hover:text-orange-500 transition-colors">Career Roadmap</a></li>
                <li><a href="/user/courses" className="hover:text-orange-500 transition-colors">Skill Assessment</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-sm text-gray-400">&copy; 2024 Elevate Career. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLoginModal}
          >
            <motion.div 
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {loginRole === 'user' ? 'User Login' : 'Admin Login'}
                </h2>
                <button
                  onClick={closeLoginModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {loginError && (
                <motion.div 
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {loginError}
                </motion.div>
              )}

              {loginSuccess && (
                <motion.div 
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiCheck className="w-5 h-5 mr-2" />
                  Login successful! Redirecting...
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || loginSuccess}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : loginSuccess ? (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    'Login'
                  )}
                </motion.button>
              </form>

              <p className="text-sm text-gray-400 mt-4 text-center">
                Demo: Use any email/password to login
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;