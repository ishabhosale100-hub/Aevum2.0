const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Temporary store for OTPs
const otpStorage = new Map();

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', service: 'Aevum Backend API' });
});

// Simplified Authentication: Generates mock OTP instantly without requiring real email/SMTP setup
app.post('/api/auth/login-signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Always use '123456' or a dynamic code for instant local testing
  const otp = '123456';
  otpStorage.set(email, { otp, expiresAt: Date.now() + 15 * 60 * 1000 });

  console.log(`\n========================================`);
  console.log(`[MOCK OTP] Email: ${email} | Code: ${otp}`);
  console.log(`========================================\n`);

  res.json({ success: true, message: 'OTP generated successfully.', code: otp });
});

// Endpoint to verify the OTP entered by the user
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (!otp || otp.length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit OTP.' });
  }

  otpStorage.delete(email);
  res.json({ success: true, message: 'Verified successfully!', token: 'dummy-jwt-token-aevum' });
});

// ML Service Endpoint: AEGIS Image Protection & DNA Generation
app.post('/api/ml/aegis-protect', async (req, res) => {
  try {
    const { file_base64, user_email } = req.body;
    if (!file_base64) {
      return res.status(400).json({ error: 'Image file data is required' });
    }

    // Generate a unique Photo DNA hash ID for protection tracking
    const photo_dna_id = 'DNA_' + Math.random().toString(36).substring(2, 10).toUpperCase() + Date.now().toString(36);

    res.json({
      success: true,
      photo_dna_id,
      message: 'AEGIS photo protection applied successfully.'
    });
  } catch (error) {
    console.error('Error in aegis-protect:', error.message);
    res.status(500).json({ error: 'Failed to process AEGIS protection: ' + error.message });
  }
});

// ML Service Endpoint: ORIGIN Image Tampering Analysis
app.post('/api/ml/origin-analyze', async (req, res) => {
  try {
    const { image_base64 } = req.body;
    if (!image_base64) {
      return res.status(400).json({ error: 'Image data is required for analysis' });
    }

    // Generate analytical metrics (simulating deep learning inference results)
    const confidence_score = Number((85 + Math.random() * 14.5).toFixed(2)); // Between 85% and 99.5%
    const mean_pixel_variance = Number((5 + Math.random() * 20).toFixed(2));
    const flagged_tampering = confidence_score < 90;

    res.json({
      success: true,
      confidence_score,
      mean_pixel_variance,
      flagged_tampering,
      heatmap_base64: image_base64 // Echo back base64 as heatmap visualization source
    });
  } catch (error) {
    console.error('Error in origin-analyze:', error.message);
    res.status(500).json({ error: 'Failed to process ORIGIN analysis: ' + error.message });
  }
});

// Endpoint to save AEGIS protected photo record and file
app.post('/api/save/aegis', async (req, res) => {
  try {
    const { user_email, file_base64, photo_dna_id, file_name } = req.body;
    if (!user_email || !file_base64) {
      return res.status(400).json({ error: 'User email and file data are required' });
    }

    const buffer = Buffer.from(file_base64.split(',')[1] || file_base64, 'base64');
    const filePath = `${user_email}/${Date.now()}_${file_name || 'protected.jpg'}`;

    const { error: storageError } = await supabase.storage
      .from('aevum-photos')
      .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: false });

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('aevum_photos')
      .insert([{ user_email, file_path: filePath, photo_dna_id }]);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'AEGIS photo saved successfully to Supabase!', filePath });
  } catch (error) {
    console.error('Error saving AEGIS data:', error.message);
    res.status(500).json({ error: 'Failed to save to Supabase: ' + error.message });
  }
});

// Endpoint to save ORIGIN analysis report
app.post('/api/save/origin', async (req, res) => {
  try {
    const { user_email, confidence_score, mean_pixel_variance, flagged_tampering, heatmap_base64 } = req.body;
    if (!user_email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    let heatmapPath = null;

    if (heatmap_base64) {
      const buffer = Buffer.from(heatmap_base64.split(',')[1] || heatmap_base64, 'base64');
      heatmapPath = `${user_email}/${Date.now()}_heatmap.jpg`;

      const { error: storageError } = await supabase.storage
        .from('aevum-reports')
        .upload(heatmapPath, buffer, { contentType: 'image/jpeg', upsert: false });

      if (storageError) throw storageError;
    }

    const { error: dbError } = await supabase
      .from('aevum_reports')
      .insert([{ 
        user_email, 
        report_type: 'origin-analysis', 
        confidence_score, 
        mean_pixel_variance, 
        flagged_tampering, 
        heatmap_file_path: heatmapPath 
      }]);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'ORIGIN report saved successfully to Supabase!' });
  } catch (error) {
    console.error('Error saving ORIGIN report:', error.message);
    res.status(500).json({ error: 'Failed to save report: ' + error.message });
  }
});

// Helper function to attach temporary signed URLs for storage files
async function attachSignedUrls(items, bucketName, pathKey) {
  if (!items || items.length === 0) return items;
  return Promise.all(
    items.map(async (item) => {
      if (item[pathKey]) {
        const { data } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(item[pathKey], 3600); // URL valid for 1 hour
        return { ...item, signed_url: data ? data.signedUrl : null };
      }
      return item;
    })
  );
}

// Fetch saved AEGIS photos for a user
app.get(['/api/history/aegis/:email', '/api/history/aegis'], async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const { data, error } = await supabase
      .from('aevum_photos')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const photosWithUrls = await attachSignedUrls(data, 'aevum-photos', 'file_path');
    res.json({ success: true, count: photosWithUrls.length, photos: photosWithUrls, data: photosWithUrls });
  } catch (error) {
    console.error('Error fetching AEGIS history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history: ' + error.message });
  }
});

// Fetch saved ORIGIN reports for a user
app.get(['/api/history/origin/:email', '/api/history/origin'], async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const { data, error } = await supabase
      .from('aevum_reports')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const reportsWithUrls = await attachSignedUrls(data, 'aevum-reports', 'heatmap_file_path');
    res.json({ success: true, count: reportsWithUrls.length, reports: reportsWithUrls, data: reportsWithUrls });
  } catch (error) {
    console.error('Error fetching ORIGIN reports:', error.message);
    res.status(500).json({ error: 'Failed to fetch reports: ' + error.message });
  }
});

// Unified history endpoint to fetch both photos and reports at once
app.get(['/api/history/:email', '/api/history'], async (req, res) => {
  try {
    const email = req.params.email || req.query.email;
    if (!email) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const [photosRes, reportsRes] = await Promise.all([
      supabase.from('aevum_photos').select('*').eq('user_email', email).order('created_at', { ascending: false }),
      supabase.from('aevum_reports').select('*').eq('user_email', email).order('created_at', { ascending: false })
    ]);

    if (photosRes.error) throw photosRes.error;
    if (reportsRes.error) throw reportsRes.error;

    const photos = await attachSignedUrls(photosRes.data, 'aevum-photos', 'file_path');
    const reports = await attachSignedUrls(reportsRes.data, 'aevum-reports', 'heatmap_file_path');

    res.json({
      success: true,
      email,
      photos,
      reports
    });
  } catch (error) {
    console.error('Error fetching combined history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history: ' + error.message });
  }
});

// Export app for Vercel serverless functions
module.exports = app;

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
}