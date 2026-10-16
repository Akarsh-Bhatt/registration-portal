import React, { useState } from 'react';
import { 
  X, Database, ShieldCheck, CheckCircle2, AlertCircle, 
  ExternalLink, Key, Server, Copy, Check
} from 'lucide-react';

export default function AtlasConfigModal({ isOpen, onClose, atlasStatus, onStatusUpdated }) {
  const [uri, setUri] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!uri.trim()) return;

    setConnecting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/connect-atlas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: uri.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Connection to MongoDB Atlas failed.');
      }

      setSuccessMsg(data.message || 'Successfully connected to MongoDB Atlas!');
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Connection failed.');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              MongoDB Atlas Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect your cloud database to store participants online permanently
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${atlasStatus?.connected_to_atlas ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <p className="text-xs font-bold text-white">
                Status: {atlasStatus?.connected_to_atlas ? 'Connected to MongoDB Atlas' : 'Local Cache Active'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Database: {atlasStatus?.database_name || 'upes_club_portal'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            atlasStatus?.connected_to_atlas
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {atlasStatus?.connected_to_atlas ? 'Online Cloud' : 'Ready for URI'}
          </span>
        </div>

        {/* Form to connect URI */}
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">
              MongoDB Atlas Connection String (SRV)
            </label>
            <input
              type="text"
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              placeholder="mongodb+srv://<username>:<password>@cluster0.xyz.mongodb.net/?retryWrites=true&w=majority"
              className="w-full px-4 py-3 rounded-xl text-xs font-mono glass-input text-white placeholder-slate-500 outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              You can also specify this permanently in <code className="text-indigo-300">backend/.env</code> as <code className="text-indigo-300">MONGODB_URI</code>.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={connecting || !uri.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {connecting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Atlas...</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5" />
                  <span>Connect & Save to Atlas</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Setup Guide Checklist */}
        <div className="mt-6 pt-5 border-t border-white/10 text-xs text-slate-400 space-y-2">
          <p className="font-bold text-white flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" /> Free MongoDB Atlas Setup (3 Minutes):
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
            <li>Create a free cluster on <a href="https://cloud.mongodb.com" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-0.5">mongodb.com/cloud/atlas <ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li>In <strong>Security &gt; Database Access</strong>, add a Database User with password</li>
            <li>In <strong>Security &gt; Network Access</strong>, add IP Address: <code className="text-white bg-slate-800 px-1 rounded">0.0.0.0/0</code></li>
            <li>Click <strong>Connect &gt; Drivers (Python)</strong> and paste the connection string above</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
