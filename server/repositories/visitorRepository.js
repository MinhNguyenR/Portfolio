const Visitor = require('../models/Visitor');

module.exports = {
  countDocuments(filter = {}) {
    return Visitor.countDocuments(filter);
  },
  find(filter = {}) {
    return Visitor.find(filter);
  },
  findById(id) {
    return Visitor.findById(id);
  },
  findOneAndUpdate(filter, update, options = {}) {
    return Visitor.findOneAndUpdate(filter, update, options);
  },
  aggregate(pipeline) {
    return Visitor.aggregate(pipeline);
  },
};
