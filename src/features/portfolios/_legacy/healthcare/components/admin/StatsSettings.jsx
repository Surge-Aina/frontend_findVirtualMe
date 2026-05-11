import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaUsers, FaChartLine, FaUserMd, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * StatsSettings Component
 * 
 * Admin component for managing the 4 fixed statistics on the homepage.
 * Users can toggle each stat on/off and edit the values.
 */
export default function StatsSettings({ practiceData, onUpdate }) {
  const [stats, setStats] = useState({
    yearsExperience: practiceData?.stats?.yearsExperience || '',
    patientsServed: practiceData?.stats?.patientsServed || '',
    successRate: practiceData?.stats?.successRate || '',
    doctorsCount: practiceData?.stats?.doctorsCount || '',
  });

  const [visibility, setVisibility] = useState({
    showStatsSection: practiceData?.statsVisibility?.showStatsSection ?? true,
    yearsExperience: practiceData?.statsVisibility?.yearsExperience ?? true,
    patientsServed: practiceData?.statsVisibility?.patientsServed ?? true,
    successRate: practiceData?.statsVisibility?.successRate ?? true,
    doctorsCount: practiceData?.statsVisibility?.doctorsCount ?? true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when practiceData changes
  useEffect(() => {
    if (practiceData?.stats) {
      setStats({
        yearsExperience: practiceData.stats.yearsExperience || '',
        patientsServed: practiceData.stats.patientsServed || '',
        successRate: practiceData.stats.successRate || '',
        doctorsCount: practiceData.stats.doctorsCount || '',
      });
    }
    if (practiceData?.statsVisibility) {
      setVisibility({
        showStatsSection: practiceData.statsVisibility.showStatsSection ?? true,
        yearsExperience: practiceData.statsVisibility.yearsExperience ?? true,
        patientsServed: practiceData.statsVisibility.patientsServed ?? true,
        successRate: practiceData.statsVisibility.successRate ?? true,
        doctorsCount: practiceData.statsVisibility.doctorsCount ?? true,
      });
    }
  }, [practiceData]);

  // The 4 fixed stats
  const statConfig = [
    { 
      key: 'yearsExperience', 
      label: 'Years Experience', 
      icon: FaCalendarCheck,
      placeholder: 'e.g., 10',
    },
    { 
      key: 'patientsServed', 
      label: 'Patients Served', 
      icon: FaUsers,
      placeholder: 'e.g., 200',
    },
    { 
      key: 'successRate', 
      label: 'Success Rate', 
      icon: FaChartLine,
      placeholder: 'e.g., 80',
      suffix: '%'
    },
    { 
      key: 'doctorsCount', 
      label: 'Expert Doctors', 
      icon: FaUserMd,
      placeholder: 'e.g., 11',
    },
  ];

  const handleStatChange = (key, value) => {
    const newStats = { ...stats, [key]: value };
    setStats(newStats);
    setHasChanges(true);
  };

  const handleToggle = (key) => {
    const newVisibility = { ...visibility, [key]: !visibility[key] };
    setVisibility(newVisibility);
    setHasChanges(true);
  };

  const handleMasterToggle = () => {
    const newVisibility = { ...visibility, showStatsSection: !visibility.showStatsSection };
    setVisibility(newVisibility);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate?.({
      stats,
      statsVisibility: visibility
    });
    setHasChanges(false);
  };

  const enabledCount = statConfig.filter(s => visibility[s.key]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Statistics</h2>
          <p className="text-gray-600 mt-1">
            Toggle and customize the 4 statistics displayed on your homepage
          </p>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Master Toggle Card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              visibility.showStatsSection ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
            }`}>
              {visibility.showStatsSection ? <FaEye className="text-xl" /> : <FaEyeSlash className="text-xl" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Show Statistics Section</h3>
              <p className="text-sm text-gray-500">
                {visibility.showStatsSection 
                  ? `${enabledCount} of 4 statistics visible on homepage`
                  : 'Statistics section is hidden from homepage'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={handleMasterToggle}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
              visibility.showStatsSection ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                visibility.showStatsSection ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4 Fixed Stats Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-300 ${
        visibility.showStatsSection ? 'opacity-100' : 'opacity-50 pointer-events-none'
      }`}>
        {statConfig.map((stat) => {
          const Icon = stat.icon;
          const isEnabled = visibility[stat.key];
          
          return (
            <div
              key={stat.key}
              className={`bg-white rounded-xl border-2 p-5 transition-all duration-200 ${
                isEnabled ? 'border-blue-200 shadow-sm' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="text-lg" />
                  </div>
                  <span className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                    {stat.label}
                  </span>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(stat.key)}
                  disabled={!visibility.showStatsSection}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 disabled:opacity-50 ${
                    isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Value Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={stats[stat.key]}
                  onChange={(e) => handleStatChange(stat.key, e.target.value)}
                  placeholder={stat.placeholder}
                  disabled={!visibility.showStatsSection || !isEnabled}
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-lg font-semibold transition-all focus:outline-none focus:ring-2 ${
                    isEnabled
                      ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-blue-600'
                      : 'border-gray-200 text-gray-400 bg-gray-50'
                  } disabled:bg-gray-50 disabled:cursor-not-allowed`}
                />
                {stat.suffix && (
                  <span className={`text-lg font-semibold ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
                    {stat.suffix}
                  </span>
                )}
                {!stat.suffix && (
                  <span className={`text-lg font-semibold ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`}>
                    +
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
            <FaEye className="text-gray-400" />
            Preview - How it appears on your homepage
          </h3>
        </div>
        
        <div className="p-6 bg-white">
          {visibility.showStatsSection && statConfig.some(s => visibility[s.key]) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {statConfig.map((stat) => {
                const Icon = stat.icon;
                const isVisible = visibility[stat.key];
                const value = stats[stat.key];
                
                return (
                  <div 
                    key={stat.key} 
                    className={`text-center transition-opacity ${
                      isVisible ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      isVisible ? 'bg-blue-50' : 'bg-gray-100'
                    }`}>
                      <Icon className={`text-2xl ${isVisible ? 'text-blue-600' : 'text-gray-300'}`} />
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${isVisible ? 'text-blue-600' : 'text-gray-300'}`}>
                      {value || '0'}{stat.suffix || '+'}
                    </div>
                    <div className={`text-sm font-medium ${isVisible ? 'text-gray-600' : 'text-gray-300'}`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FaEyeSlash className="text-3xl mx-auto mb-2 opacity-50" />
              <p>Statistics section is hidden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}