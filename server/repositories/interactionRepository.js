const Interaction = require('../models/Interaction');

module.exports = {
  countDocuments(filter = {}) {
    return Interaction.countDocuments(filter);
  },
  find(filter = {}) {
    return Interaction.find(filter);
  },
};
