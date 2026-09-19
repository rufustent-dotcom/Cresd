import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertCircle, XCircle, Plus, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'cresd_websites';

const DEFAULT_WEBSITES = [
  "https://www.google.com",
  "https://www.facebook.com",
  "https://www.twitter.com",
  "https://www.bing.com",
  "https://www.youtube.com",
];

export default function App() {
  const [websites, setWebsites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (error) {
        console.error("Failed to load websites from localStorage:", error);
      }
    }
    return DEFAULT_WEBSITES;
  });
  const [newUrl, setNewUrl] = useState('');
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(websites));
    } catch (error) {
      console.error("Failed to save websites to localStorage:", error);
    }
  }, [websites]);

  const addWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    
    let urlToAdd = newUrl.trim();
    if (!urlToAdd.startsWith('http://') && !urlToAdd.startsWith('https://')) {
      urlToAdd = 'https://' + urlToAdd;
    }
    
    if (!websites.includes(urlToAdd)) {
      setWebsites([...websites, urlToAdd]);
    }
    setNewUrl('');
  };

  const removeWebsite = (url: string) => {
    setWebsites(websites.filter(w => w !== url));
    if (results) {
      const newResults = { ...results };
      delete newResults[url];
      setResults(newResults);
    }
  };

  const checkWebsites = async () => {
    if (websites.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websites })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Failed to check websites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'UP': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'DOWN': return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <div className="w-5 h-5 rounded-full border-2 border-slate-200" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cresd</h1>
            <p className="text-sm text-slate-500 font-medium">Website Status Checker</p>
          </div>
        </header>

        <main className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <form onSubmit={addWebsite} className="flex gap-3">
              <input
                id="url-input"
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button
                id="add-url-button"
                type="submit"
                disabled={!newUrl.trim()}
                className="px-4 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </form>
          </div>

          <div className="divide-y divide-slate-100">
            {websites.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No websites added yet. Add a URL above to get started.
              </div>
            ) : (
              websites.map((url) => (
                <div key={url} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(results?.[url])}
                    <div>
                      <p className="font-medium text-slate-700">{url}</p>
                      {results?.[url] && (
                        <p className={`text-xs font-semibold tracking-wide ${
                          results[url] === 'UP' ? 'text-emerald-600' :
                          results[url] === 'DOWN' ? 'text-rose-600' : 'text-amber-600'
                        }`}>
                          {results[url]}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeWebsite(url)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 outline-none cursor-pointer"
                    title="Remove website"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <p className="text-sm text-slate-500 font-medium">
              {websites.length} website{websites.length !== 1 ? 's' : ''} configured
            </p>
            <button
              id="run-check-button"
              onClick={checkWebsites}
              disabled={isLoading || websites.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Run Check</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
