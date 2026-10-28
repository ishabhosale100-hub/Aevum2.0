```javascript
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));

// CORS configuration
const allowedOrigins = [
  'https://aevum2-0-ozz7.vercel.app',
  'https://aevum2-0-4nlz.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Temporary OTP store — demo use only
const otpStorage = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'active',
    service: 'Aevum Backend API'
  });
});

// Mock login/signup
app.post('/api/auth/login-signup', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Demo OTP only; not suitable for production authentication
  const otp = '123456';

  otpStorage.set(email, {
    otp,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  console.log(`[MOCK OTP] Email: ${email}`);

  res.json({
    success: true,
    message: 'Demo OTP generated successfully.',
    code: otp
  });
});

// Verify mock OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body || {};

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Email and OTP are required.'
    });
  }

  const savedOtp = otpStorage.get(email);

  if (
    !savedOtp ||
    savedOtp.expiresAt < Date.now() ||
    savedOtp.otp !== String(otp)
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP.'
    });
  }

  otpStorage.delete(email);

  res.json({
    success: true,
    message: 'Verified successfully!',
    token: 'dummy-jwt-token-aevum'
  });
});

// AEGIS image protection demo endpoint
app.post('/api/ml/aegis-protect', (req, res) => {
  try {
    const { file_base64 } = req.body || {};

    if (!file_base64) {
      return res.status(400).json({
        success: false,
        error: 'Image file data is required.'
      });
    }

    const photo_dna_id =
      'DNA_' +
      Math.random().toString(36).substring(2, 10).toUpperCase() +
      Date.now().toString(36);

    res.json({
      success: true,
      photo_dna_id,
      message: 'AEGIS demo protection request completed.'
    });
  } catch (error) {
    console.error('AEGIS error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to process AEGIS protection.'
    });
  }
});

// ORIGIN image analysis demo endpoint
app.post('/api/ml/origin-analyze', (req, res) => {
  try {
    const { image_base64 } = req.body || {};

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required for analysis.'
      });
    }

    // Simulated values, not real AI image analysis
    const confidence_score = Number(
      (85 + Math.random() * 14.5).toFixed(2)
    );

    const mean_pixel_variance = Number(
      (5 + Math.random() * 20).toFixed(2)
    );

    const flagged_tampering = confidence_score < 90;

    res.json({
      success: true,
      confidence_score,
      mean_pixel_variance,
      flagged_tampering,
      heatmap_base64: image_base64
    });
  } catch (error) {
    console.error('ORIGIN analysis error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to process ORIGIN analysis.'
    });
  }
});

// Save AEGIS photo to Supabase
app.post('/api/save/aegis', async (req, res) => {
  try {
    const {
      user_email,
      file_base64,
      photo_dna_id,
      file_name
    } = req.body || {};

    if (!user_email || !file_base64) {
      return res.status(400).json({
        success: false,
        error: 'User email and file data are required.'
      });
    }

    const base64Data = file_base64.includes(',')
      ? file_base64.split(',')[1]
      : file_base64;

    const buffer = Buffer.from(base64Data, 'base64');

    const safeFileName = (file_name || 'protected.jpg')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

    const filePath =
      `${encodeURIComponent(user_email)}/${Date.now()}_${safeFileName}`;

    const { error: storageError } = await supabase.storage
      .from('aevum-photos')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (storageError) throw storageError;

    const { error: dbError } = await supabase
      .from('aevum_photos')
      .insert([{
        user_email,
        file_path: filePath,
        photo_dna_id
      }]);

    if (dbError) throw dbError;

    res.json({
      success: true,
      message: 'AEGIS photo saved successfully!',
      filePath
    });
  } catch (error) {
    console.error('Error saving AEGIS photo:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to save AEGIS photo. Check Supabase configuration.'
    });
  }
});

// Save ORIGIN analysis report
app.post('/api/save/origin', async (req, res) => {
  try {
    const {
      user_email,
      confidence_score,
      mean_pixel_variance,
      flagged_tampering,
      heatmap_base64
    } = req.body || {};

    if (!user_email) {
      return res.status(400).json({
        success: false,
        error: 'User email is required.'
      });
    }

    let heatmapPath = null;

    if (heatmap_base64) {
      const base64Data = heatmap_base64.includes(',')
        ? heatmap_base64.split(',')[1]
        : heatmap_base64;

      const buffer = Buffer.from(base64Data, 'base64');

      heatmapPath =
        `${encodeURIComponent(user_email)}/${Date.now()}_heatmap.jpg`;

      const { error: storageError } = await supabase.storage
        .from('aevum-reports')
        .upload(heatmapPath, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

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

    res.json({
      success: true,
      message: 'ORIGIN report saved successfully!'
    });
  } catch (error) {
    console.error('Error saving ORIGIN report:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to save ORIGIN report. Check Supabase configuration.'
    });
  }
});

// Helper: attach signed URLs to stored files
async function attachSignedUrls(items, bucketName, pathKey) {
  if (!items || items.length === 0) return items || [];

  return Promise.all(
    items.map(async (item) => {
      if (!item[pathKey]) return item;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(item[pathKey], 3600);

      if (error) {
        console.error('Signed URL error:', error.message);
      }

      return {
        ...item,
        signed_url: data ? data.signedUrl : null
      };
    })
  );
}

// Fetch AEGIS photo history
app.get(
  ['/api/history/aegis/:email', '/api/history/aegis'],
  async (req, res) => {
    try {
      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const { data, error } = await supabase
        .from('aevum_photos')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const photos = await attachSignedUrls(
        data,
        'aevum-photos',
        'file_path'
      );

      res.json({
        success: true,
        count: photos.length,
        photos,
        data: photos
      });
    } catch (error) {
      console.error('AEGIS history error:', error.message);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch AEGIS history.'
      });
    }
  }
);

// Fetch ORIGIN report history
app.get(
  ['/api/history/origin/:email', '/api/history/origin'],
  async (req, res) => {
    try {
      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const { data, error } = await supabase
        .from('aevum_reports')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reports = await attachSignedUrls(
        data,
        'aevum-reports',
        'heatmap_file_path'
      );

      res.json({
        success: true,
        count: reports.length,
        reports,
        data: reports
      });
    } catch (error) {
      console.error('ORIGIN history error:', error.message);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch ORIGIN history.'
      });
    }
  }
);

// Fetch combined history
app.get(
  ['/api/history/:email', '/api/history'],
  async (req, res) => {
    try {
      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const [photosRes, reportsRes] = await Promise.all([
        supabase
          .from('aevum_photos')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false }),

        supabase
          .from('aevum_reports')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false })
      ]);

      if (photosRes.error) throw photosRes.error;
      if (reportsRes.error) throw reportsRes.error;

      const photos = await attachSignedUrls(
        photosRes.data,
        'aevum-photos',
        'file_path'
      );

      const reports = await attachSignedUrls(
        reportsRes.data,
        'aevum-reports',
        'heatmap_file_path'
      );

      res.json({
        success: true,
        email,
        photos,
        reports
      });
    } catch (error) {
      console.error('Combined history error:', error.message);

      res.status(500).json({
        success: false,
        error: 'Failed to fetch combined history.'
      });
    }
  }
);

// Export app for Vercel
module.exports = app;

// Start local server during local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Aevum backend running on port ${PORT}`);
  });
}