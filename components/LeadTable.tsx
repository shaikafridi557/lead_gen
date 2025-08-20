import React, { useState } from 'react';
import type { Lead } from '../types';
import { generateOutreachMessage } from '../services/geminiService';

import TrashIcon from './icons/TrashIcon';
import FacebookIcon from './icons/FacebookIcon';
import InstagramIcon from './icons/InstagramIcon';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import PriorityBadge from './PriorityBadge';
import SparkleIcon from './icons/SparkleIcon';
import OutreachModal from './OutreachModal';
import EditIcon from './icons/EditIcon';

interface LeadTableProps {
  leads: Lead[];
  onRemoveLead: (index: number) => void;
  onUpdateLead: (index: number, updatedLead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onRemoveLead, onUpdateLead }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState('');

  const handleStartEditing = (index: number, currentNotes: string) => {
    setEditingIndex(index);
    setEditingNotes(currentNotes);
  };

  const handleCancelEditing = () => {
    setEditingIndex(null);
    setEditingNotes('');
  };

  const handleSaveNote = (index: number) => {
    const updatedLead = { ...leads[index], notes: editingNotes };
    onUpdateLead(index, updatedLead);
    setEditingIndex(null);
    setEditingNotes('');
  };


  const handleGenerateMessage = async (lead: Lead, index: number) => {
    setIsGenerating(index);
    try {
      const message = await generateOutreachMessage(lead);
      setGeneratedMessage(message);
      setIsModalOpen(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(null);
    }
  };

  const ImagePlaceholder = () => (
    <div className="w-12 h-12 bg-slate-700 rounded-md flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700 table-fixed">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-64">Business</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Priority</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-80">Notes</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-64">Email</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-48">Phone</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-64">Website</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Social</th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/50 divide-y divide-slate-800">
                {leads.length > 0 ? (
                  leads.map((lead, index) => (
                    <tr key={index} className="hover:bg-slate-800/60 even:bg-slate-800/40 transition-colors duration-150">
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-12 w-12">
                            {lead.imageUrl ? (
                              <img className="h-12 w-12 rounded-md object-cover" src={lead.imageUrl} alt={`${lead.name} logo`} />
                            ) : (
                              <ImagePlaceholder />
                            )}
                          </div>
                          <div className="ml-4 overflow-hidden">
                            <div title={lead.name} className="text-sm font-medium text-white truncate">{lead.name || <span className="text-slate-500">N/A</span>}</div>
                            <div className="text-xs text-slate-400">{lead.category || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap align-top">
                          <PriorityBadge priority={lead.priority} />
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300 align-top overflow-hidden">
                        {editingIndex === index ? (
                            <>
                                <textarea
                                    value={editingNotes}
                                    onChange={(e) => setEditingNotes(e.target.value)}
                                    className="w-full h-24 p-2 rounded-md bg-slate-700 border border-slate-600 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition text-sm text-slate-300 placeholder-slate-400 resize-y"
                                    placeholder="Add notes..."
                                />
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleSaveNote(index)} className="px-2 py-1 text-xs bg-cyan-600 hover:bg-cyan-500 rounded">Save</button>
                                    <button onClick={handleCancelEditing} className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded">Cancel</button>
                                </div>
                            </>
                        ) : (
                            <div className="group relative">
                                <p title={lead.notes} className="truncate">{lead.notes || <span className="text-slate-500">No notes.</span>}</p>
                                <button
                                    onClick={() => handleStartEditing(index, lead.notes)}
                                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-slate-700/80 p-1 rounded-full text-slate-300 hover:text-white transition-opacity"
                                    aria-label="Edit notes"
                                >
                                    <EditIcon />
                                </button>
                            </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300 align-top overflow-hidden">
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} title={lead.email} className="text-cyan-400 hover:text-cyan-300 hover:underline block truncate">
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-300 align-top">
                         {lead.phone ? (
                          <a href={`tel:${lead.phone}`} className="hover:text-slate-100">
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300 align-top overflow-hidden">
                        {lead.website ? (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer" title={lead.website} className="text-cyan-400 hover:text-cyan-300 hover:underline block truncate">
                            {lead.website}
                          </a>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap align-top">
                          <div className="flex items-center gap-3">
                              {lead.socialMedia.facebook && <a href={lead.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><FacebookIcon /></a>}
                              {lead.socialMedia.instagram && <a href={lead.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><InstagramIcon /></a>}
                              {lead.socialMedia.twitter && <a href={lead.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter"><TwitterIcon /></a>}
                              {lead.socialMedia.linkedin && <a href={lead.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><LinkedInIcon /></a>}
                          </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium align-top">
                        <div className="flex justify-center items-center gap-3">
                           <button
                              onClick={() => handleGenerateMessage(lead, index)}
                              disabled={isGenerating !== null}
                              className="text-slate-400 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                              aria-label={`Generate message for ${lead.name}`}
                              title="Generate Outreach Message"
                            >
                              {isGenerating === index ? (
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <SparkleIcon />
                              )}
                            </button>
                            <button 
                              onClick={() => onRemoveLead(index)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                              aria-label={`Remove ${lead.name}`}
                            >
                              <TrashIcon />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 px-5 text-slate-400">
                      <p>No leads to display.</p>
                      <p className="text-sm">Your specialized search results will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && <OutreachModal message={generatedMessage} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default LeadTable;