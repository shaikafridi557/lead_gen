import React, { useState, useCallback } from 'react';
import { Lead, GroundingSource } from './types';
import { generateLeadsStream } from './services/geminiService';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import LeadTable from './components/LeadTable';
import ExportButtons from './components/ExportButtons';
import Spinner from './components/Spinner';
import AddLeadModal from './components/AddLeadModal';
import GroundingSources from './components/GroundingSources';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleSearch = useCallback(async (query: string, count: number) => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLeads([]);
    setSources([]);

    try {
      const finalLeads = await generateLeadsStream(
        query,
        count,
        (updatedLeads) => setLeads(updatedLeads),
        (groundingSources) => setSources(groundingSources)
      );

      if (finalLeads.length === 0) {
        setError('Could not find leads for your query using Google Search. Try a different search.');
      }
    } catch (err: any) {
      console.error('Error generating leads:', err);
      setError(err.message || 'An error occurred while generating leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleAddLead = (newLead: Lead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
    setIsModalOpen(false);
  };

  const handleRemoveLead = (indexToRemove: number) => {
    setLeads(prevLeads => prevLeads.filter((_, index) => index !== indexToRemove));
  };
  
  const handleUpdateLead = (indexToUpdate: number, updatedLead: Lead) => {
    setLeads(prevLeads => prevLeads.map((lead, index) => 
        index === indexToUpdate ? updatedLead : lead
    ));
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-slate-400 mb-6">
            Enter a query like "restaurants in san francisco without a website" or "local law firms with outdated sites" to find business leads.
          </p>
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
          
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
              <p>{error}</p>
            </div>
          )}

          {!isLoading && sources.length > 0 && (
            <GroundingSources sources={sources} />
          )}


          {isLoading && (
            <div className="mt-8 flex flex-col items-center justify-center">
              <Spinner />
              <p className="mt-4 text-slate-300">Finding leads... results will appear as they are found.</p>
            </div>
          )}

          {!isLoading && (leads.length > 0 || !error || sources.length > 0) && (
            <div className="mt-10 bg-slate-800/50 rounded-lg shadow-lg p-1 ring-1 ring-white/10">
              <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-wrap gap-4">
                <h2 className="text-xl font-semibold text-white">Your Leads</h2>
                <div className="flex items-center gap-2">
                  <ExportButtons leads={leads} />
                   <button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors"
                    >
                      <span>Add Lead</span>
                   </button>
                </div>
              </div>
              <LeadTable leads={leads} onRemoveLead={handleRemoveLead} onUpdateLead={handleUpdateLead} />
            </div>
          )}
        </div>
      </main>
      
      {isModalOpen && <AddLeadModal onAddLead={handleAddLead} onClose={() => setIsModalOpen(false)} />}

      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Lead Gen by <span className="font-semibold text-slate-400">code.serve</span></p>
      </footer>
    </div>
  );
};

export default App;