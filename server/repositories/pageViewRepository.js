const PageView = require('../models/PageView');

module.exports = {
  countDocuments(filter = {}) {
    return PageView.countDocuments(filter);
  },
  find(filter = {}) {
    return PageView.find(filter);
  },
  aggregate(pipeline) {
    return PageView.aggregate(pipeline);
  },
};
