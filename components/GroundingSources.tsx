import React from 'react';
import type { GroundingSource } from '../types';
import LinkIcon from './icons/LinkIcon';

interface GroundingSourcesProps {
  sources: GroundingSource[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <h3 className="text-md font-semibold text-slate-300 mb-3 flex items-center">
        <LinkIcon />
        <span className="ml-2">Sources from Google Search</span>
      </h3>
      <ul className="space-y-2">
        {sources.map((source, index) => (
          <li key={index}>
            <a
              href={source.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline break-all"
              title={source.uri}
            >
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroundingSources;
