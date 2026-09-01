const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db, storage, admin } = require('../firebase');
const twilio = require('twilio');

const upload = multer({ storage: multer.memoryStorage() });

const VALID_TAGS = ['flood', 'injury', 'trapped', 'food_water', 'medical', 'road_blocked', 'other'];

// Helper function to upload file buffer to Firebase Storage
async function uploadToFirebase(file) {
  const filename = `${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const fileRef = storage.file(`media/${filename}`);
  
  await fileRef.save(file.buffer, {
    metadata: {
      contentType: file.mimetype
    }
  });
  
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${storage.name}/media/${filename}`;
  return publicUrl;
}

// POST /api/reports
router.post('/reports', upload.array('media'), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || [];
    
    let location = null;
    if (data.location) {
        try { location = JSON.parse(data.location); } catch (e) { /* ignore */ }
    }
    
    const tag = VALID_TAGS.includes(data.tag) ? data.tag : 'other';
    const isEmergency = data.isEmergency === 'true' || data.isEmergency === true;
    const text = data.text || null;
    const locationText = data.locationText || null;
    let mediaUrls = data.mediaUrls ? (Array.isArray(data.mediaUrls) ? data.mediaUrls : [data.mediaUrls]) : [];
    
    if (!text && !location && !locationText && files.length === 0 && mediaUrls.length === 0) {
      return res.status(400).json({ error: "Report must contain at least text, location, or media." });
    }

    // Upload attached media
    for (const file of files) {
        try {
            const url = await uploadToFirebase(file);
            mediaUrls.push(url);
        } catch (uploadError) {
            console.error("Failed to upload media, proceeding without it", uploadError);
        }
    }

    const reportId = uuidv4();
    const source = data.source === 'offline_sync' ? 'offline_sync' : 'app';
    
    const report = {
      reportId,
      source,
      reporterId: data.reporterId || null,
      reporterPhone: null,
      text,
      mediaUrls,
      location,
      locationText,
      tag,
      isEmergency,
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedAt: source === 'offline_sync' ? admin.firestore.FieldValue.serverTimestamp() : null
    };

    await db.collection('reports').doc(reportId).set(report);
    
    res.status(201).json({ success: true, reportId });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/sms-webhook
router.post('/sms-webhook', async (req, res) => {
  try {
    const { Body, From } = req.body;
    
    if (!Body || !From) {
      return res.status(400).send("Missing body or from number");
    }

    const msg = Body.trim();
    let tag = 'other';
    let text = msg;
    
    const parts = msg.split(/\s+/);
    if (parts[0].toUpperCase() === 'HELP' && parts.length > 1) {
      const parsedTag = parts[1].toLowerCase();
      if (VALID_TAGS.includes(parsedTag)) {
        tag = parsedTag;
        text = parts.slice(2).join(' ').trim() || msg;
      } else if (parsedTag === 'food' || parsedTag === 'water') {
        tag = 'food_water';
        text = parts.slice(2).join(' ').trim() || msg;
      }
    }

    const reportId = uuidv4();
    
    const report = {
      reportId,
      source: "sms",
      reporterId: null,
      reporterPhone: From,
      text,
      mediaUrls: [],
      location: null,
      locationText: text, 
      tag,
      isEmergency: true, // SMS via this webhook implies urgent help needed
      status: "new",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      syncedAt: null
    };

    await db.collection('reports').doc(reportId).set(report);

    const MessagingResponse = twilio.twiml.MessagingResponse;
    const twiml = new MessagingResponse();
    twiml.message("Your report has been received. Help is being coordinated.");

    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error("Error handling SMS webhook:", error);
    // Reply even on error so Twilio doesn't retry endlessly and user gets feedback, or just status 500
    // We choose to send a silent 500 so Twilio handles it natively
    res.status(500).send("Server Error");
  }
});

module.exports = router;
