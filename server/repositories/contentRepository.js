const Content = require('../models/Content');

module.exports = {
  countDocuments(filter) {
    return Content.countDocuments(filter);
  },
  find(filter, projection) {
    return Content.find(filter).select(projection || '');
  },
  findOne(filter, projection) {
    return Content.findOne(filter).select(projection || '');
  },
  findOneLean(filter, projection) {
    return Content.findOne(filter).select(projection || '').lean();
  },
  findOneAndUpdate(filter, update, options = {}) {
    return Content.findOneAndUpdate(filter, update, options);
  },
  findById(id) {
    return Content.findById(id);
  },
  findByIdAndUpdate(id, update, options = {}) {
    return Content.findByIdAndUpdate(id, update, options);
  },
  findByIdAndDelete(id) {
    return Content.findByIdAndDelete(id);
  },
  findOneAndDelete(filter) {
    return Content.findOneAndDelete(filter);
  },
  create(payload) {
    return Content.create(payload);
  },
  insertMany(payload) {
    return Content.insertMany(payload);
  },
  deleteMany(filter = {}) {
    return Content.deleteMany(filter);
  },
  updateMany(filter, update) {
    return Content.updateMany(filter, update);
  },
  aggregate(pipeline) {
    return Content.aggregate(pipeline);
  },
};
