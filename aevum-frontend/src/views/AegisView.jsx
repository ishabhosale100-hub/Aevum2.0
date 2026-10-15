
import React, { useState, useEffect } from 'react';
import { Shield, Upload, CheckCircle, Download, ListOrdered } from 'lucide-react';

export default function AegisView() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  // Release the previous temporary download URL when replaced or unmounted.
  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setDownloadUrl(null);
    setError('');
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Uses the frontend domain; Vercel forwards this to the ML service.
      const response = await fetch('/api/ml/aegis-protect', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let message = 'Failed to protect image via AEGIS service.';
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

      const photoDnaId =
        response.headers.get('x-photo-dna-id') || 'Unavailable';

      const stepsHeader = response.headers.get('x-watermark-steps') || '';
      const watermarkSteps = stepsHeader
        ? stepsHeader.split(' | ')
        : [
            'Image decoded and converted for processing.',
            'Image perturbation applied by the configured processing pipeline.',
            'Processed image encoded for download.',
            'Perceptual Photo DNA ID generated.',
          ];

      const blob = await response.blob();

      if (!blob.type.startsWith('image/')) {
        throw new Error('The service did not return a valid image.');
      }

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setResult({
        message: 'AEGIS image processing completed successfully',
        photo_dna_id: photoDnaId,
        perturbation_level: 'See processing details below',
        watermark_status: 'Cryptographic watermark not verified',
        steps: watermarkSteps,
      });

      // Automatically download the processed image.
      const link = document.createElement('a');
      link.href = url;
      link.download = `aegis_protected_${file.name.replace(/[\\/]/g, '_')}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while processing the image.'
      );
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

            {file && (
              <p className="mt-2 text-sm text-sky-300">
                Selected: {file.name}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-red-400 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
          >
            {loading
              ? 'Processing image...'
              : 'Secure Image & Download'}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-5 bg-slate-800 border border-slate-700 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-5 h-5" />
              <span>{result.message}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
              <p>
                <strong>Photo DNA ID:</strong> {result.photo_dna_id}
              </p>
              <p>
                <strong>Perturbation:</strong>{' '}
                {result.perturbation_level}
              </p>
              <p className="md:col-span-2">
                <strong>Watermark Status:</strong>{' '}
                {result.watermark_status}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
                <ListOrdered className="w-4 h-4" />
                <span className="text-sm">
                  Image Processing Execution Steps:
                </span>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc">
                {result.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>

            {downloadUrl && (
              <div className="pt-2">
                <a
                  href={downloadUrl}
                  download={`aegis_protected_${file?.name || 'image.jpg'}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Processed Image Again
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
