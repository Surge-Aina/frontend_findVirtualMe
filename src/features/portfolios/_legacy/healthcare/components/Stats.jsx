import { useInView } from 'react-intersection-observer'
import { FaCalendarCheck, FaUsers, FaChartLine, FaUserMd } from 'react-icons/fa'

export default function Stats({ stats, visibility = {} }) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  // Check if individual stat should be visible (default to true if not set)
  const isVisible = (key) => visibility[key] ?? true;
  
  // Check if entire stats section should be shown
  const showSection = visibility.showStatsSection ?? true;

  const statsData = [
    {
      key: 'yearsExperience',
      icon: FaCalendarCheck,
      value: stats?.yearsExperience || stats?.years,
      label: 'Years Experience'
    },
    {
      key: 'patientsServed',
      icon: FaUsers,
      value: stats?.patientsServed || stats?.patients,
      label: 'Patients Served'
    },
    {
      key: 'successRate',
      icon: FaChartLine,
      value: stats?.successRate,
      label: 'Success Rate'
    },
    {
      key: 'doctorsCount',
      icon: FaUserMd,
      value: stats?.doctorsCount || stats?.doctors,
      label: 'Expert Doctors'
    }
  ]

  // Filter to only visible stats with values
  const visibleStats = statsData.filter(
    stat => isVisible(stat.key) && stat.value && stat.value !== '0'
  );

  // Don't render if section is hidden or no stats to show
  if (!showSection || visibleStats.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-8 ${
          visibleStats.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
          visibleStats.length === 2 ? 'grid-cols-2 max-w-lg mx-auto' :
          visibleStats.length === 3 ? 'grid-cols-3 max-w-3xl mx-auto' :
          'grid-cols-2 lg:grid-cols-4'
        }`}>
          {visibleStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div 
                key={stat.key} 
                className="text-center group"
                style={{
                  animation: inView ? `fadeInUp 0.5s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <Icon className="text-primary text-2xl" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.value}{stat.key === 'successRate' ? '%' : '+'}
                </div>
                <div className="text-secondary font-medium">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}