import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { FiX, FiPlus, FiSearch, FiLoader } from 'react-icons/fi';

interface Competency {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface CompetencySelectorProps {
  jobTitleId?: string;
  selectedCompetencies: Competency[];
  onCompetenciesChange: (competencies: Competency[]) => void;
}

const CompetencySelector: React.FC<CompetencySelectorProps> = ({
  jobTitleId,
  selectedCompetencies,
  onCompetenciesChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const MAX_COMPETENCIES = 10;

  // NOTE: We no longer auto-load competencies when jobTitleId changes
  // User must explicitly click "Sync Competencies from Role" button
  // This provides consistent UX with the Job flow which also requires explicit sync

  // Search for additional competencies
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/competencies/competencies/?search=${searchQuery}`);
        const data = response.data.results || response.data;
        setSearchResults(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Failed to search competencies:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const addCompetency = (comp: Competency) => {
    if (selectedCompetencies.length >= MAX_COMPETENCIES) {
      alert(`Maximum ${MAX_COMPETENCIES} competencies allowed`);
      return;
    }
    if (selectedCompetencies.find((c) => c.id === comp.id)) {
      return; // Already added
    }
    onCompetenciesChange([...selectedCompetencies, comp]);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    setShowAddInput(false);
  };

  const removeCompetency = (compId: string) => {
    onCompetenciesChange(selectedCompetencies.filter((c) => c.id !== compId));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      behavioral: 'bg-green-500/20 text-green-400 border-green-500/30',
      cognitive: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      domain: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-300">
          Required Skills & Competencies{' '}
          <span className="text-gray-500 font-normal">
            ({selectedCompetencies.length}/{MAX_COMPETENCIES})
          </span>
        </label>

        {selectedCompetencies.length < MAX_COMPETENCIES && !showAddInput && (
          <button
            type="button"
            onClick={() => setShowAddInput(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30 hover:bg-orange-500/30 transition-all text-sm font-semibold"
          >
            <FiPlus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && selectedCompetencies.length === 0 && (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <FiLoader className="w-6 h-6 animate-spin mr-2" />
          Loading competencies...
        </div>
      )}

      {/* Selected Competencies */}
      {selectedCompetencies.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedCompetencies.map((comp) => (
              <div
                key={comp.id}
                className="group inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-orange-500/30 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{comp.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block border ${getCategoryColor(comp.category)}`}>
                    {comp.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetency(comp.id)}
                  className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="Remove"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedCompetencies.length === 0 && !loading && (
        <div className="py-8 px-4 bg-white/5 border border-white/10 rounded-xl text-center">
          <div className="text-gray-500 text-sm mb-2">No competencies selected yet</div>
          <div className="text-gray-600 text-xs">
            {jobTitleId
              ? 'Competencies will be auto-loaded from the selected job title'
              : 'Please select a job title first'}
          </div>
        </div>
      )}

      {/* Search to add more */}
      {showAddInput && selectedCompetencies.length < MAX_COMPETENCIES && (
        <div className="relative mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search competencies to add (e.g., Python, Leadership)"
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-orange-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                autoFocus
              />
              {loading && (
                <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-400 animate-spin" />
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddInput(false);
                setSearchQuery('');
                setSearchResults([]);
                setShowDropdown(false);
              }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-red-500/30 transition-all"
            >
              Cancel
            </button>
          </div>

          {showDropdown && searchResults.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <ul className="absolute top-full mt-2 w-full bg-gray-900 border border-orange-500/30 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                {searchResults.map((comp) => (
                  <li
                    key={comp.id}
                    onClick={() => addCompetency(comp)}
                    className={`px-4 py-3 hover:bg-orange-500/10 cursor-pointer border-b border-white/10 last:border-b-0 transition-all ${
                      selectedCompetencies.find((c) => c.id === comp.id) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm mb-1">{comp.name}</div>
                        {comp.description && (
                          <div className="text-xs text-gray-500 line-clamp-1 mb-2">{comp.description}</div>
                        )}
                      </div>
                      <div className={`ml-3 px-2 py-1 text-xs font-semibold rounded-lg border ${getCategoryColor(comp.category)}`}>
                        {comp.category}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {searchQuery.length >= 2 && !loading && searchResults.length === 0 && showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-xl p-4 text-center text-gray-400 text-sm z-50">
              No competencies found. Try a different search term.
            </div>
          )}
        </div>
      )}

      {selectedCompetencies.length >= MAX_COMPETENCIES && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-400 text-sm">
          Maximum {MAX_COMPETENCIES} competencies reached. Remove some to add others.
        </div>
      )}
    </div>
  );
};

export default CompetencySelector;
