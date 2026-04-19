const Contact = require('../models/Contact');

module.exports = {
  countDocuments(filter = {}) {
    return Contact.countDocuments(filter);
  },
  find(filter = {}) {
    return Contact.find(filter);
  },
  findByIdAndUpdate(id, update, options = {}) {
    return Contact.findByIdAndUpdate(id, update, options);
  },
  create(payload) {
    return Contact.create(payload);
  },
};
