/**
 * MediaPipe Proctoring Module
 * Uses Google MediaPipe for browser-based assessment proctoring
 */

export class MediaPipeProctoring {
  constructor(videoElement, onViolation) {
    this.video = videoElement;
    this.onViolation = onViolation;
    this.isRunning = false;
    this.detectionInterval = null;
    
    // Detection thresholds
    this.config = {
      faceDetectionInterval: 200, // Check every 200ms
      headPoseThreshold: 0.5, // Threshold for head pose deviation
      maxPersons: 1, // Maximum number of people allowed
      minFaceConfidence: 0.5, // Minimum confidence for face detection
      lookAwayThreshold: 30, // Degrees of head rotation before violation
      noFaceTimeout: 3000, // Milliseconds without face before violation
    };
    
    // State tracking
    this.state = {
      faceDetected: false,
      lastFaceTime: null,
      headPose: { yaw: 0, pitch: 0, roll: 0 },
      personCount: 0,
      violationCount: 0,
    };
    
    // MediaPipe solutions
    this.faceDetection = null;
    this.faceMesh = null;
    this.hands = null;
    
    // Violation cooldown to prevent spam
    this.violationCooldowns = {
      multiple_persons: 0,
      face_not_detected: 0,
      looking_away: 0,
      suspicious_hand_position: 0,
    };
  }

  async initialize() {
    try {
      // Dynamically import MediaPipe solutions
      const { FaceDetection } = await import('@mediapipe/face_detection');
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Hands } = await import('@mediapipe/hands');
      
      // Initialize Face Detection
      this.faceDetection = new FaceDetection({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
        }
      });
      
      this.faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: this.config.minFaceConfidence,
      });
      
      this.faceDetection.onResults((results) => {
        this.handleFaceDetection(results);
      });
      
      // Initialize Face Mesh for head pose estimation
      this.faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`;
        }
      });
      
      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      this.faceMesh.onResults((results) => {
        this.handleFaceMesh(results);
      });
      
      // Initialize Hands detection
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${file}`;
        }
      });
      
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      this.hands.onResults((results) => {
        this.handleHandsDetection(results);
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing MediaPipe:', error);
      return false;
    }
  }

  handleFaceDetection(results) {
    const faces = results.detections || [];
    this.state.personCount = faces.length;
    this.state.faceDetected = faces.length > 0;
    
    if (faces.length > 0) {
      this.state.lastFaceTime = Date.now();
    }
    
    // Check for multiple persons
    if (faces.length > this.config.maxPersons) {
      const now = Date.now();
      if (now - this.violationCooldowns.multiple_persons > 5000) { // 5 second cooldown
        this.violationCooldowns.multiple_persons = now;
        this.triggerViolation('multiple_persons', {
          count: faces.length,
          timestamp: now,
        });
      }
    }
    
    // Check for no face (user left)
    if (faces.length === 0) {
      if (!this.state.lastFaceTime) {
        this.state.lastFaceTime = Date.now();
      } else {
        const timeSinceLastFace = Date.now() - this.state.lastFaceTime;
        if (timeSinceLastFace > this.config.noFaceTimeout) {
          const now = Date.now();
          if (now - this.violationCooldowns.face_not_detected > 5000) { // 5 second cooldown
            this.violationCooldowns.face_not_detected = now;
            this.triggerViolation('face_not_detected', {
              duration: timeSinceLastFace,
              timestamp: now,
            });
          }
        }
      }
    } else {
      // Reset last face time if face is detected
      this.state.lastFaceTime = Date.now();
    }
  }

  handleFaceMesh(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate head pose from landmarks
      const headPose = this.calculateHeadPose(landmarks);
      this.state.headPose = headPose;
      
      // Check for looking away
      const yawDegrees = Math.abs(headPose.yaw);
      const pitchDegrees = Math.abs(headPose.pitch);
      
      if (yawDegrees > this.config.lookAwayThreshold || pitchDegrees > this.config.lookAwayThreshold) {
        const now = Date.now();
        if (now - this.violationCooldowns.looking_away > 3000) { // 3 second cooldown
          this.violationCooldowns.looking_away = now;
          this.triggerViolation('looking_away', {
            yaw: headPose.yaw,
            pitch: headPose.pitch,
            timestamp: now,
          });
        }
      }
    }
  }

  calculateHeadPose(landmarks) {
    // Simplified head pose estimation using key facial landmarks
    // Using nose tip, chin, left eye, right eye, left mouth, right mouth
    const noseTip = landmarks[1]; // Nose tip
    const chin = landmarks[175]; // Chin
    const leftEye = landmarks[33]; // Left eye outer corner
    const rightEye = landmarks[263]; // Right eye outer corner
    const leftMouth = landmarks[61]; // Left mouth corner
    const rightMouth = landmarks[291]; // Right mouth corner
    
    // Calculate yaw (left-right rotation)
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const noseX = noseTip.x;
    const yaw = (noseX - eyeCenterX) * 90; // Approximate degrees
    
    // Calculate pitch (up-down rotation)
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    const noseY = noseTip.y;
    const pitch = (noseY - eyeCenterY) * 90; // Approximate degrees
    
    // Calculate roll (tilt)
    const eyeDeltaY = rightEye.y - leftEye.y;
    const roll = Math.atan2(eyeDeltaY, rightEye.x - leftEye.x) * (180 / Math.PI);
    
    return { yaw, pitch, roll };
  }

  handleHandsDetection(results) {
    const hands = results.multiHandLandmarks || [];
    
    // Check for suspicious hand positions (e.g., covering face, using phone)
    if (hands.length > 0 && this.state.faceDetected) {
      for (const hand of hands) {
        // Check if hand is near face (potential phone usage or face covering)
        const wrist = hand[0];
        const indexTip = hand[8];
        
        // Simple heuristic: if hand is in upper portion of screen, might be suspicious
        if (wrist && indexTip && (wrist.y < 0.3 || indexTip.y < 0.3)) {
          const now = Date.now();
          if (now - this.violationCooldowns.suspicious_hand_position > 5000) { // 5 second cooldown
            this.violationCooldowns.suspicious_hand_position = now;
            this.triggerViolation('suspicious_hand_position', {
              timestamp: now,
            });
          }
        }
      }
    }
  }

  triggerViolation(type, details) {
    this.state.violationCount++;
    
    const violation = {
      type,
      details,
      timestamp: details.timestamp || Date.now(),
      violationCount: this.state.violationCount,
    };
    
    if (this.onViolation) {
      this.onViolation(violation);
    }
    
    // Log violation
    const violations = JSON.parse(localStorage.getItem('assessment_violations') || '[]');
    violations.push(violation);
    localStorage.setItem('assessment_violations', JSON.stringify(violations));
  }

  async start() {
    if (this.isRunning) return;
    
    if (!this.video) {
      console.error('Video element not provided');
      return false;
    }
    
    const initialized = await this.initialize();
    if (!initialized) {
      console.error('Failed to initialize MediaPipe');
      return false;
    }
    
    this.isRunning = true;
    this.state.lastFaceTime = Date.now();
    
    // Start detection loop
    const detect = async () => {
      if (!this.isRunning || !this.video || this.video.readyState !== 4) {
        return;
      }
      
      try {
        // Create a canvas to capture video frame
        if (!this.canvas) {
          this.canvas = document.createElement('canvas');
          this.canvas.width = this.video.videoWidth || 640;
          this.canvas.height = this.video.videoHeight || 480;
          this.ctx = this.canvas.getContext('2d');
        }
        
        // Update canvas size if video size changed
        if (this.video.videoWidth && this.video.videoHeight) {
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
        }
        
        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Run detections on the canvas
        if (this.faceDetection) {
          await this.faceDetection.send({ image: this.canvas });
        }
        
        if (this.faceMesh) {
          await this.faceMesh.send({ image: this.canvas });
        }
        
        if (this.hands) {
          await this.hands.send({ image: this.canvas });
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    };
    
    // Run detection at intervals
    this.detectionInterval = setInterval(detect, this.config.faceDetectionInterval);
    
    return true;
  }

  stop() {
    this.isRunning = false;
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    
    // Clean up MediaPipe instances
    if (this.faceDetection) {
      this.faceDetection.close();
      this.faceDetection = null;
    }
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
    
    // Clean up canvas
    if (this.canvas) {
      this.canvas = null;
      this.ctx = null;
    }
  }

  getState() {
    return { ...this.state };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

