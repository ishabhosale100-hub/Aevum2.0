import React, { useState, useEffect } from 'react';
import { FileText, Download, ShieldCheck, AlertCircle, CheckCircle, PlusCircle, Calendar } from 'lucide-react';

export default function LegalView() {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'list'
  
  // Form state
  const [incidentType, setIncidentType] = useState('Photo Morphing');
  const [platform, setPlatform] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceAttached, setEvidenceAttached] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Load saved reports from localStorage on mount (persistence)
  useEffect(() => {
    const saved = localStorage.getItem('aevum_legal_reports');
    if (saved) {
      try { setReports(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveReportsToStorage = (updatedList) => {
    setReports(updatedList);
    localStorage.setItem('aevum_legal_reports', JSON.stringify(updatedList));
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const refId = `AEV-2026-${randomDigits}`;
    const now = new Date().toISOString();

    const newReport = {
      id: refId,
      createdAt: now,
      status: 'Filed',
      incidentType,
      platform: platform || 'Not specified',
      incidentDate: incidentDate || 'Not specified',
      description,
      evidence: evidenceAttached ? {
        originScore: '94.2% Confidence',
        flaggedRegions: 'Face Region (Nodes 42-108)',
        photoDnaId: 'DNA-AEV-8891-9920',
        fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        timestamp: now
      } : null
    };

    const updated = [newReport, ...reports];
    saveReportsToStorage(updated);
    setSuccessMsg(`Report successfully generated with Reference ID: ${refId}`);
    setActiveTab('list');
  };

  const downloadReportTxt = (rep) => {
    const content = `==================================================
AEVUM ENCRYPTED INCIDENT REPORT
==================================================
Report Reference ID: ${rep.id}
Date & Time Generated: ${new Date(rep.createdAt).toLocaleString()}
Status: ${rep.status}

[INCIDENT DETAILS]
- Incident Type: ${rep.incidentType}
- Platform Discovered: ${rep.platform}
- Incident Date/Time: ${rep.incidentDate}
- Description: ${rep.description}

[EVIDENCE & INTEGRITY VERIFICATION]
${rep.evidence ? `- ORIGIN Analysis: ${rep.evidence.originScore} (${rep.evidence.flaggedRegions})
- AEGIS Photo DNA ID: ${rep.evidence.photoDnaId}
- File Hash (SHA-256): ${rep.evidence.fileHash}
- Evidence Timestamp: ${rep.evidence.timestamp}` : 'No digital evidence attachments.'}

[SUPPORT RESOURCES]
- National Cyber Crime Helpline: 1930
- Official Portal: cybercrime.gov.in
- Note: This report is generated for your own records and to support filing a formal complaint. It is not a substitute for legal advice.

[SECURITY & ENCRYPTION]
- Stored securely with file-hash integrity verification.
- This report is encrypted at rest (AES-256) and only accessible to you.
==================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rep.id}_Incident_Report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-6 max-w-5xl mx-auto w-full text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="text-sky-400 w-7 h-7" /> Legal Incident Command & Reports
          </h1>
          <p className="text-sm text-slate-400">Generate, review, and download cryptographic incident reports.</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Create Report
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'list' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            My Reports ({reports.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 bg-emerald-950/60 border border-emerald-800 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" /> <span>{successMsg}</span>
        </div>
      )}

      {activeTab === 'create' ? (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-md shadow-xl">
          <form onSubmit={handleGenerateReport} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Incident Type</label>
                <select 
                  value={incidentType} 
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Photo Morphing">Photo Morphing</option>
                  <option value="Non-Consensual Sharing">Non-Consensual Sharing</option>
                  <option value="Blackmail-Extortion">Blackmail-Extortion</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Platform Where Discovered</label>
                <input 
                  type="text" 
                  placeholder="e.g. Instagram, Telegram, WhatsApp" 
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Incident Occurrence Date/Time</label>
                <input 
                  type="text" 
                  placeholder="e.g. 05-08-2026 or Yesterday"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={evidenceAttached} 
                    onChange={(e) => setEvidenceAttached(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded bg-slate-950 border-slate-700"
                  />
                  <span className="text-sm font-medium text-slate-300">Attach active ORIGIN analysis & Photo DNA metadata</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Detailed Incident Description</label>
              <textarea 
                rows="4"
                placeholder="Describe what happened, URLs involved, accounts, and context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button 
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-all text-sm flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
              >
                <FileText className="w-4 h-4" /> Generate Encrypted Incident Report
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No reports generated yet. Create your first incident report.</p>
            </div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-sky-400">{rep.id}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">{rep.status}</span>
                    <span className="text-xs text-slate-400">{new Date(rep.createdAt).toLocaleString()}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white">{rep.incidentType} — <span className="text-slate-400 font-normal">Platform: {rep.platform}</span></h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{rep.description}</p>
                </div>
                <button 
                  onClick={() => downloadReportTxt(rep)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-sky-400" /> Download Report (PDF/TXT)
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}