const Contact = require('../models/Contact');
const Visitor = require('../models/Visitor');

exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, message, fingerprint } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Normal contact submission
    const contact = await Contact.create({ name, email, phone, message });

    // Link visitor if fingerprint provided
    if (fingerprint) {
      await Visitor.findOneAndUpdate(
        { fingerprint },
        { name: name.trim(), email: email.trim().toLowerCase() },
        { upsert: false }
      );
    }

    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact error:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
