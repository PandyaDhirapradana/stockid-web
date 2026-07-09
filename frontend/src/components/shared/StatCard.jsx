import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'accent' }) => {
  const colorMap = {
    accent: 'text-accent bg-accent/10',
    red: 'text-accent-red bg-red-900/20',
    yellow: 'text-accent-yellow bg-yellow-900/20',
    blue: 'text-blue-400 bg-blue-900/20',
  };
  return (
    <div className="card animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.accent}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;