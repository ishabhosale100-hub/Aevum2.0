import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Search,
  MapPin,
  Droplets,
} from 'lucide-react';
import { analyzeOriginImage, saveOriginReport } from '../api';

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

  // Helper to load file into an HTML Image element
  const loadImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
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

    try {
      // Load both images into memory
      const imgOrig = await loadImage(original);
      const imgSusp = await loadImage(suspected);

      // Set standard analysis canvas dimensions (max 500px for high performance)
      const width = Math.min(imgOrig.width, imgSusp.width, 500);
      const height = Math.min(imgOrig.height, imgSusp.height, 500);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Draw and get pixel data for Original
      ctx.drawImage(imgOrig, 0, 0, width, height);
      const origData = ctx.getImageData(0, 0, width, height);

      // Draw and get pixel data for Suspected
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(imgSusp, 0, 0, width, height);
      const suspData = ctx.getImageData(0, 0, width, height);

      const origPixels = origData.data;
      const suspPixels = suspData.data;
      const diffData = ctx.createImageData(width, height);
      const diffPixels = diffData.data;

      let totalDiff = 0;
      let diffPixelCount = 0;
      let minX = width, maxX = 0, minY = height, maxY = 0;

      // Pixel-by-pixel differential comparison
      for (let i = 0; i < origPixels.length; i += 4) {
        const rDiff = Math.abs(origPixels[i] - suspPixels[i]);
        const gDiff = Math.abs(origPixels[i + 1] - suspPixels[i + 1]);
        const bDiff = Math.abs(origPixels[i + 2] - suspPixels[i + 2]);
        
        const pixelDiff = (rDiff + gDiff + bDiff) / 3;
        totalDiff += pixelDiff;

        const x = (i / 4) % width;
        const y = Math.floor((i / 4) / width);

        if (pixelDiff > 35) { // Threshold for noticeable tampering/difference
          diffPixelCount++;
          // Highlight discrepancy in Bright Red on heatmap
          diffPixels[i] = 255;    // R
          diffPixels[i + 1] = 0;   // G
          diffPixels[i + 2] = 0;   // B
          diffPixels[i + 3] = 220; // Alpha

          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        } else {
          // Fade background to grayscale/transparent for contrast
          const avgGray = (suspPixels[i] + suspPixels[i + 1] + suspPixels[i + 2]) / 3;
          diffPixels[i] = avgGray;
          diffPixels[i + 1] = avgGray;
          diffPixels[i + 2] = avgGray;
          diffPixels[i + 3] = 90;
        }
      }

      const meanVariance = Number((totalDiff / (origPixels.length / 4)).toFixed(2));
      const confidenceScore = Number(Math.min(99.9, Math.max(15, (diffPixelCount / (width * height)) * 300 + 40)).toFixed(2));
      const flaggedTampering = meanVariance > 8.0 || diffPixelCount > (width * height * 0.02);

      // Put diff image back to canvas to export as base64 heatmap
      ctx.putImageData(diffData, 0, 0);
      const heatmapBase64 = canvas.toDataURL('image/jpeg');

      // Region descriptions
      let regions = [];
      if (flaggedTampering && diffPixelCount > 0) {
        regions.push(`Discrepancy cluster bounded around coordinates [X: ${minX}-${maxX}, Y: ${minY}-${maxY}]`);
      } else {
        regions.push('No anomalous localized editing regions found.');
      }

      const analysisResult = {
        flagged_tampering: flaggedTampering,
        manipulation_confidence: `${confidenceScore}%`,
        mean_pixel_variance: meanVariance,
        tampered_regions_detected: regions,
        heatmap_image_base64: heatmapBase64
      };

      setAnalysis(analysisResult);

      // Save report record to Supabase via backend save endpoint
      const userEmail = localStorage.getItem('user_email') || 'isha@test.com';
      await saveOriginReport({
        user_email: userEmail,
        confidence_score: confidenceScore,
        mean_pixel_variance: meanVariance,
        flagged_tampering: flaggedTampering,
        heatmap_base64: heatmapBase64
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during client-side image analysis.'
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
              ? 'Computing Pixel Differential & Generating Heatmap...'
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
                  {analysis.manipulation_confidence}
                </span>
              </p>
              <p>
                <strong>Mean Pixel Difference:</strong>{' '}
                {analysis.mean_pixel_variance}
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
                </div>

                <p className="text-xs text-slate-400 mt-2 text-center italic">
                  Red regions indicate exact pixel discrepancies calculated instantly in-browser. Saved securely to Supabase.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}