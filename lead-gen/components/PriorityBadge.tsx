import React from 'react';
import type { Lead } from '../types';

interface PriorityBadgeProps {
  priority: Lead['priority'];
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const baseClasses = 'px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block';
  
  const styles = {
    High: 'bg-red-500/80 text-white',
    Medium: 'bg-amber-500/80 text-white',
    Low: 'bg-emerald-500/80 text-white',
    '': 'bg-slate-600 text-slate-200'
  };
  
  const priorityText = priority || 'N/A';
  const priorityStyle = styles[priority] || styles[''];

  return (
    <span className={`${baseClasses} ${priorityStyle}`}>
      {priorityText}
    </span>
  );
};

export default PriorityBadge;
