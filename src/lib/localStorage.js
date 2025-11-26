const STORAGE_KEYS = {
  JOBS: 'elevate_admin_jobs',
  ASSESSMENTS: 'elevate_admin_assessments',
};

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

export const jobsStorage = {
  getAll: () => {
    const storage = getStorage();
    if (!storage) return [];
    try {
      const stored = storage.getItem(STORAGE_KEYS.JOBS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading jobs from localStorage:', error);
      return [];
    }
  },

  save: (job) => {
    const storage = getStorage();
    if (!storage) return job;
    try {
      const jobs = jobsStorage.getAll();
      const existingIndex = jobs.findIndex(j => j.id === job.id);
      
      if (existingIndex >= 0) {
        jobs[existingIndex] = { ...jobs[existingIndex], ...job };
      } else {
        jobs.push({ ...job, id: job.id || `job_${Date.now()}` });
      }
      
      storage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
      return job;
    } catch (error) {
      console.error('Error saving job to localStorage:', error);
      throw error;
    }
  },

  delete: (jobId) => {
    const storage = getStorage();
    if (!storage) return;
    try {
      const jobs = jobsStorage.getAll();
      const filtered = jobs.filter(j => j.id !== jobId);
      storage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting job from localStorage:', error);
      throw error;
    }
  },

  getById: (jobId) => {
    const jobs = jobsStorage.getAll();
    return jobs.find(j => j.id === jobId);
  },
};

export const assessmentsStorage = {
  getAll: () => {
    const storage = getStorage();
    if (!storage) return [];
    try {
      const stored = storage.getItem(STORAGE_KEYS.ASSESSMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading assessments from localStorage:', error);
      return [];
    }
  },

  save: (assessment) => {
    const storage = getStorage();
    if (!storage) return assessment;
    try {
      const assessments = assessmentsStorage.getAll();
      const existingIndex = assessments.findIndex(a => a.id === assessment.id);
      
      if (existingIndex >= 0) {
        assessments[existingIndex] = { ...assessments[existingIndex], ...assessment };
      } else {
        assessments.push({ 
          ...assessment, 
          id: assessment.id || `assessment_${Date.now()}`,
          createdAt: assessment.createdAt || new Date().toISOString()
        });
      }
      
      storage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
      return assessment;
    } catch (error) {
      console.error('Error saving assessment to localStorage:', error);
      throw error;
    }
  },

  delete: (assessmentId) => {
    const storage = getStorage();
    if (!storage) return;
    try {
      const assessments = assessmentsStorage.getAll();
      const filtered = assessments.filter(a => a.id !== assessmentId);
      storage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting assessment from localStorage:', error);
      throw error;
    }
  },

  getByJobId: (jobId) => {
    const assessments = assessmentsStorage.getAll();
    return assessments.filter(a => a.jobId === jobId);
  },

  getById: (assessmentId) => {
    const assessments = assessmentsStorage.getAll();
    return assessments.find(a => a.id === assessmentId);
  },
};
