
import React, { useState, useEffect } from 'react';
import SparkleIcon from './icons/SparkleIcon';

interface OutreachModalProps {
  onClose: () => void;
  message: string;
}

const OutreachModal: React.FC<OutreachModalProps> = ({ onClose, message }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');

  useEffect(() => {
    // Reset button text if message changes
    setCopyButtonText('Copy to Clipboard');
  }, [message]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy to Clipboard'), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopyButtonText('Copy Failed');
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ring-1 ring-slate-700 flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="p-6 border-b border-slate-700">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-900/50 p-2 rounded-full">
                        <SparkleIcon />
                    </div>
                    <div>
                        <h2 id="modal-title" className="text-xl font-semibold text-white">Generated Outreach Message</h2>
                        <p className="text-sm text-slate-400">Review, copy, and paste this message to start a conversation.</p>
                    </div>
                </div>
                 <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white"
                    aria-label="Close"
                  >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
        </div>

        <div className="p-6 flex-grow">
          <textarea
            readOnly
            value={message}
            className="w-full h-64 p-3 rounded-md bg-slate-800 border border-slate-700 text-slate-300 whitespace-pre-wrap resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            aria-label="Generated outreach message"
          />
        </div>

        <div className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-slate-700">
            <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors"
            >
            Close
            </button>
            <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors w-36"
            >
            {copyButtonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OutreachModal;
