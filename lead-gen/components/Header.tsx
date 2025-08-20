import React from 'react';
import CodeServeLogo from './icons/CodeServeLogo';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CodeServeLogo />
          <h1 className="text-xl font-bold text-white tracking-tight">Lead Gen</h1>
        </div>
        <div className="text-sm text-slate-400">
          by <span className="font-semibold text-slate-300">code.serve</span>
        </div>
      </div>
    </header>
  );
};

export default Header;