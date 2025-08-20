
import React from 'react';
import type { Lead } from '../types';
import CsvIcon from './icons/CsvIcon';
import ExcelIcon from './icons/ExcelIcon';

// This lets TypeScript know that XLSX is available on the window object from the CDN script
declare const XLSX: any;

interface ExportButtonsProps {
  leads: Lead[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ leads }) => {
  
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ["Name", "Category", "Priority", "Notes", "Email", "Phone", "Address", "Website", "Image URL", "Facebook", "LinkedIn", "Twitter", "Instagram"];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => 
        [
          `"${(lead.name || '').replace(/"/g, '""')}"`,
          `"${(lead.category || '').replace(/"/g, '""')}"`,
          `"${(lead.priority || '').replace(/"/g, '""')}"`,
          `"${(lead.notes || '').replace(/"/g, '""')}"`,
          `"${(lead.email || '').replace(/"/g, '""')}"`,
          `"${(lead.phone || '').replace(/"/g, '""')}"`,
          `"${(lead.address || '').replace(/"/g, '""')}"`,
          `"${(lead.website || '').replace(/"/g, '""')}"`,
          `"${(lead.imageUrl || '').replace(/"/g, '""')}"`,
          `"${(lead.socialMedia.facebook || '').replace(/"/g, '""')}"`,
          `"${(lead.socialMedia.linkedin || '').replace(/"/g, '""')}"`,
          `"${(lead.socialMedia.twitter || '').replace(/"/g, '""')}"`,
          `"${(lead.socialMedia.instagram || '').replace(/"/g, '""')}"`,
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (leads.length === 0 || typeof XLSX === 'undefined') {
        alert('Excel export functionality is not available.');
        return;
    };
    
    const dataToExport = leads.map(lead => ({
        Name: lead.name,
        Category: lead.category,
        Priority: lead.priority,
        Notes: lead.notes,
        Email: lead.email,
        Phone: lead.phone,
        Address: lead.address,
        Website: lead.website,
        "Image URL": lead.imageUrl,
        Facebook: lead.socialMedia.facebook,
        LinkedIn: lead.socialMedia.linkedin,
        Twitter: lead.socialMedia.twitter,
        Instagram: lead.socialMedia.instagram,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, 'leads.xlsx');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportCSV}
        disabled={leads.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <CsvIcon />
        <span>Export CSV</span>
      </button>
      <button
        onClick={handleExportExcel}
        disabled={leads.length === 0}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 rounded-md hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ExcelIcon />
        <span>Export Excel</span>
      </button>
    </div>
  );
};

export default ExportButtons;