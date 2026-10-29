const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ==========================================
// 1. MIDDLEWARE
// ==========================================

app.use(express.json({ limit: '50mb' }));

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

// ==========================================
// 2. SUPABASE CONFIGURATION
// ==========================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase configuration loaded.');
} else {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variable.'
  );
}

function getSupabase(res) {
  if (!supabase) {
    res.status(503).json({
      success: false,
      error: 'Supabase is not configured. Check backend environment variables.'
    });
    return null;
  }

  return supabase;
}

// ==========================================
// 3. TEMPORARY DEMO OTP STORAGE
// ==========================================

const otpStorage = new Map();

// ==========================================
// 4. HEALTH CHECK
// ==========================================

// ==========================================
// 4. HEALTH CHECK & ROOT ROUTE
// ==========================================

app.get('/', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Aevum Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'Aevum Backend API'
  });
});

// ==========================================
// 5. DEMO LOGIN / SIGNUP
// ==========================================

app.post('/api/auth/login-signup', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required.'
    });
  }

  // DEMO ONLY: Replace with a real authentication provider.
  const otp = '123456';

  otpStorage.set(email, {
    otp: otp,
    expiresAt: Date.now() + 15 * 60 * 1000
  });

  console.log('Demo OTP generated for:', email);

  return res.status(200).json({
    success: true,
    message: 'Demo OTP generated successfully.',
    code: otp
  });
});

// ==========================================
// 6. VERIFY DEMO OTP
// ==========================================

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

  return res.status(200).json({
    success: true,
    message: 'Verified successfully!',
    token: 'dummy-jwt-token-aevum'
  });
});

// ==========================================
// 7. AEGIS IMAGE PROTECTION DEMO
// ==========================================

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

    return res.status(200).json({
      success: true,
      photo_dna_id: photo_dna_id,
      message: 'AEGIS demo protection request completed.'
    });
  } catch (error) {
    console.error('AEGIS error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to process AEGIS protection.'
    });
  }
});

// ==========================================
// 8. ORIGIN IMAGE ANALYSIS DEMO
// ==========================================

app.post('/api/ml/origin-analyze', (req, res) => {
  try {
    const { image_base64 } = req.body || {};

    if (!image_base64) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required for analysis.'
      });
    }

    // Simulated values, NOT real AI analysis.
    const confidence_score = Number(
      (85 + Math.random() * 14.5).toFixed(2)
    );

    const mean_pixel_variance = Number(
      (5 + Math.random() * 20).toFixed(2)
    );

    const flagged_tampering = confidence_score < 90;

    return res.status(200).json({
      success: true,
      confidence_score: confidence_score,
      mean_pixel_variance: mean_pixel_variance,
      flagged_tampering: flagged_tampering,
      heatmap_base64: image_base64
    });
  } catch (error) {
    console.error('ORIGIN analysis error:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to process ORIGIN analysis.'
    });
  }
});

// ==========================================
// 9. SAVE AEGIS PHOTO
// ==========================================

app.post('/api/save/aegis', async (req, res) => {
  try {
    const db = getSupabase(res);
    if (!db) return;

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
      encodeURIComponent(user_email) +
      '/' + Date.now() + '_' + safeFileName;

    const { error: storageError } = await db.storage
      .from('aevum-photos')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (storageError) throw storageError;

    const { error: dbError } = await db
      .from('aevum_photos')
      .insert([{
        user_email: user_email,
        file_path: filePath,
        photo_dna_id: photo_dna_id
      }]);

    if (dbError) throw dbError;

    return res.status(200).json({
      success: true,
      message: 'AEGIS photo saved successfully!',
      filePath: filePath
    });
  } catch (error) {
    console.error('Error saving AEGIS photo:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to save AEGIS photo. Check Supabase configuration.'
    });
  }
});

// ==========================================
// 10. SAVE ORIGIN REPORT
// ==========================================

app.post('/api/save/origin', async (req, res) => {
  try {
    const db = getSupabase(res);
    if (!db) return;

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
        encodeURIComponent(user_email) +
        '/' + Date.now() + '_heatmap.jpg';

      const { error: storageError } = await db.storage
        .from('aevum-reports')
        .upload(heatmapPath, buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (storageError) throw storageError;
    }

    const { error: dbError } = await db
      .from('aevum_reports')
      .insert([{
        user_email: user_email,
        report_type: 'origin-analysis',
        confidence_score: confidence_score,
        mean_pixel_variance: mean_pixel_variance,
        flagged_tampering: flagged_tampering,
        heatmap_file_path: heatmapPath
      }]);

    if (dbError) throw dbError;

    return res.status(200).json({
      success: true,
      message: 'ORIGIN report saved successfully!'
    });
  } catch (error) {
    console.error('Error saving ORIGIN report:', error.message);

    return res.status(500).json({
      success: false,
      error: 'Failed to save ORIGIN report. Check Supabase configuration.'
    });
  }
});

// ==========================================
// 11. HELPER: GENERATE SIGNED STORAGE URLS
// ==========================================

async function attachSignedUrls(items, bucketName, pathKey) {
  if (!items || items.length === 0) {
    return items || [];
  }

  const db = supabase;

  if (!db) {
    throw new Error('Supabase is not configured.');
  }

  return Promise.all(
    items.map(async (item) => {
      if (!item[pathKey]) {
        return item;
      }

      const { data, error } = await db.storage
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

// ==========================================
// 12. FETCH AEGIS PHOTO HISTORY
// ==========================================

app.get(
  ['/api/history/aegis/:email', '/api/history/aegis'],
  async (req, res) => {
    try {
      const db = getSupabase(res);
      if (!db) return;

      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const { data, error } = await db
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

      return res.status(200).json({
        success: true,
        count: photos.length,
        photos: photos,
        data: photos
      });
    } catch (error) {
      console.error('AEGIS history error:', error.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch AEGIS history.'
      });
    }
  }
);

// ==========================================
// 13. FETCH ORIGIN REPORT HISTORY
// ==========================================

app.get(
  ['/api/history/origin/:email', '/api/history/origin'],
  async (req, res) => {
    try {
      const db = getSupabase(res);
      if (!db) return;

      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const { data, error } = await db
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

      return res.status(200).json({
        success: true,
        count: reports.length,
        reports: reports,
        data: reports
      });
    } catch (error) {
      console.error('ORIGIN history error:', error.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch ORIGIN history.'
      });
    }
  }
);

// ==========================================
// 14. FETCH COMBINED HISTORY
// ==========================================

app.get(
  ['/api/history/:email', '/api/history'],
  async (req, res) => {
    try {
      const db = getSupabase(res);
      if (!db) return;

      const email = req.params.email || req.query.email;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'User email is required.'
        });
      }

      const [photosRes, reportsRes] = await Promise.all([
        db
          .from('aevum_photos')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false }),

        db
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

      return res.status(200).json({
        success: true,
        email: email,
        photos: photos,
        reports: reports
      });
    } catch (error) {
      console.error('Combined history error:', error.message);

      return res.status(500).json({
        success: false,
        error: 'Failed to fetch combined history.'
      });
    }
  }
);

// ==========================================
// 15. EXPORT APP FOR VERCEL
// ==========================================

module.exports = app;

// Start local server only during local development.
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log('Aevum backend running on port ' + PORT);
  });
}