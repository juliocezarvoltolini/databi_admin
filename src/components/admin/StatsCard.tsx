// src/components/admin/StatsCard.tsx
"use client";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
}

const colorConfig = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    trendUp: 'text-blue-600 dark:text-blue-400',
    trendDown: 'text-blue-600 dark:text-blue-400'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
    trendUp: 'text-green-600 dark:text-green-400',
    trendDown: 'text-red-600 dark:text-red-400'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    trendUp: 'text-green-600 dark:text-green-400',
    trendDown: 'text-red-600 dark:text-red-400'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    trendUp: 'text-green-600 dark:text-green-400',
    trendDown: 'text-red-600 dark:text-red-400'
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    trendUp: 'text-green-600 dark:text-green-400',
    trendDown: 'text-red-600 dark:text-red-400'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    trendUp: 'text-green-600 dark:text-green-400',
    trendDown: 'text-red-600 dark:text-red-400'
  }
};

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color, 
  trend, 
  description 
}: StatsCardProps) {
  const config = colorConfig[color];
  
  return (
    <div className={`${config.bg} rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900/10`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {trend && (
              <div className={`flex items-center text-sm font-medium ${
                trend.direction === 'up' ? config.trendUp : config.trendDown
              }`}>
                <svg 
                  className={`w-4 h-4 mr-1 ${
                    trend.direction === 'up' ? 'rotate-0' : 'rotate-180'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 17l10-10M17 7H7"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        <div className={`${config.iconBg} p-3 rounded-lg`}>
          <div className={`w-6 h-6 ${config.iconColor}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}