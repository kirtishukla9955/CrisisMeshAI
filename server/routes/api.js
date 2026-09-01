const express = require('express');
const router = express.Router();
const { db, admin } = require('../firebase');
const { matchVolunteers } = require('../services/matchingService');

// 1. GET /api/incidents
router.get('/incidents', async (req, res) => {
  try {
    const { needsHumanReview } = req.query;
    
    let query = db.collection('incidents');
    if (needsHumanReview === 'true') {
      query = query.where('needsHumanReview', '==', true);
    }
    
    // Note: Firestore requires a composite index if we mix where() and orderBy().
    // If not created, it will fail. We can fetch and sort in memory for the MVP if we want to avoid index issues, 
    // but typically we'd create the index. We'll do it in memory if there's a where clause just to be safe for a hackathon MVP.
    const snapshot = await query.get();
    let incidents = [];
    snapshot.forEach(doc => incidents.push(doc.data()));
    
    // Sort descending by priorityScore
    incidents.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    
    res.json(incidents);
  } catch (err) {
    console.error("Error getting incidents", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. GET /api/incidents/:id
router.get('/incidents/:id', async (req, res) => {
  try {
    const doc = await db.collection('incidents').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    res.json(doc.data());
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 3. POST /api/volunteers
router.post('/volunteers', async (req, res) => {
  try {
    const { name, phone, skills, location } = req.body;
    if (!name || !phone || !skills || !Array.isArray(skills)) {
      return res.status(400).json({ error: "Invalid volunteer data" });
    }

    const volunteerId = db.collection('volunteers').doc().id;
    
    const volunteerData = {
      volunteerId,
      name,
      phone,
      skills,
      location: location || null,
      isVerified: false, // Default false, must be verified by admin
      isAvailable: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('volunteers').doc(volunteerId).set(volunteerData);
    res.status(201).json(volunteerData);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 4. GET /api/incidents/:id/match-volunteers
router.get('/incidents/:id/match-volunteers', async (req, res) => {
  try {
    const incidentDoc = await db.collection('incidents').doc(req.params.id).get();
    if (!incidentDoc.exists) return res.status(404).json({ error: "Not found" });
    
    const inc = incidentDoc.data();
    const topMatches = await matchVolunteers(inc.incidentId, inc.neededSkills, inc.centerLocation);
    
    res.json({ suggestedVolunteers: topMatches });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 5. PATCH /api/incidents/:id/status
router.patch('/incidents/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'acknowledged', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    await db.collection('incidents').doc(req.params.id).update({ 
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
