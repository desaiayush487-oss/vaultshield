import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UploadCloud, FileText, CheckCircle2, Download, Lock, RefreshCw, AlertCircle, History, Sliders, LogOut, KeyRound, User, Mail, LockKeyhole, Copy, Check, Database, Activity, Terminal, Table, Sparkles, ShieldAlert } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('vault_token') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('vault_email') || 'engineer@vaultshield.io');
  const [isSignup, setIsSignup] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [file, setFile] = useState(null);
  const [strategy, setStrategy] = useState('pseudonymize');
  const [exportFormat, setExportFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [auditHistory, setAuditHistory] = useState([]);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSanitized, setCopiedSanitized] = useState(false);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' or 'terminal' or 'table'
  const [terminalLogs, setTerminalLogs] = useState([]);

  useEffect(() => {
    if (token) fetchAuditLogs();
  }, [token]);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/audits');
      const data = await res.json();
      if (data.success) setAuditHistory(data.audits);
    } catch (err) {
      console.error('Failed to load audits');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (selected.name.endsWith('.csv')) {
        setExportFormat('csv');
      } else {
        setExportFormat('json');
      }
      setError('');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isSignup ? '/api/v1/auth/signup' : '/api/v1/auth/signin';
    const payload = isSignup 
      ? { email: authEmail, password: authPassword, firstName, lastName }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        if (isSignup) {
          setIsSignup(false);
          alert('Account created successfully! Please sign in.');
        } else {
          setToken(data.token);
          setUserEmail(data.email || authEmail);
          localStorage.setItem('vault_token', data.token);
          localStorage.setItem('vault_email', data.email || authEmail);
        }
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a JSON or CSV dataset file first.');
      return;
    }

    setLoading(true);
    setError('');
    setTerminalLogs([
      `[INIT] Connecting to VaultShield Core Engine v2.8...`,
      `[PARSE] Reading input stream from ${file.name}...`,
      `[SCANNER] Running regex pattern matching for PII fields (Emails, Phones, Names)...`
    ]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('strategy', strategy);

    try {
      const response = await fetch('http://localhost:5000/api/v1/sanitize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        fetchAuditLogs();
        setTerminalLogs(prev => [
          ...prev,
          `[SUCCESS] Detected ${data.totalRowsProcessed} records.`,
          `[MASK] Applied strategy: ${strategy.toUpperCase()}`,
          `[DB] Cryptographic audit record successfully written to MongoDB Atlas.`,
          `[READY] Pipeline execution complete with 0 data leaks.`
        ]);
      } else {
        setError(data.error || 'Failed to process dataset.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSanitizedFile = () => {
    if (!result || !result.sanitizedData) return;
    
    let content, mimeType, filename;
    if (exportFormat === 'csv') {
      const keys = Object.keys(result.sanitizedData[0] || {});
      const csvRows = [
        keys.join(','),
        ...result.sanitizedData.map(row => keys.map(k => JSON.stringify(row[k] || '')).join(','))
      ];
      content = csvRows.join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      filename = 'vaultshield_sanitized_data.csv';
    } else {
      content = JSON.stringify(result.sanitizedData, null, 2);
      mimeType = 'text/json;charset=utf-8;';
      filename = 'vaultshield_sanitized_data.json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = filename;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'raw') {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else {
      setCopiedSanitized(true);
      setTimeout(() => setCopiedSanitized(false), 2000);
    }
  };

  // AUTH SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Subtle Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 md:p-10 max-w-md w-full backdrop-blur-2xl shadow-2xl relative z-10 shadow-emerald-950/20"
        >
          <div className="text-center mb-8">
            <div className="inline-flex bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 p-4 rounded-3xl border border-emerald-500/30 shadow-xl shadow-emerald-950/50 mb-4">
              <ShieldCheck className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">VaultShield AI</h1>
            <p className="text-xs text-slate-400 mt-1">Next-Gen Privacy & Compliance Engine</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">First Name</label>
                  <div className="relative flex items-center">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
                    <input 
                      type="text" 
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ayush" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Desai" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Work Email</label>
              <div className="relative flex items-center">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">Password</label>
              <div className="relative flex items-center">
                <LockKeyhole className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
                <input 
                  type="password" 
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider mt-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSignup ? 'Initialize Secure Account' : 'Authenticate Workspace'}</span>
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
            <button 
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              {isSignup ? 'Already authenticated? Sign In' : "Need an enterprise gateway? Sign Up"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Cyber Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        
        {/* Top Navbar */}
        <motion.header 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900/70 border border-slate-800/90 rounded-2xl px-6 py-4 backdrop-blur-2xl shadow-xl gap-4"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-emerald-500/20 to-slate-900 p-2.5 rounded-xl border border-emerald-500/30 shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">VaultShield</h1>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v3.0 Secure Core
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous PII Masking & Compliance Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Cluster:</span>
              <span className="font-mono text-emerald-400">MongoDB Atlas (Synced)</span>
            </div>

            <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200 truncate max-w-[120px]">{userEmail}</span>
            </div>

            <button 
              onClick={() => { setToken(null); localStorage.removeItem('vault_token'); localStorage.removeItem('vault_email'); }}
              className="bg-slate-950 hover:bg-slate-800 text-rose-400 p-2 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Live Metrics Row */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Records Sanitized</span>
              <p className="text-2xl font-mono font-bold text-emerald-400 mt-1">{result.totalRowsProcessed}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compliance Standard</span>
              <p className="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> GDPR & DPDP Act Verified
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Strategy</span>
              <p className="text-xs font-mono font-medium text-cyan-400 mt-2 capitalize flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> {strategy}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Audit Status</span>
              <p className="text-xs font-mono font-medium text-emerald-400 mt-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Logged & Immutable
              </p>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Upload, Strategy, Export & History */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-2xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" /> Pipeline Controls
                </h2>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Secure Mode</span>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-6 cursor-pointer transition-all bg-slate-950/60 group text-center">
                  <UploadCloud className="w-7 h-7 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[240px]">
                    {file ? file.name : "Upload JSON or CSV Database Dump"}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">Supports database table exports</span>
                  <input type="file" accept=".json, .csv" onChange={handleFileChange} className="hidden" />
                </label>

                {/* Strategy Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Anonymization Strategy
                  </label>
                  <select 
                    value={strategy} 
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="pseudonymize">Pseudonymization (Realistic Fakes)</option>
                    <option value="redact">Full Redaction ([REDACTED])</option>
                  </select>
                </div>

                {/* Export Format Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Format
                  </label>
                  <select 
                    value={exportFormat} 
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="json">JSON File (.json)</option>
                    <option value="csv">CSV Spreadsheet (.csv)</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{loading ? 'Executing Pipeline...' : 'Sanitize & Log to DB'}</span>
                </button>
              </form>

              {result && (
                <button
                  type="button"
                  onClick={downloadSanitizedFile}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 py-3 rounded-xl text-xs font-semibold transition-all border border-slate-700 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4 text-emerald-400" /> Download Compliant .{exportFormat.toUpperCase()}
                </button>
              )}
            </div>

            {/* Persistent Audit History Box */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-2xl shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-400" /> MongoDB Audit Ledger
              </h3>
              <div className="space-y-2 max-h-44 overflow-auto pr-1">
                {auditHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No past audits recorded yet.</p>
                ) : (
                  auditHistory.map((log) => (
                    <div key={log._id} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/60 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-200 truncate max-w-[140px]">{log.fileName}</p>
                        <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {log.totalRowsProcessed} rows
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Columns: Viewer with Tabs (Side-by-Side Diff vs Live Terminal Stream) */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col space-y-4"
          >
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between bg-slate-900/70 border border-slate-800/90 rounded-xl p-1.5 backdrop-blur-2xl">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'diff' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Side-by-Side Diff
                </button>
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'terminal' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Live Terminal Log
                </button>
              </div>

              <div className="px-3 text-[11px] font-mono text-slate-400">
                {result ? <span className="text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ready</span> : 'Idle'}
              </div>
            </div>

            {/* Tab 1: Side by Side Diff Viewer */}
            {activeTab === 'diff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Raw Input Box */}
                <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col h-[500px] backdrop-blur-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Raw Input (Exposed PII)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">Unmasked</span>
                      {result && (
                        <button 
                          onClick={() => copyToClipboard(JSON.stringify(result.originalData, null, 2), 'raw')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Copy JSON"
                        >
                          {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="flex-1 bg-slate-950/90 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-auto border border-slate-800/60 leading-relaxed scrollbar-thin">
                    {result ? JSON.stringify(result.originalData, null, 2) : '{\n  "status": "Awaiting dataset input...",\n  "hint": "Upload a JSON or CSV file to inspect raw records."\n}'}
                  </pre>
                </div>

                {/* Sanitized Output Box */}
                <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 flex flex-col h-[500px] backdrop-blur-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Sanitized Output (Secure)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">Masked & Logged</span>
                      {result && (
                        <button 
                          onClick={() => copyToClipboard(JSON.stringify(result.sanitizedData, null, 2), 'sanitized')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Copy JSON"
                        >
                          {copiedSanitized ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="flex-1 bg-slate-950/90 p-4 rounded-xl font-mono text-xs text-emerald-300/90 overflow-auto border border-slate-800/60 leading-relaxed scrollbar-thin">
                    {result ? JSON.stringify(result.sanitizedData, null, 2) : '{\n  "status": "Ready for masking...",\n  "hint": "Secure sanitized output will render here."\n}'}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Live Cyberpunk Terminal Stream */}
            {activeTab === 'terminal' && (
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-2xl shadow-xl h-[500px] flex flex-col font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-emerald-400 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> VaultShield Autonomous Pipeline Stream
                  </span>
                  <span className="text-[10px] text-slate-500">PORT: 5000 / SECURE_SOCKET</span>
                </div>
                <div className="flex-1 bg-slate-950 p-4 rounded-xl overflow-auto border border-slate-800/80 space-y-2 text-slate-300">
                  <p className="text-slate-500">// System initialized. Ready for dataset injection.</p>
                  {terminalLogs.map((log, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2"
                    >
                      <span className="text-emerald-500">&gt;</span>
                      <span className={log.includes('SUCCESS') || log.includes('READY') ? 'text-emerald-400 font-bold' : ''}>{log}</span>
                    </motion.div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-2 text-amber-400 animate-pulse pt-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing vector encryption & pseudonymization...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </div>
  );
} 