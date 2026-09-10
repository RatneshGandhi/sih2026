import React from 'react';

export default function ProgressBar({ value = 0, max = 100, label, sublabel, color = 'emerald', showPercentage = true }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorMap = {
    emerald: 'bg-govEmerald',
    amber: 'bg-govAmber',
    blue: 'bg-blue-600',
    primary: 'bg-primary'
  };

  const bgBar = colorMap[color] || 'bg-govEmerald';

  return (
    <div className="w-full flex flex-col gap-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-govSlate-700">{label}</span>}
          {showPercentage && (
            <span className="font-mono font-bold text-govSlate-900 tnum">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-govSlate-100 rounded-full overflow-hidden border border-govSlate-200/60 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bgBar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sublabel && (
        <span className="text-[11px] text-govSlate-500 font-medium">{sublabel}</span>
      )}
    </div>
  );
}
