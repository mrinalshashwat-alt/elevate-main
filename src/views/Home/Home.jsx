'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence, useScroll, useSpring, useInView, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import { FiEye, FiEyeOff, FiX, FiCheck, FiLoader, FiAward, FiStar, FiUsers, FiTrendingUp, FiClock, FiArrowRight, FiMessageSquare, FiUserCheck, FiCompass, FiCode, FiTarget, FiBriefcase, FiHome, FiZap, FiPackage } from 'react-icons/fi';

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

// Enhanced dynamic donut chart with animations and trend indicators
const Donut = ({ value = 75, size = 120, stroke = 12, label = '', color = '#FF5728', trendData = [], delay = 0 }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate trend data if not provided (slight upward trend with small variations)
  const defaultTrend = trendData.length > 0 ? trendData : Array.from({ length: 6 }, (_, i) => {
    const baseValue = value - 15 + (i * (100 - value + 15) / 5);
    // Small deterministic variation based on index (sin wave for smooth curve)
    const variation = Math.sin(i * 0.8) * 3;
    return Math.max(0, Math.min(100, baseValue + variation));
  });
  
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(animatedValue, 0), 100) / 100);
  
  // Get gradient colors based on base color
  const getGradientColors = (baseColor) => {
    if (baseColor === '#FF5728') return { from: '#FF5728', to: '#FF8A65' }; // Orange
    if (baseColor === '#133561' || baseColor === '#3B82F6') return { from: '#3B82F6', to: '#60A5FA' }; // Blue
    if (baseColor === '#FFAB00') return { from: '#FFAB00', to: '#FFC107' }; // Yellow
    return { from: baseColor, to: baseColor };
  };
  
  const { from, to } = getGradientColors(color);
  const gradientId = `donut-gradient-${color.replace('#', '')}-${size}`;
  
  // Animate value on mount and when value changes
  useEffect(() => {
    const duration = 1500 + delay * 200;
    const startTime = Date.now();
    const startValue = 0;
    const targetValue = value;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (targetValue - startValue) * eased);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, delay]);
  
  // Calculate trend points for mini sparkline
  const trendWidth = size * 0.6;
  const trendHeight = size * 0.25;
  const trendPadding = 8;
  const trendMax = Math.max(...defaultTrend, 100);
  const trendMin = Math.min(...defaultTrend, 0);
  const trendRange = trendMax - trendMin || 1;
  const pointSpacing = (trendWidth - trendPadding * 2) / (defaultTrend.length - 1);
  
  const trendPoints = defaultTrend.map((val, i) => {
    const x = trendPadding + i * pointSpacing;
    const y = trendHeight - ((val - trendMin) / trendRange) * (trendHeight - trendPadding * 2) - trendPadding;
    return { x, y, value: val };
  });
  
  const trendPath = trendPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center relative group"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} stopOpacity="1" />
              <stop offset="100%" stopColor={to} stopOpacity="0.8" />
            </linearGradient>
            <filter id={`glow-${gradientId}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background circle with subtle pattern */}
          <circle 
            cx={size/2} 
            cy={size/2} 
            r={radius} 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth={stroke} 
            fill="none"
          />
          
          {/* Animated progress circle with gradient */}
          <motion.circle
            cx={size/2}
            cy={size/2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: offset,
              filter: isHovered ? `url(#glow-${gradientId})` : 'none'
            }}
            transition={{ duration: 1.5 + delay * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
          
          {/* Inner glow effect on hover */}
          {isHovered && (
            <circle
              cx={size/2}
              cy={size/2}
              r={radius - stroke * 0.5}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.3}
              className="animate-pulse"
            />
          )}
          
          {/* Trend sparkline inside donut */}
          <g transform={`translate(${(size - trendWidth) / 2}, ${size * 0.38})`}>
            <defs>
              <linearGradient id={`trend-${gradientId}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={color} stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <motion.path
              d={trendPath}
              stroke={color}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.6}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.8 + delay * 0.1 }}
            />
            {/* Area fill under trend */}
            <motion.path
              d={`${trendPath} L ${trendPoints[trendPoints.length - 1].x} ${trendHeight} L ${trendPoints[0].x} ${trendHeight} Z`}
              fill={`url(#trend-${gradientId})`}
              opacity={0.3}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 0.8, delay: 1 + delay * 0.1 }}
            />
            {/* Trend points */}
            {trendPoints.map((point, i) => (
              <motion.circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={2}
                fill={color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 1.2 + delay * 0.1 + i * 0.05 }}
              />
            ))}
          </g>
          
          {/* Center value text */}
          <motion.text 
            x="50%" 
            y="45%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fill="#fff" 
            fontSize="18" 
            fontWeight="900"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + delay * 0.1 }}
          >
            {Math.round(animatedValue)}%
          </motion.text>
          
          {/* Percentage symbol */}
          <text 
            x="50%" 
            y="58%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            fill="rgba(255,255,255,0.5)" 
            fontSize="10" 
            fontWeight="600"
          >
            %
          </text>
        </svg>
        
        {/* Pulsing ring on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: color }}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Label with trend indicator */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-300 font-semibold tracking-wide block">{label}</span>
        {/* Trend indicator */}
        <div className="flex items-center justify-center gap-1 mt-1">
          <motion.svg 
            width="12" 
            height="8" 
            viewBox="0 0 12 8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + delay * 0.1 }}
          >
            <path 
              d="M 0 8 L 6 0 L 12 8" 
              fill={color} 
              opacity={0.7}
            />
          </motion.svg>
          <span className="text-[10px] text-gray-400 font-medium">
            {defaultTrend.length > 1 && defaultTrend[defaultTrend.length - 1] > defaultTrend[0] ? '+' : ''}
            {Math.round(((defaultTrend[defaultTrend.length - 1] || 0) - (defaultTrend[0] || 0)) / (defaultTrend.length - 1) * 10) / 10}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Premium gradient progress bar (alternative to donut)
const ProgressBar = ({ value = 91, height = 18, colorFrom = '#FF5728', colorTo = '#FFAB00' }) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className="w-full">
      <div className="w-full relative rounded-full overflow-hidden" style={{ height }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 8px, transparent 8px 16px)'
          }}
        />
        <div
          className="h-full rounded-full shadow-lg"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})`,
            boxShadow: '0 6px 20px rgba(255, 87, 40, 0.35)'
          }}
        />
      </div>
    </div>
  );
};

// Enhanced Dynamic Bar Chart Component with animations and interactions
const DetailedBarChart = ({
  data = [],
  width = 420,
  height = 160,
  color = '#FFAB00',
  id = 'barChart'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animatedData, setAnimatedData] = useState(data.map(() => 0));
  
  // Animate bars on mount and when data changes
  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const startValues = animatedData;
    const endValues = data;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      
      setAnimatedData(startValues.map((start, i) => 
        start + (endValues[i] - start) * eased
      ));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [data]);
  
  // Real-time data updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedData(prev => prev.map(val => {
        // Small random variation (±2%)
        const variation = (Math.random() - 0.5) * 4;
        return Math.max(0, Math.min(100, val + variation));
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  
  if (!data || data.length === 0) return null;
  const numericWidth = typeof width === 'number' ? width : 420;
  const padding = 20;
  const chartWidth = numericWidth - padding * 2;
  const chartHeight = height - padding * 2;
  const max = Math.max(...animatedData);
  const min = Math.min(...animatedData);
  const range = max - min || 1;
  const barWidth = chartWidth / data.length * 0.7;
  const gap = chartWidth / data.length * 0.3;
  
  const getBarHeight = (value) => ((value - min) / range) * chartHeight;
  const getBarX = (index) => padding + index * (chartWidth / data.length);
  
  return (
    <div 
      className="relative"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg width={numericWidth} height={height} viewBox={`0 0 ${numericWidth} ${height}`} className="block">
        <defs>
          <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Grid lines with animation */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (i * chartHeight / 4);
          return (
            <motion.line 
              key={`grid-${i}`} 
              x1={padding} 
              y1={y} 
              x2={numericWidth - padding} 
              y2={y} 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1" 
              strokeDasharray="2,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          );
        })}
        {/* Bars with hover effects */}
        {animatedData.map((value, index) => {
          const barHeight = getBarHeight(value);
          const x = getBarX(index);
          const y = height - padding - barHeight;
          const isHovered = hoveredIndex === index;
          
          return (
            <g 
              key={`bar-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              style={{ cursor: 'pointer' }}
            >
              <motion.rect
                x={x}
                y={height - padding}
                width={barWidth}
                height={0}
                fill={`url(#${id}-grad)`}
                rx="4"
                initial={{ height: 0 }}
                animate={{ 
                  height: barHeight,
                  y: y,
                  filter: isHovered ? `url(#${id}-glow)` : 'none',
                  scaleY: isHovered ? 1.05 : 1,
                  opacity: isHovered ? 1 : 0.9
                }}
                transition={{ 
                  height: { duration: 0.8, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
                  scaleY: { duration: 0.2 },
                  filter: { duration: 0.3 }
                }}
              />
              <motion.rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.min(barHeight, 4)}
                fill={color}
                rx="4"
                animate={{ opacity: isHovered ? 1 : 0.8 }}
              />
              {/* Hover highlight */}
              {isHovered && (
                <motion.circle
                  cx={x + barWidth / 2}
                  cy={y}
                  r="8"
                  fill={color}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              )}
            </g>
          );
        })}
        {/* Y-axis labels with animation */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = max - (i * range / 4);
          const y = padding + (i * chartHeight / 4);
          return (
            <motion.text
              key={`label-${i}`}
              x={padding - 8}
              y={y + 4}
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              textAnchor="end"
              fontWeight="600"
              initial={{ opacity: 0, x: padding - 18 }}
              animate={{ opacity: 1, x: padding - 8 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
            >
              {Math.round(value)}
            </motion.text>
          );
        })}
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          className="absolute pointer-events-none bg-black/90 border border-white/20 rounded-lg px-3 py-2 shadow-xl z-50"
          style={{
            left: `${getBarX(hoveredIndex) + barWidth / 2}px`,
            top: `${height - padding - getBarHeight(animatedData[hoveredIndex])}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-white text-xs font-bold" style={{ color }}>
            {Math.round(animatedData[hoveredIndex])}
          </div>
          <div className="text-gray-400 text-[10px] mt-0.5">
            Point {hoveredIndex + 1}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Enhanced Dynamic Line Chart with animations and interactions
const DetailedLineChart = ({
  points = [],
  width = 420,
  height = 160,
  color = '#3B82F6',
  id = 'lineChart',
  percentLabel
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animatedPoints, setAnimatedPoints] = useState(points.map(() => 0));
  
  // Animate points on mount and when data changes
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValues = animatedPoints;
    const endValues = points;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      
      setAnimatedPoints(startValues.map((start, i) => 
        start + (endValues[i] - start) * eased
      ));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [points]);
  
  // Real-time data updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPoints(prev => prev.map((val, i) => {
        const variation = (Math.random() - 0.5) * 6;
        const target = points[i];
        return Math.max(target - 20, Math.min(target + 20, val + variation));
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (!points || points.length === 0) return null;
  const numericWidth = typeof width === 'number' ? width : 420;
  const padding = 25;
  const chartWidth = numericWidth - padding * 2;
  const chartHeight = height - padding * 2;
  const max = Math.max(...animatedPoints);
  const min = Math.min(...animatedPoints);
  const range = max - min || 1;
  const norm = (v) => {
    return chartHeight - ((v - min) / range) * chartHeight;
  };
  const step = chartWidth / (points.length - 1);
  const linePath = animatedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * step},${padding + norm(p)}`).join(' ');
  const areaPath = `${linePath} L ${numericWidth - padding},${height - padding} L ${padding},${height - padding} Z`;
  
  return (
    <div 
      className="relative"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg width={numericWidth} height={height} viewBox={`0 0 ${numericWidth} ${height}`} className="block">
        <defs>
          <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Animated grid lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const y = padding + (i * chartHeight / 5);
          return (
            <motion.line 
              key={`grid-h-${i}`} 
              x1={padding} 
              y1={y} 
              x2={numericWidth - padding} 
              y2={y} 
              stroke="rgba(255,255,255,0.12)" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const x = padding + (i * chartWidth / 7);
          return (
            <motion.line 
              key={`grid-v-${i}`} 
              x1={x} 
              y1={padding} 
              x2={x} 
              y2={height - padding} 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
            />
          );
        })}
        {/* Animated area fill */}
        <motion.path 
          d={areaPath} 
          fill={`url(#${id}-area)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
        {/* Animated line */}
        <motion.path 
          d={linePath} 
          fill="none" 
          stroke={color} 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={hoveredIndex !== null ? `url(#${id}-glow)` : 'none'}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Interactive data points */}
        {animatedPoints.map((p, i) => {
          const x = padding + i * step;
          const y = padding + norm(p);
          const isHovered = hoveredIndex === i;
          
          return (
            <g 
              key={`point-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 8 : 5} 
                fill={color} 
                opacity={isHovered ? 1 : 0.8}
                animate={{ 
                  scale: isHovered ? 1.5 : 1,
                  r: isHovered ? 8 : 5
                }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              <motion.circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 5 : 3} 
                fill="#fff"
                animate={{ scale: isHovered ? 1.3 : 1 }}
              />
              <circle cx={x} cy={y} r="1.5" fill={color} />
              
              {/* Pulse effect on hover */}
              {isHovered && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill={color}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
        {/* Y-axis labels with animation */}
        {Array.from({ length: 6 }).map((_, i) => {
          const value = max - (i * (range / 5));
          const y = padding + (i * chartHeight / 5);
          return (
            <motion.text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 4}
              fill="rgba(255,255,255,0.6)"
              fontSize="11"
              textAnchor="end"
              fontWeight="600"
              initial={{ opacity: 0, x: padding - 20 }}
              animate={{ opacity: 1, x: padding - 10 }}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            >
              {Math.round(value)}
            </motion.text>
          );
        })}
        {/* Animated axes */}
        <motion.line 
          x1={padding} 
          y1={height - padding} 
          x2={numericWidth - padding} 
          y2={height - padding} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        <motion.line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
        {/* Percentage badge with animation */}
        {typeof percentLabel === 'number' && (
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <rect x={numericWidth - 85} y={12} rx="10" ry="10" width="75" height={32} fill={color} opacity="0.25" stroke={color} strokeWidth="1.5" />
            <text x={numericWidth - 47.5} y={33} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="900">{percentLabel}%</text>
          </motion.g>
        )}
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          className="absolute pointer-events-none bg-black/90 border border-white/20 rounded-lg px-3 py-2 shadow-xl z-50"
          style={{
            left: `${padding + hoveredIndex * step}px`,
            top: `${padding + norm(animatedPoints[hoveredIndex])}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-white text-xs font-bold" style={{ color }}>
            {Math.round(animatedPoints[hoveredIndex])}
          </div>
          <div className="text-gray-400 text-[10px] mt-0.5">
            Point {hoveredIndex + 1}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Enhanced Dynamic Area Chart with animations and interactions
const DetailedAreaChart = ({
  points = [],
  width = 420,
  height = 160,
  color = '#FFAB00',
  id = 'areaChart'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [animatedPoints, setAnimatedPoints] = useState(points.map(() => 0));
  
  // Animate points on mount and when data changes
  useEffect(() => {
    const duration = 1800;
    const startTime = Date.now();
    const startValues = animatedPoints;
    const endValues = points;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      
      setAnimatedPoints(startValues.map((start, i) => 
        start + (endValues[i] - start) * eased
      ));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [points]);
  
  // Real-time data updates every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPoints(prev => prev.map((val, i) => {
        const variation = (Math.random() - 0.5) * 8;
        const target = points[i];
        return Math.max(target - 25, Math.min(target + 25, val + variation));
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  
  if (!points || points.length === 0) return null;
  const numericWidth = typeof width === 'number' ? width : 420;
  const padding = 20;
  const chartWidth = numericWidth - padding * 2;
  const chartHeight = height - padding * 2;
  const max = Math.max(...animatedPoints);
  const min = Math.min(...animatedPoints);
  const range = max - min || 1;
  const norm = (v) => {
    return chartHeight - ((v - min) / range) * chartHeight;
  };
  const step = chartWidth / (points.length - 1);
  
  // Create smooth curve using quadratic bezier with animated points
  const createSmoothPath = (pts) => {
    let path = `M ${padding},${padding + norm(pts[0])}`;
    for (let i = 1; i < pts.length; i++) {
      const x1 = padding + (i - 1) * step;
      const x2 = padding + i * step;
      const y1 = padding + norm(pts[i - 1]);
      const y2 = padding + norm(pts[i]);
      const cpX = (x1 + x2) / 2;
      path += ` Q ${cpX},${y1} ${x2},${y2}`;
    }
    return path;
  };
  
  const smoothPath = createSmoothPath(animatedPoints);
  const areaPath = `${smoothPath} L ${numericWidth - padding},${height - padding} L ${padding},${height - padding} Z`;
  
  return (
    <div 
      className="relative"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <svg width={numericWidth} height={height} viewBox={`0 0 ${numericWidth} ${height}`} className="block">
        <defs>
          <linearGradient id={`${id}-area-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="50%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id={`${id}-glow`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Animated grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = padding + (i * chartHeight / 4);
          return (
            <motion.line 
              key={`grid-${i}`} 
              x1={padding} 
              y1={y} 
              x2={numericWidth - padding} 
              y2={y} 
              stroke="rgba(255,255,255,0.1)" 
              strokeWidth="1"
              strokeDasharray="3,3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            />
          );
        })}
        {/* Animated area fill */}
        <motion.path 
          d={areaPath} 
          fill={`url(#${id}-area-grad)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        {/* Animated smooth line with glow */}
        <motion.path 
          d={smoothPath} 
          fill="none" 
          stroke={color} 
          strokeWidth="3.5" 
          strokeLinecap="round"
          filter={hoveredIndex !== null ? `url(#${id}-glow)` : `url(#${id}-glow)`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Interactive highlight points */}
        {animatedPoints.map((p, i) => {
          if (i % 4 !== 0 && i !== animatedPoints.length - 1) return null;
          const x = padding + i * step;
          const y = padding + norm(p);
          const isHovered = hoveredIndex === i || (hoveredIndex !== null && Math.abs(hoveredIndex - i) < 2);
          
          return (
            <g 
              key={`highlight-${i}`}
              onMouseEnter={() => setHoveredIndex(i)}
              style={{ cursor: 'pointer' }}
            >
              <motion.circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 8 : 6} 
                fill={color} 
                opacity={isHovered ? 0.5 : 0.3}
                animate={{ 
                  scale: isHovered ? 1.3 : 1,
                  r: isHovered ? 8 : 6
                }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.circle 
                cx={x} 
                cy={y} 
                r={isHovered ? 6 : 4} 
                fill="#fff"
                animate={{ scale: isHovered ? 1.2 : 1 }}
              />
              <circle cx={x} cy={y} r="2" fill={color} />
              
              {/* Pulse effect on hover */}
              {isHovered && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={8}
                  fill={color}
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </g>
          );
        })}
      </svg>
      
      {/* Tooltip */}
      {hoveredIndex !== null && (
        <motion.div
          className="absolute pointer-events-none bg-black/90 border border-white/20 rounded-lg px-3 py-2 shadow-xl z-50"
          style={{
            left: `${padding + hoveredIndex * step}px`,
            top: `${padding + norm(animatedPoints[hoveredIndex])}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-white text-xs font-bold" style={{ color }}>
            {Math.round(animatedPoints[hoveredIndex])}
          </div>
          <div className="text-gray-400 text-[10px] mt-0.5">
            Point {hoveredIndex + 1}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Trading-style progressive height graph (sparkline/area)
const Sparkline = ({
  points = [],
  width = 420,
  height = 160,
  color = '#FF5728',
  id = 'sparkGrad',
  percentLabel
}) => {
  if (!points || points.length === 0) return null;
  const numericWidth = typeof width === 'number' ? width : 420;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = (v) => {
    const range = max - min || 1;
    return height - ((v - min) / range) * (height - 8) - 4; // padding top/bottom
  };
  const step = numericWidth / (points.length - 1);
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step},${norm(p)}`).join(' ');
  const areaPath = `${linePath} L ${numericWidth},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${numericWidth} ${height}`} className="block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* subtle grid */}
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`gh-${i}`} x1="0" y1={(i+1)*(height/5)} x2={numericWidth} y2={(i+1)*(height/5)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={`url(#${id})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* end point marker */}
      {(() => {
        const lastY = norm(points[points.length - 1]);
        const lastX = (points.length - 1) * step;
        return (
          <>
            <circle cx={lastX} cy={lastY} r="4.5" fill="#fff" />
            <circle cx={lastX} cy={lastY} r="3" fill={color} />
          </>
        );
      })()}
      {/* percentage badge */}
      {typeof percentLabel === 'number' && (
        <g>
          <rect x={numericWidth - 76} y={8} rx="8" ry="8" width="68" height="28" fill={color} opacity="0.2" />
          <text x={numericWidth - 42} y={27} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">{percentLabel}%</text>
        </g>
      )}
    </svg>
  );
};

const Home = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  
  // State management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [centerAchievementIndex, setCenterAchievementIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isTestimonialVideoPlaying, setIsTestimonialVideoPlaying] = useState({});
  const testimonialVideoRefs = useRef({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [currentWhyIndex, setCurrentWhyIndex] = useState(0);
  
  // Loading states
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isHeroVideoLoaded, setIsHeroVideoLoaded] = useState(false);
  const [isBrainVideoLoaded, setIsBrainVideoLoaded] = useState(false);
  const [videoLoadError, setVideoLoadError] = useState(false);
  
  // Login modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRole, setLoginRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // Signup modal state
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animation duration based on reduced motion preference
  const animationDuration = prefersReducedMotion ? 0.1 : 0.5;

  // Typewriter effect for hero
  const { displayText: heroText } = useTypewriter('Elevate Your Career', 100);

  // Refs for animations
  const heroRef = useRef(null);
  const heroEdgeRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const achievementsRef = useRef(null);



  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isHeroEdgeInView = useInView(heroEdgeRef, { margin: '-72px 0px 0px 0px' });
  const enableHeaderGlass = !isHeroEdgeInView; // glass after we pass hero edge
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
      number: "5000",
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
      number: "50",
      label: "Partner Companies",
      description: "Leading organizations worldwide",
      color: "from-purple-400 to-pink-600"
    },
    {
      number: "24/7",
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

  // Auto-advance carousels with reduced motion support
  useEffect(() => {
    if (prefersReducedMotion) return; // Don't auto-advance if user prefers reduced motion
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % Math.ceil(featuresData.length / 2));
    }, 12000);
    return () => clearInterval(interval);
  }, [featuresData.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonialIndex(prev => (prev + 1) % testimonialsData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonialsData.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentAchievementIndex(prev => (prev + 1) % achievementsData.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [achievementsData.length, prefersReducedMotion]);

  // Auto-advance center card in Achievements deck
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!achievementsData || achievementsData.length === 0) return;
    const interval = setInterval(() => {
      setCenterAchievementIndex(prev => (prev + 1) % achievementsData.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [achievementsData.length, prefersReducedMotion]);

  // Auto-advance for Why Choose carousel (moved below data definition)

  const whyChooseData = [
    {
      title: "1. AI-Powered Career Coaching",
      subtitle: "Go beyond generic advice with AI-driven career roadmaps based on your strengths, competencies, and values.",
      icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
      competitor: "",
      elevate: "Context-aware AI delivering 91% role alignment accuracy, with users reporting 3.2x higher career satisfaction",
      cardStyle: "gradient-card-orange card-glow-orange"
    },
    {
      title: "2. Real-Time Mock Interviews & Feedback",
      subtitle: "Practice with real interview simulations and get instant insights to boost confidence and readiness.",
      icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
      competitor: "",
      elevate: "92% skill improvement rate, 70% faster interview readiness, and 2.8x higher job offer conversions",
      cardStyle: "gradient-card-blue card-glow-blue"
    },
    {
      title: "3. AI Communication & Soft Skills Training",
      subtitle: "Strengthen your grammar, fluency, and workplace communication with personalized AI coaching.",
      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      competitor: "",
      elevate: "85% of users improve professional fluency, 67% make better recruiter impressions, and 74% gain higher confidence in presentations",
      cardStyle: "gradient-card-green card-glow-green"
    },
    {
      title: "4. Coder Arena – Technical Mastery Made Easy",
      subtitle: "Level up your coding with real-time challenges, algorithms, and interview prep tools.",
      icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
      competitor: "",
      elevate: "88% improvement in coding efficiency, 60% faster problem-solving speed, and 85% higher success rates in tech interview coding rounds",
      cardStyle: "gradient-card-orange card-glow-orange"
    },
    {
      title: "5. AI Resume Builder – ATS-Optimized Perfection",
      subtitle: "Create perfectly formatted, keyword-optimized resumes that pass ATS filters and get you noticed by recruiters.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      competitor: "",
      elevate: "89% callback increase, 73% faster response rate, and 4x higher interview invitation rate with AI-optimized resumes",
      cardStyle: "gradient-card-blue card-glow-blue"
    },
    {
      title: "6. Career Insights & Market Intelligence",
      subtitle: "Access real-time market trends, salary data, and industry insights to make informed career decisions.",
      icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      competitor: "",
      elevate: "Real-time market intelligence, 95% accuracy in salary predictions, and personalized career growth insights based on current trends",
      cardStyle: "gradient-card-green card-glow-green"
    }
  ];

  // Auto-advance for Why Choose carousel (2 cards per page)
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!whyChooseData || whyChooseData.length === 0) return;
    const interval = setInterval(() => {
      setCurrentWhyIndex(prev => (prev + 2) % whyChooseData.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, whyChooseData.length]);


  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      // Use a slight delay to allow navigation clicks to process first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [openDropdown]);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Handle navigation - direct navigation without auth check
  const handleNavigation = (route, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenDropdown(null);
    // Use window.location.href for immediate navigation
    // This ensures the route is navigated to regardless of router state
    window.location.href = route;
  };

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
    const testimonialsSection = document.getElementById('testimonials');
    if (testimonialsSection) {
      testimonialsSection.scrollIntoView({ 
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  };

  // Keyboard navigation for carousels
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => (prev - 1 + carouselItems.length) % carouselItems.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide(prev => (prev + 1) % carouselItems.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [carouselItems.length]);

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

  const openSignupModal = () => {
    setShowSignupModal(true);
    setSignupError('');
    setSignupSuccess(false);
  };

  const closeSignupModal = () => {
    setShowSignupModal(false);
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setConfirmPassword('');
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setSignupError('');
    setSignupSuccess(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess(false);

    if (signupPassword !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    setIsSignupLoading(true);
    try {
      // Mock signup - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful signup
      setSignupSuccess(true);
      
      // Close signup modal and open login modal after a short delay
      setTimeout(() => {
        closeSignupModal();
        setEmail(signupEmail); // Pre-fill email in login
        openLoginModal('user');
      }, 1500);
    } catch (error) {
      setSignupError('Signup failed. Please try again.');
    } finally {
      setIsSignupLoading(false);
    }
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
    <div className="font-sans overflow-x-hidden min-h-screen relative">

      {/* Header with Navigation Dropdowns */}
      <motion.header 
        className="fixed top-0 w-full z-[150] transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
        role="banner"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center space-x-3 filter drop-shadow-lg" 
              aria-label="Home"
            >
              <img 
                src="/logo.jpg" 
                alt="Elevate Career AI Logo" 
                className="w-20 h-20 md:w-28 md:h-28 object-contain"
              />
            </button>
          </motion.div>

          <nav
            ref={dropdownRef}
            className={`${enableHeaderGlass ? 'glass-stripe' : 'bg-transparent'} flex flex-wrap items-center justify-center gap-2 rounded-full px-2 md:px-4 py-2 relative z-[100]`}
            aria-label="Main navigation"
          >
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('ai-mock-agents')}
                onKeyDown={(e) => e.key === 'Escape' && setOpenDropdown(null)}
                aria-expanded={openDropdown === 'ai-mock-agents'}
                aria-haspopup="true"
                aria-label="AI Mock Agents menu"
                className={`nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-black ${
                  openDropdown === 'ai-mock-agents' ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-orange-500/10 hover:text-orange-400'
                }`}
              >
                AI Mock Agents
                <svg className={`inline ml-1 w-3 h-3 transition-transform duration-300 ${openDropdown === 'ai-mock-agents' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'ai-mock-agents' && (
                <div className="absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 z-[200] mt-2" role="menu">
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/ai-communication', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5 focus:outline-none focus:ring-2 focus:ring-orange-400" role="menuitem">AI Communication Coach</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/ai-mock-interview', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5 focus:outline-none focus:ring-2 focus:ring-orange-400" role="menuitem">AI Mock Interview Agent</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/ai-career-coach', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5 focus:outline-none focus:ring-2 focus:ring-orange-400" role="menuitem">AI Career Guide</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => toggleDropdown('mock-prep')}
                className={`nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                  openDropdown === 'mock-prep' ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-orange-500/10 hover:text-orange-400'
                }`}
              >
                Mock Prep
                <svg className={`inline ml-1 w-3 h-3 transition-transform duration-300 ${openDropdown === 'mock-prep' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 transition-all duration-300 z-[200] mt-2 ${
                openDropdown === 'mock-prep' 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible translate-y-2 pointer-events-none'
              }`}>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/courses', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Coder Arena</button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/mock-prep', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Interview Prep</button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/ai-mock-interview', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Mock Interviews</button>
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigation('/user/ai-communication', e); }} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Communication Practice</button>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => toggleDropdown('exam-prep')}
                className={`nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                  openDropdown === 'exam-prep' ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-orange-500/10 hover:text-orange-400'
                }`}
              >
                Exam Prep
                <svg className={`inline ml-1 w-3 h-3 transition-transform duration-300 ${openDropdown === 'exam-prep' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 transition-all duration-300 z-[200] mt-2 ${
                openDropdown === 'exam-prep' 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible translate-y-2 pointer-events-none'
              }`} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={(e) => handleNavigation('/user/test', e)} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Aptitude Prep</button>
                <button type="button" onClick={(e) => handleNavigation('/user/content', e)} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Exam Prep</button>
              </div>
            </div>

            <div className="relative">
              <button 
                onClick={() => toggleDropdown('course-prep')}
                className={`nav-link text-white px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                  openDropdown === 'course-prep' ? 'bg-orange-500/10 text-orange-400' : 'hover:bg-orange-500/10 hover:text-orange-400'
                }`}
              >
                Course Prep
                <svg className={`inline ml-1 w-3 h-3 transition-transform duration-300 ${openDropdown === 'course-prep' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`absolute top-full left-0 min-w-48 bg-black/95 backdrop-blur-lg border border-white/10 rounded-lg p-2 transition-all duration-300 z-[200] mt-2 ${
                openDropdown === 'course-prep' 
                  ? 'opacity-100 visible translate-y-0' 
                  : 'opacity-0 invisible translate-y-2 pointer-events-none'
              }`} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={(e) => handleNavigation('/user/technical', e)} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Technical</button>
                <button type="button" onClick={(e) => handleNavigation('/user/management', e)} className="block w-full text-left px-4 py-2 text-white/80 hover:text-orange-400 hover:bg-orange-500/10 rounded-md transition-all duration-200 text-sm border-l-2 border-transparent hover:border-orange-400 hover:pl-5">Management</button>
              </div>
            </div>
          </nav>

          <div className="flex space-x-2 md:space-x-3">
            <motion.button 
              onClick={() => router.push('/user/system-check')}
              className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 text-white/90 rounded-full font-medium text-xs md:text-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
              whileTap={{ scale: 0.95 }}
              aria-label="Assessment"
            >
              Assessment
            </motion.button>
            <motion.button 
              onClick={() => openLoginModal('user')}
              className="px-4 md:px-5 py-2 md:py-2.5 bg-white/5 border border-white/10 text-white/90 rounded-full font-medium text-xs md:text-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
              whileTap={{ scale: 0.95 }}
              aria-label="User login"
            >
              User Login
            </motion.button>
            <motion.button 
              onClick={openSignupModal}
              className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-semibold text-xs md:text-sm shadow-lg shadow-orange-500/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
              whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
              whileTap={{ scale: 0.95 }}
              aria-label="Sign up"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Professional Redesign */}
      {/* Hero Section - Redesigned */}
<main ref={heroRef} className="min-h-screen flex items-center relative z-10 pt-20 bg-transparent" id="hero">
  {/* Background Video (no overlays) */}
  <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
    <video
      src="/vdoo.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/img.png"
      onCanPlayThrough={() => setIsHeroVideoLoaded(true)}
      onLoadedData={() => setIsHeroVideoLoaded(true)}
      onError={() => setVideoLoadError(true)}
      className="w-full h-full object-cover"
      style={{ willChange: 'transform', transform: 'translateZ(0)', mixBlendMode: 'normal' }}
      aria-label="Background video"
    />
  </div>

  {/* Hero edge sentinel for enabling header glass after scroll */}
  <div ref={heroEdgeRef} className="absolute bottom-0 left-0 w-full h-1 pointer-events-none" />

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 w-full relative z-20">
          {/* Left Side - Text Content Only */}
          <motion.div 
            className="max-w-2xl space-y-6 md:space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Announcement Badge */}
            <motion.div 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all cursor-pointer group"
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
            >
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-sm text-white/80 group-hover:text-white transition-colors"></span>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={fadeInUp}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.9] mb-4 md:mb-6">
                <span className="text-orange-500">ELEVATE</span>
                <span className="text-white"> YOUR</span>
                <br />
                <span className="text-white">CAREER</span>
              </h1>
              <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed">
                Our AI powered platform connects academia to industry, offering targeted training, upskilling, and placements to help you secure your dream job.
              </p>
            </motion.div>

            {/* Feature Card with Carousel - Premium Style */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 md:p-8 space-y-4 md:space-y-5 overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                  transformStyle: 'preserve-3d'
                }}
                initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -50, rotateX: prefersReducedMotion ? 0 : -5 }}
                animate={{ opacity: 1, x: 0, rotateX: 0 }}
                exit={{ opacity: 0, x: prefersReducedMotion ? 0 : 50, rotateX: prefersReducedMotion ? 0 : 5 }}
                transition={{ duration: animationDuration }}
                whileHover={!prefersReducedMotion ? { 
                  y: -8,
                  scale: 1.02,
                  rotateX: 2,
                  transition: { duration: 0.3 }
                } : {}}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                
                <div className="premium-card-content relative z-20 space-y-3 md:space-y-4">
                  {(() => {
                    const iconMap = [FiMessageSquare, FiUserCheck, FiCompass, FiCode, FiTarget];
                    const Icon = iconMap[currentSlide % iconMap.length];
                    return (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FF5728]/20 border border-[#FF5728]/50 rounded-2xl flex items-center justify-center shadow-[0_6px_18px_rgba(255,87,40,0.25)]">
                          <Icon className="w-6 h-6 md:w-7 md:h-7 text-orange-400" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black leading-tight text-orange-500">
                          {carouselItems[currentSlide].title}
                        </h2>
                      </div>
                    );
                  })()}
                  <p className="text-sm md:text-base text-gray-200 leading-relaxed">
                    {carouselItems[currentSlide].description}
                  </p>
                  <p className="text-gray-300 font-bold text-xs md:text-sm tracking-wide">
                    72% higher clarity | 65% increase in satisfaction
                  </p>
                </div>
                
                <div className="premium-card-content relative z-20 pt-1">
                  <motion.button 
                    className="inline-flex items-center gap-2 px-8 md:px-10 py-3 md:py-4 rounded-full text-white font-extrabold text-sm md:text-base transition-all focus:outline-none border border-orange-400/40 shadow-[0_8px_24px_rgba(255,87,40,0.35)] hover:shadow-[0_12px_32px_rgba(255,87,40,0.5)]"
                    style={{
                      background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A00 40%, #FF5722 100%)'
                    }}
                    onClick={() => navigateToFeature(carouselItems[currentSlide].route)}
                    whileHover={!prefersReducedMotion ? { scale: 1.05, y: -2 } : {}}
                    whileTap={{ scale: 0.98 }}
                    aria-label={`Try ${carouselItems[currentSlide].title} now`}
                  >
                    <span>Try Now</span>
                    <FiArrowRight className="w-5 h-5" />
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

            {/* Bottom action buttons removed per request */}
          </motion.div>

          {/* Right Side - Brain Video (Floating) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[45%] h-[700px] pointer-events-none hidden lg:block">
            <video
              src="/brain.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadedData={() => setIsBrainVideoLoaded(true)}
              onError={() => setIsBrainVideoLoaded(true)}
              className="w-full h-full object-contain"
              style={{ mixBlendMode: 'normal' }}
              aria-hidden="true"
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

      {/* Partner Companies Marquee */}
      <section className="py-12 bg-black/50 border-y border-white/5 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set of logos */}
          {Array.from({ length: 10 }, (_, i) => {
            const icons = [FiBriefcase, FiHome, FiZap, FiPackage, FiAward, FiTarget, FiTrendingUp, FiUsers, FiStar, FiCode];
            const Icon = icons[i % icons.length];
            return (
              <div key={`first-${i}`} className="flex items-center gap-4 mx-16 flex-shrink-0 group">
                <Icon className="text-white/30 text-2xl group-hover:text-white/50 transition-colors duration-300" />
                <span className="text-white/30 text-3xl font-light tracking-wider group-hover:text-white/50 transition-colors duration-300">abc</span>
              </div>
            );
          })}
          {/* Duplicate set for seamless loop */}
          {Array.from({ length: 10 }, (_, i) => {
            const icons = [FiBriefcase, FiHome, FiZap, FiPackage, FiAward, FiTarget, FiTrendingUp, FiUsers, FiStar, FiCode];
            const Icon = icons[i % icons.length];
            return (
              <div key={`second-${i}`} className="flex items-center gap-4 mx-16 flex-shrink-0 group">
                <Icon className="text-white/30 text-2xl group-hover:text-white/50 transition-colors duration-300" />
                <span className="text-white/30 text-3xl font-light tracking-wider group-hover:text-white/50 transition-colors duration-300">abc</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matte Black Background Container for all sections after hero */}
      <div className="relative bg-matte-black">
        {/* Content wrapper with z-index */}
        <div className="relative z-10">
          {/* Why Choose Section - Carousel with 2 Cards */}
          <section className="py-20 relative z-10" id="why-choose">
            <div className="max-w-7xl mx-auto px-6 relative z-10 overflow-hidden">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-black mb-8 leading-tight text-white"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">ElevateCareer.ai?</span>
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

          {/* Why Choose Carousel - 2 cards visible with controls */}
          <div className="relative">
            {/* Controls */}
            <button
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setCurrentWhyIndex(prev => (prev - 2 + whyChooseData.length) % whyChooseData.length)}
              aria-label="Previous why choose"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setCurrentWhyIndex(prev => (prev + 2) % whyChooseData.length)}
              aria-label="Next why choose"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(() => {
              const first = currentWhyIndex % whyChooseData.length;
              const second = (currentWhyIndex + 1) % whyChooseData.length;
              const indices = [first, second];
              return indices.map((renderedIndex, gridIdx) => {
                const item = whyChooseData[renderedIndex];
              const statsPerCard = [
                [
                  { label: 'Role alignment', value: 91, trends: [75, 78, 82, 85, 88, 91] },
                  { label: 'Satisfaction', value: 72, trends: [58, 62, 65, 68, 70, 72] },
                  { label: 'Clarity boost', value: 65, trends: [48, 52, 55, 58, 62, 65] },
                ],
                [
                  { label: 'Skill improvement', value: 92, trends: [78, 82, 85, 88, 90, 92] },
                  { label: 'Readiness speed', value: 70, trends: [55, 58, 62, 65, 68, 70] },
                  { label: 'Offer conversions', value: 68, trends: [52, 56, 59, 62, 65, 68] },
                ],
                [
                  { label: 'Fluency', value: 80, trends: [65, 68, 72, 75, 78, 80] },
                  { label: 'Confidence', value: 74, trends: [58, 62, 65, 68, 71, 74] },
                  { label: 'Impressions', value: 67, trends: [52, 55, 58, 61, 64, 67] },
                ],
                [
                  { label: 'Efficiency', value: 88, trends: [72, 76, 80, 83, 85, 88] },
                  { label: 'Speed', value: 60, trends: [45, 48, 52, 55, 57, 60] },
                  { label: 'Success rate', value: 85, trends: [70, 73, 76, 79, 82, 85] },
                ],
                [
                  { label: 'Callbacks', value: 89, trends: [72, 76, 80, 83, 86, 89] },
                  { label: 'Response speed', value: 73, trends: [58, 62, 65, 68, 70, 73] },
                  { label: 'Invitations', value: 80, trends: [65, 68, 72, 75, 78, 80] },
                ],
                [
                  { label: 'Prediction accuracy', value: 95, trends: [82, 85, 88, 91, 93, 95] },
                  { label: 'Insights relevance', value: 90, trends: [75, 78, 82, 85, 87, 90] },
                  { label: 'Growth guidance', value: 88, trends: [72, 76, 80, 83, 85, 88] },
                ],
              ];
                const chartStats = statsPerCard[renderedIndex] || [];
                const baseColors = ['#FF5728', '#133561', '#FFAB00'];
                const rotation = (renderedIndex * 2) % 3; // rotate per original index
              const colorOrder = [
                baseColors[rotation],
                baseColors[(rotation + 1) % 3],
                baseColors[(rotation + 2) % 3],
              ];
                return (
                <motion.div 
                key={`${renderedIndex}-${gridIdx}`}
                className="group relative bg-black/90 border border-[#FF5728] min-h-[520px] h-full flex flex-col justify-between rounded-3xl overflow-hidden"
                style={{ 
                  padding: '3rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                  transformStyle: 'preserve-3d'
                }}
                initial={{ opacity: 0, y: 50, rotateX: -5 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: gridIdx * 0.1 }}
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  rotateX: 3,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className="premium-card-content space-y-8 relative z-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 bg-[#FF5728] rounded-3xl flex items-center justify-center border border-[#FF5728]">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-white mt-4">{item.title}</h3>
                  </div>
                  
                  <div className="space-y-8">
                    {/* Inline premium mini charts (enlarged) */}
                    <div className="grid grid-cols-3 gap-6 md:gap-8 items-center justify-items-center pt-2">
                      {chartStats.map(({ label, value, trends = [] }, i) => (
                        <Donut 
                          key={i} 
                          value={value} 
                          label={label} 
                          color={colorOrder[i % 3]} 
                          trendData={trends}
                          delay={i * 0.2}
                          size={110}
                        />
                      ))}
                    </div>
                    {/* Subheader below charts */}
                    <p className="text-sm text-gray-300 font-medium leading-relaxed max-w-prose">{item.subtitle}</p>
                  </div>
                </div>
              </motion.div>
                );
              });
            })()}
            </div>
          </div>
        </div>
      </section>

          {/* Testimonials Section */}
          <section ref={testimonialsRef} className="py-20 relative z-10" id="testimonials">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
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
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setCurrentTestimonialIndex(prev => (prev - 1 + testimonialsData.length) % testimonialsData.length)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
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
                    className="group relative bg-black/90 p-10 rounded-3xl border border-[#FF5728] overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ opacity: 0, scale: 0.9, rotateX: -5 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ 
                      y: -8,
                      scale: 1.02,
                      rotateX: 2,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="relative z-10">
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
                          className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-black/20 transition-colors"
                        >
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
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
                    
                    <div className="premium-card-content">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-[#FF5728] rounded-full flex items-center justify-center border-2 border-[#FF5728]">
                          <span className="text-white font-black text-xl">{testimonial.avatar}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-xl text-white mb-1">{testimonial.name}</h4>
                          <p className="text-sm text-gray-300 font-bold">{testimonial.role}</p>
                          <p className="text-xs text-gray-400 font-medium">{testimonial.location}</p>
                        </div>
                      </div>
                      <p className="text-lg leading-relaxed text-gray-200 font-medium italic">"{testimonial.content}"</p>
                    </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

          {/* Features Section - Carousel with 3 Cards */}
          <section ref={featuresRef} className="py-20 relative z-10" id="features">
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
            
            {/* Success Rate Card - Premium */}
            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-10 max-w-5xl mx-auto overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                transformStyle: 'preserve-3d'
              }}
              initial={{ opacity: 0, scale: 0.9, rotateX: -5 }}
              animate={featuresInView ? { opacity: 1, scale: 1, rotateX: 0 } : { opacity: 0, scale: 0.9, rotateX: -5 }}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateX: 2,
                transition: { duration: 0.3 }
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="premium-card-content grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
                <div className="w-full">
                  <div className="flex items-baseline justify-between mb-4">
                    <h4 className="text-xl font-bold text-gray-300">Overall Success Rate</h4>
                    <span className="text-4xl font-black text-white">91%</span>
                  </div>
                  <ProgressBar value={91} height={22} colorFrom="#FF5728" colorTo="#FFAB00" />
                </div>
                <div className="text-left">
                  <p className="text-gray-200 text-lg md:text-xl font-bold leading-relaxed">
                    ElevateCareer.Cloud users experience up to a <span className="text-white font-black">91% increase</span> in their chances of landing a better job, building a stronger career path, and excelling in real-life job simulations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Features Carousel - 2 Cards at Once with controls */}
          <div className="overflow-hidden relative w-full py-4">
            {/* Controls */}
            <button 
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setCurrentFeature(prev => (prev - 1 + Math.ceil(featuresData.length / 2)) % Math.ceil(featuresData.length / 2))}
              aria-label="Previous feature"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 border border-white/20 rounded-full items-center justify-center hover:bg-white/20 transition-all"
              onClick={() => setCurrentFeature(prev => (prev + 1) % Math.ceil(featuresData.length / 2))}
              aria-label="Next feature"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <motion.div 
              className="flex transition-transform duration-700 ease-in-out gap-6 px-2"
              style={{ 
                transform: `translateX(calc(-${currentFeature * 100}% - 0.75rem))`,
              }}
            >
              {featuresData.map((feature, index) => {
                return (
                  <motion.div 
                    key={index} 
                    className={`group relative bg-black/90 border border-[#FF5728] flex-shrink-0 min-h-[450px] flex flex-col justify-between rounded-3xl overflow-hidden ${index === 0 ? 'ml-2 md:ml-3' : ''}`}
                    style={{ 
                      width: 'calc(50% - 0.75rem)',
                      padding: '2.5rem',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ opacity: 0, y: 50, rotateX: -5 }}
                    animate={featuresInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -5 }}
                    transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
                    whileHover={{ 
                      y: -12,
                      scale: 1.02,
                      rotateX: 3,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-20">
                      {/* Icon top center */}
                      <div className="flex flex-col items-center text-center mb-5">
                        <div className="w-16 h-16 bg-[#FF5728] rounded-3xl flex items-center justify-center mb-4 border border-[#FF5728]">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                          </svg>
                        </div>
                        {/* Heading below icon */}
                        <h3 className="text-2xl font-black text-white leading-tight">{feature.title}</h3>
                      </div>
                      {/* Graph below heading */}
                      <div className="mt-2">
                        {(() => {
                          // Different chart types for variety
                          const chartType = index % 3;
                          const len = 24;
                          
                          // Color scheme: blue (#3B82F6), yellow (#FFAB00), orange (#FF5728)
                          const colors = ['#3B82F6', '#FFAB00', '#FF5728'];
                          const color = colors[index % 3];
                          
                          // Different data patterns for different chart types
                          let data, chartId;
                          
                          if (chartType === 0) {
                            // Bar Chart
                            data = Array.from({ length: 12 }, (_, i) => {
                              const base = 30 + index * 10;
                              const variation = 20 * Math.sin(i * 0.5 + index);
                              return base + variation;
                            });
                            chartId = `bar-${index}`;
                            return (
                              <div className="w-full">
                                <DetailedBarChart data={data} width="100%" height={180} color={color} id={chartId} />
                              </div>
                            );
                          } else if (chartType === 1) {
                            // Line Chart with markers
                            const pts = Array.from({ length: len }, (_, i) => {
                              const base = 40 + index * 8;
                              const sinWave = 35 * Math.sin(i * 0.35 + index * 0.7);
                              const cosWave = 15 * Math.cos(i * 0.6 + index * 1.2);
                              return base + sinWave + cosWave;
                            });
                            const match = /([0-9]{1,3})%/.exec(feature.statistics || '');
                            const percent = match ? parseInt(match[1], 10) : undefined;
                            chartId = `line-${index}`;
                            return (
                              <div className="w-full">
                                <DetailedLineChart id={chartId} points={pts} width="100%" height={180} color={color} percentLabel={percent} />
                              </div>
                            );
                          } else {
                            // Area Chart with smooth curve
                            const pts = Array.from({ length: len }, (_, i) => {
                              const base = 35 + index * 12;
                              const wave1 = 30 * Math.sin(i * 0.4 + index * 0.8);
                              const wave2 = 10 * Math.cos(i * 0.7 + index * 1.5);
                              return base + wave1 + wave2;
                            });
                            chartId = `area-${index}`;
                            return (
                              <div className="w-full">
                                <DetailedAreaChart id={chartId} points={pts} width="100%" height={180} color={color} />
                              </div>
                            );
                          }
                        })()}
                      </div>
                      {/* Subheading at bottom */}
                      <p className="text-gray-300 font-bold text-sm tracking-wide mt-4 text-center">{feature.statistics}</p>
                    </div>
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
                      ? 'bg-white w-8 shadow-lg' 
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

          {/* Achievements Section - Deck style, center-focused shifting */}
          <section ref={achievementsRef} className="py-20 relative z-10" id="achievements">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.h2 
            className="text-4xl md:text-5xl font-black mb-16 text-center text-white"
            initial="hidden"
            animate={achievementsInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            Our <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Achievements</span>
          </motion.h2>
          {/* Deck layout (5 visible): offsets around center; hover shifts center */}
          <div className="relative hidden md:block" style={{ height: 560, perspective: '1200px' }}>
            {(() => {
              const n = achievementsData.length;
              if (n === 0) return null;
              const offsets = [-2, -1, 0, 1, 2];
              const iconList = [FiAward, FiTrendingUp, FiUsers, FiStar, FiClock];
              return offsets.map((offset, slotIdx) => {
                const dataIndex = (centerAchievementIndex + offset + n) % n;
                const achievement = achievementsData[dataIndex];
                const spread = 160; // closer so cards stay within page
                const x = offset * spread;
                const y = Math.abs(offset) * 12 - 6; // reduce vertical arc
                const scale = Math.max(0.72, 1 - Math.abs(offset) * 0.12);
                const rotateY = -offset * 10;
                const z = 10 - Math.abs(offset);
                const opacity = 1 - Math.abs(offset) * 0.12;
                const Icon = iconList[(dataIndex) % iconList.length];

                return (
                  <motion.div
                    key={`deck-${dataIndex}-${achievement.label}`}
                    className="absolute left-1/2 top-1/2 origin-center cursor-pointer"
                    style={{ zIndex: 100 + z, transformStyle: 'preserve-3d' }}
                    initial={{ opacity: 0, scale: 0.9, x: -260, y: -180 }}
                    whileInView={{ opacity: 1, scale: 1, x: -260 + x, y: -180 + y }}
                    animate={{ x: -260 + x, y: -180 + y, scale, rotateY, opacity }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setCenterAchievementIndex(dataIndex)}
                  >
                    <div
                      className="relative bg-black/90 border border-[#FF5728] rounded-3xl overflow-hidden"
                      style={{ width: 520, height: 360, padding: '2.0rem', boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255, 87, 40, 0.25) inset' }}
                    >
                      <div className="premium-card-content text-center flex flex-col items-center">
                        {/* Icon badge (replaces numbers) */}
                        <div className="w-16 h-16 bg-[#FF5728] rounded-3xl flex items-center justify-center mb-6 border border-[#FF5728]">
                          <Icon className="w-9 h-9 text-white" />
                        </div>
                        <h3 className="text-5xl font-black text-white mb-3 tracking-tight">
                          {achievement.label.includes('Rate') ? (
                            <>{achievement.number}%</>
                          ) : achievement.label.includes('Support') ? (
                            <>{achievement.number}</>
                          ) : (
                            <CountUp end={parseInt(achievement.number) || 0} duration={1.2} separator="," suffix="+" />
                          )}
                        </h3>
                        <p className="text-gray-300 font-black text-xl mb-2 tracking-wide text-center">{achievement.label}</p>
                        <p className="text-gray-200 text-base leading-relaxed font-medium text-center max-w-md">{achievement.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>

          {/* Mobile/tablet fallback grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:hidden">
            {achievementsData.map((achievement, index) => (
              <div key={`m-${index}-${achievement.label}`} className="relative bg-black/90 border border-[#FF5728] rounded-3xl overflow-hidden"
                   style={{ padding: '1.75rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255, 87, 40, 0.25) inset' }}>
                <div className="premium-card-content text-center flex flex-col items-center">
                  <div className="w-14 h-14 bg-[#FF5728] rounded-2xl flex items-center justify-center mb-4 border border-[#FF5728]">
                    {(() => { const Icon = [FiAward, FiTrendingUp, FiUsers, FiStar, FiClock][index % 5]; return <Icon className="w-8 h-8 text-white" />; })()}
                  </div>
                  <h3 className="text-4xl font-black text-white mb-2 tracking-tight">
                    {achievement.label.includes('Rate') ? (
                      <>{achievement.number}%</>
                    ) : achievement.label.includes('Support') ? (
                      <>{achievement.number}</>
                    ) : (
                      <CountUp end={parseInt(achievement.number) || 0} duration={1.4} separator="," suffix="+" />
                    )}
                  </h3>
                  <p className="text-gray-300 font-black text-lg mb-1 text-center">{achievement.label}</p>
                  <p className="text-gray-200 text-sm leading-relaxed font-medium text-center">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

          {/* Comprehensive Solutions Section */}
          <section className="py-20 relative z-10" id="solutions">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
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
                className="group relative bg-black/90 border border-[#FF5728] p-12 rounded-3xl overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                  transformStyle: 'preserve-3d'
                }}
                initial={{ opacity: 0, scale: 0.9, rotateX: -5 }}
                whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -12,
                  scale: 1.02,
                  rotateX: 3,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className="premium-card-content space-y-7 relative z-10">
                  <div className="w-20 h-20 bg-[#FF5728] rounded-3xl flex items-center justify-center border border-[#FF5728]">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={solution.icon} />
                    </svg>
                  </div>
                  <h3 className="text-3xl font-black text-white leading-tight">{solution.title}</h3>
                  <p className="leading-relaxed text-gray-200 text-lg font-medium">{solution.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

          {/* Footer */}
          <footer className="bg-black/50 backdrop-blur-md border-t border-white/10 text-gray-300 py-12 mt-20 relative z-10">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
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

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col items-center gap-4">
              {/* Demo Button for Admin Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Link 
                  href="/admin/assessment-list"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-orange-600 rounded-xl font-bold text-white hover:shadow-2xl hover:shadow-purple-500/40 transform hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Demo: Assessment List</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              <p className="text-sm text-gray-400">&copy; 2024 Elevate Career. All rights reserved.</p>
            </div>
          </div>
        </div>
        </footer>
        </div>
      </div>

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

      {/* Signup Modal */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSignupModal}
          >
            <motion.div 
              className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Sign Up
                </h2>
                <button
                  onClick={closeSignupModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {signupError && (
                <motion.div 
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {signupError}
                </motion.div>
              )}

              {signupSuccess && (
                <motion.div 
                  className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiCheck className="w-5 h-5 mr-2" />
                  Account created successfully! Opening login...
                </motion.div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Full Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Email</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Password</label>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white pr-12"
                      placeholder="Create a password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showSignupPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-orange-500 text-white pr-12"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSignupLoading || signupSuccess}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSignupLoading ? (
                    <>
                      <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : signupSuccess ? (
                    <>
                      <FiCheck className="w-5 h-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
              </form>

              <p className="text-sm text-gray-400 mt-4 text-center">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    closeSignupModal();
                    openLoginModal('user');
                  }}
                  className="text-orange-400 hover:text-orange-300 underline"
                >
                  Login here
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;