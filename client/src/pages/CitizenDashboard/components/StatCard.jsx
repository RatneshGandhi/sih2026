import React from 'react';

export default function StatCard({ title, value, subtext, icon, trend, color = 'blue' }) {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50/80',
      icon: 'text-blue-700',
      border: 'border-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      icon: 'text-govEmerald',
      border: 'border-emerald-100'
    },
    amber: {
      bg: 'bg-amber-50/80',
      icon: 'text-govAmber',
      border: 'border-amber-100'
    },
    navy: {
      bg: 'bg-surface-container-high/60',
      icon: 'text-primary',
      border: 'border-govSlate-200'
    }
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`p-4 rounded-xl bg-white border border-govSlate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-govSlate-300`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-govSlate-500 uppercase tracking-wider">{title}</span>
          <span className="text-2xl font-extrabold text-govSlate-900 mt-1 font-sans tracking-tight tnum">
            {value}
          </span>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.border} border`}>
          <span className="material-symbols-outlined text-[22px] text-primary">{icon}</span>
        </div>
      </div>
      {subtext && (
        <div className="mt-3 pt-2 border-t border-govSlate-100 flex items-center justify-between text-xs text-govSlate-600">
          <span>{subtext}</span>
          {trend && <span className="font-semibold text-govEmerald font-mono">{trend}</span>}
        </div>
      )}
    </div>
  );
}
