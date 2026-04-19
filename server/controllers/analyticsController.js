const Visitor = require('../models/Visitor');
const PageView = require('../models/PageView');
const Interaction = require('../models/Interaction');
const mongoose = require('mongoose');

// Record or update a visitor
exports.recordVisit = async (req, res) => {
  try {
    const { fingerprint, screenResolution } = req.body;
    const info = req.visitorInfo;

    let visitor = await Visitor.findOne({ fingerprint });
    if (visitor) {
      visitor.lastVisit = new Date();
      visitor.visitCount += 1;
      await visitor.save();
    } else {
      visitor = await Visitor.create({
        fingerprint,
        ip: info.ip,
        userAgent: info.userAgent,
        browser: info.browser,
        os: info.os,
        device: info.device,
        referrer: info.referrer,
        language: info.language,
        screenResolution,
      });
    }

    res.status(200).json({ success: true, visitorId: visitor._id });
  } catch (error) {
    console.error('Analytics visit error:', error.message);
    res.status(200).json({ success: false });
  }
};

// Record page view
exports.recordPageView = async (req, res) => {
  try {
    const { fingerprint, section, duration, scrollDepth } = req.body;
    await PageView.create({ fingerprint, section, duration, scrollDepth });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('PageView error:', error.message);
    res.status(200).json({ success: false });
  }
};

// Record interaction
exports.recordInteraction = async (req, res) => {
  try {
    const { fingerprint, type, target, metadata } = req.body;
    await Interaction.create({ fingerprint, type, target, metadata });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Interaction error:', error.message);
    res.status(200).json({ success: false });
  }
};

// Batch record interactions
exports.batchRecord = async (req, res) => {
  try {
    const { fingerprint, pageViews = [], interactions = [] } = req.body;

    if (pageViews.length > 0) {
      await PageView.insertMany(pageViews.map(pv => ({ ...pv, fingerprint })));
    }
    if (interactions.length > 0) {
      await Interaction.insertMany(interactions.map(i => ({ ...i, fingerprint })));
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Batch error:', error.message);
    res.status(200).json({ success: false });
  }
};

// Get stats (simple dashboard)
exports.getStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ error: 'Database not connected' });
    }
    const totalVisitors = await Visitor.countDocuments();
    const totalPageViews = await PageView.countDocuments();
    const totalInteractions = await Interaction.countDocuments();
    const recentVisitors = await Visitor.find().sort({ lastVisit: -1 }).limit(10);

    res.status(200).json({
      totalVisitors,
      totalPageViews,
      totalInteractions,
      recentVisitors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
