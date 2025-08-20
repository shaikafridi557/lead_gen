import React, { useState } from 'react';
import { Lead } from '../types';

interface AddLeadModalProps {
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ onClose, onAddLead }) => {
  const [lead, setLead] = useState<Lead>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    imageUrl: '',
    category: '',
    priority: '',
    notes: '',
    socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLead(prevLead => ({ ...prevLead, [name]: value }));
  };
  
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLead(prev => ({
        ...prev,
        socialMedia: {
            ...prev.socialMedia,
            [name]: value
        }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name) {
      alert('Business name is required.');
      return;
    }
    onAddLead(lead);
  };
  
  const InputField = ({ label, name, type = 'text', value, onChange, required = false }: {label: string, name: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label} {required && '*'}</label>
        <input type={type} name={name} id={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"/>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto ring-1 ring-slate-700">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h2 id="modal-title" className="text-xl font-semibold text-white">Add New Lead</h2>
                     <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                        aria-label="Close"
                      >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <InputField label="Business Name" name="name" value={lead.name} onChange={handleChange} required />
                    </div>
                    <InputField label="Category" name="category" value={lead.category} onChange={handleChange} />
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-slate-300">Priority</label>
                        <select
                            id="priority"
                            name="priority"
                            value={lead.priority}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            <option value="">Select Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                     <div className="sm:col-span-2">
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notes</label>
                        <textarea id="notes" name="notes" value={lead.notes} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"></textarea>
                    </div>
                    <InputField label="Email" name="email" type="email" value={lead.email} onChange={handleChange} />
                    <InputField label="Phone" name="phone" type="tel" value={lead.phone} onChange={handleChange} />
                    <div className="sm:col-span-2">
                        <InputField label="Address" name="address" value={lead.address} onChange={handleChange} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputField label="Website URL" name="website" type="url" value={lead.website} onChange={handleChange} />
                    </div>
                    <div className="sm:col-span-2">
                        <InputField label="Image URL" name="imageUrl" type="url" value={lead.imageUrl} onChange={handleChange} />
                    </div>

                    <h3 className="text-lg font-medium text-slate-200 sm:col-span-2 mt-2 border-t border-slate-700 pt-4">Social Media</h3>
                    <InputField label="Facebook URL" name="facebook" type="url" value={lead.socialMedia.facebook || ''} onChange={handleSocialChange} />
                    <InputField label="Instagram URL" name="instagram" type="url" value={lead.socialMedia.instagram || ''} onChange={handleSocialChange} />
                    <InputField label="Twitter URL" name="twitter" type="url" value={lead.socialMedia.twitter || ''} onChange={handleSocialChange} />
                    <InputField label="LinkedIn URL" name="linkedin" type="url" value={lead.socialMedia.linkedin || ''} onChange={handleSocialChange} />
                </div>
            </div>
            <div className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3 rounded-b-lg border-t border-slate-700">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors"
                >
                Save Lead
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;