import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FiSearch, FiLoader } from 'react-icons/fi';

interface JobTitle {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  seniority_level: string;
  competency_count: number;
}

interface JobTitleSearchProps {
  onSelect: (jobTitle: JobTitle) => void;
  value?: string;
}

const JobTitleSearch: React.FC<JobTitleSearchProps> = ({ onSelect, value }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (value) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/competencies/job-titles/?search=${query}`);
        const data = response.data.results || response.data;
        setResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Failed to search job titles:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (jobTitle: JobTitle) => {
    setQuery(jobTitle.name);
    setShowDropdown(false);
    onSelect(jobTitle);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        Job Title <span className="text-red-400">*</span>
      </label>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowDropdown(true)}
          placeholder="Search job title (e.g., Software Engineer, Data Analyst)"
          className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
          required
        />

        {loading && (
          <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-400 animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <ul className="absolute top-full mt-2 w-full bg-gray-900 border border-orange-500/30 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
            {results.map((jobTitle) => (
              <li
                key={jobTitle.id}
                onClick={() => handleSelect(jobTitle)}
                className="px-4 py-4 hover:bg-orange-500/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-white text-base mb-1">{jobTitle.name}</div>
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <span className="text-orange-400 font-semibold">{jobTitle.category}</span>
                      {jobTitle.industry && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{jobTitle.industry}</span>
                        </>
                      )}
                      {jobTitle.seniority_level && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{jobTitle.seniority_level}</span>
                        </>
                      )}
                    </div>
                    {jobTitle.description && (
                      <div className="text-xs text-gray-500 line-clamp-2">{jobTitle.description}</div>
                    )}
                  </div>
                  <div className="ml-4 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30">
                    {jobTitle.competency_count} skills
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {query.length >= 2 && !loading && results.length === 0 && showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-xl p-4 text-center text-gray-400 text-sm z-50">
          No job titles found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default JobTitleSearch;
