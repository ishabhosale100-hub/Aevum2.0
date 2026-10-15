
import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Search,
  MapPin,
  Droplets,
} from 'lucide-react';

export default function OriginView() {
  const [original, setOriginal] = useState(null);
  const [suspected, setSuspected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e, setter) => {
    setter(e.target.files?.[0] || null);
    setAnalysis(null);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!original || !suspected) {
      setError('Please upload both original and suspected images.');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setError('');

    const formData = new FormData();
    formData.append('original', original);
    formData.append('suspected', suspected);

    try {
      // Uses the frontend domain; Vercel forwards this to the ML service.
      const response = await fetch('/api/ml/origin-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let message = 'Analysis failed via ORIGIN microservice.';
        try {
          const data = await response.json();
          if (data.detail || data.error || data.message) {
            message = data.detail || data.error || data.message;
          }
        } catch {
          // Keep the default error message if the response is not JSON.
        }
        throw new Error(message);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during image analysis.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-8 h-8 text-sky-400" />
        <h1 className="text-2xl font-bold">
          ORIGIN — Pixel-Level Tampering &amp; Deepfake Detector
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <form
          onSubmit={handleAnalyze}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:border-sky-500 transition-colors cursor-pointer">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Original Reference Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setOriginal)}
              className="text-sm text-slate-400 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-sky-500 file:text-white hover:file:bg-sky-600"
            />

            {original && (
              <p className="mt-2 text-xs text-sky-300 truncate">
                Selected: {original.name}
              </p>
            )}
          </div>

          <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:border-sky-500 transition-colors cursor-pointer">
            <label className="block text-sm font-medium mb-2 text-slate-300">
              Suspected / Target Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setSuspected)}
              className="text-sm text-slate-400 block w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-sky-500 file:text-white hover:file:bg-sky-600"
            />

            {suspected && (
              <p className="mt-2 text-xs text-sky-300 truncate">
                Selected: {suspected.name}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="col-span-2 text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-800"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="col-span-2 py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Droplets className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            {loading
              ? 'Running Pixel Differential Analysis...'
              : 'Run ORIGIN Analysis'}
          </button>
        </form>

        {analysis && (
          <div
            className={`p-5 rounded-lg border space-y-4 ${
              analysis.flagged_tampering
                ? 'bg-red-950/30 border-red-800 text-red-200'
                : 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-3 font-bold text-xl">
              {analysis.flagged_tampering ? (
                <AlertTriangle className="w-7 h-7 text-red-400" />
              ) : (
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              )}

              <span>
                {analysis.flagged_tampering
                  ? 'Significant Pixel Differences Detected'
                  : 'No Significant Pixel Differences Detected'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-black/20 p-3 rounded-lg border border-white/5">
              <p>
                <strong>Difference Score:</strong>{' '}
                <span className="text-lg">
                  {analysis.manipulation_confidence ?? 'N/A'}
                </span>
              </p>
              <p>
                <strong>Mean Pixel Difference:</strong>{' '}
                {analysis.mean_pixel_variance ?? 'N/A'}
              </p>
            </div>

            {analysis.tampered_regions_detected?.length > 0 && (
              <div className="text-xs text-slate-300 border-t border-white/5 pt-3">
                <div className="flex items-center gap-2 font-semibold text-sky-300 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Detected Difference Regions:</span>
                </div>

                <ul className="list-disc pl-5 space-y-1">
                  {analysis.tampered_regions_detected.map((region, idx) => (
                    <li key={idx}>{region}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.heatmap_image_base64 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-sky-300 mb-2">
                  ORIGIN Difference Heatmap — Highlighted Regions in Red
                </p>

                <div className="relative group">
                  <img
                    src={analysis.heatmap_image_base64}
                    alt="Difference heatmap showing pixel discrepancies between the two images."
                    className="rounded-lg border-2 border-[#ff4d4d] shadow-2xl w-full max-w-lg mx-auto object-contain"
                    style={{ maxHeight: '400px' }}
                  />

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <p className="text-white text-sm font-medium px-4 py-2 bg-black/70 rounded">
                      Pixel Differences Highlighted in Red
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 text-center italic">
                  Red areas indicate pixel differences, not definitive proof of
                  tampering or a deepfake.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
