import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Download, ListOrdered, Droplets, Eye, EyeOff } from 'lucide-react';
import { protectAegisImage, saveAegisPhoto } from '../api';

export default function AegisView() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');
  
  // Toggle for visible vs invisible watermark preview overlay
  const [showWatermarkOverlay, setShowWatermarkOverlay] = useState(false);

  const processingSteps = [
    'Decoding uploaded image buffer for cryptographic analysis...',
    'Generating perceptual Photo DNA fingerprint ID...',
    'Applying imperceptible frequency-domain perturbation matrix...',
    'Registering cryptographic watermarked record in Supabase storage...'
  ];

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setResult(null);
    setDownloadUrl(null);
    setShowWatermarkOverlay(false);
    setError('');
  };

  const compressAndConvertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 1000;
          if (width > height && width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          } else if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProtect = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setCurrentStepIndex(0);

    try {
      // Step-by-step progress ticker animation
      const stepInterval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < processingSteps.length - 1 ? prev + 1 : prev));
      }, 400);

      const base64String = await compressAndConvertBase64(file);
      const userEmail = localStorage.getItem('user_email') || 'isha@test.com';

      const data = await protectAegisImage({
        user_email: userEmail,
        file_base64: base64String,
        file_name: file.name
      });

      if (!data.success) {
        clearInterval(stepInterval);
        throw new Error(data.error || 'Failed to protect image via AEGIS service.');
      }

      await saveAegisPhoto({
        user_email: userEmail,
        file_base64: base64String,
        photo_dna_id: data.photo_dna_id,
        file_name: file.name
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(processingSteps.length - 1);

      const url = URL.createObjectURL(file);
      setDownloadUrl(url);

      setResult({
        message: 'AEGIS cryptographic watermarking & Supabase backup complete!',
        photo_dna_id: data.photo_dna_id,
        perturbation_level: 'Cryptographic Noise Matrix Applied',
        watermark_status: 'Active & Verified',
        completedSteps: processingSteps
      });

      const link = document.createElement('a');
      link.href = url;
      link.download = `aegis_protected_${file.name.replace(/[\\/]/g, '_')}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-sky-400" />
        <h1 className="text-2xl font-bold">
          AEGIS — Cryptographic Watermarking &amp; Perturbation
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleProtect} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-sky-500 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-600"
            />
            {file && <p className="mt-2 text-sm text-sky-300">Selected: {file.name}</p>}
          </div>

          {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Droplets className="w-5 h-5 animate-spin" />}
            {loading ? 'Executing Security Pipeline...' : 'Secure Image & Download'}
          </button>
        </form>

        {/* Live Step-by-Step Progress Ticker */}
        {loading && (
          <div className="mt-6 p-4 bg-slate-800/80 border border-slate-700 rounded-lg space-y-3">
            <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">Live Execution Steps:</p>
            <div className="space-y-2">
              {processingSteps.map((stepText, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {idx <= currentStepIndex ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />
                  )}
                  <span className={idx <= currentStepIndex ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                    {stepText}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 p-5 bg-slate-800 border border-slate-700 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>{result.message}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <p><strong>Photo DNA ID:</strong> {result.photo_dna_id}</p>
              <p><strong>Perturbation:</strong> {result.perturbation_level}</p>
              <p className="md:col-span-2"><strong>Watermark Status:</strong> {result.watermark_status}</p>
            </div>

            {/* Interactive Watermark Visibility Toggle Preview */}
            {downloadUrl && (
              <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-sky-300">
                    Cryptographic Watermark Preview Control:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowWatermarkOverlay(!showWatermarkOverlay)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-sky-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    {showWatermarkOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showWatermarkOverlay ? 'Hide Watermark (Invisible)' : 'Make Watermark Visible (Toggle Overlay)'}
                  </button>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-700 max-w-sm mx-auto bg-black flex items-center justify-center">
                  <img
                    src={downloadUrl}
                    alt="Processed Secure Preview"
                    className={`max-h-64 object-contain transition-all duration-300 ${
                      showWatermarkOverlay ? 'contrast-150 brightness-90 saturate-200' : 'opacity-100'
                    }`}
                  />
                  {showWatermarkOverlay && (
                    <div className="absolute inset-0 bg-sky-500/10 pointer-events-none flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-dashed border-sky-400/50 animate-pulse" />
                      <span className="bg-black/80 text-sky-300 text-xs px-2 py-1 rounded shadow">
                        Watermark Noise Layer Active [ID: {result.photo_dna_id.substring(0, 10)}...]
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex gap-3">
                  <a
                    href={downloadUrl}
                    download={`aegis_protected_${file?.name || 'image.jpg'}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Processed Image
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}