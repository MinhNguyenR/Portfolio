const Profile = require('../models/Profile');

module.exports = {
  findOne(filter = {}) {
    return Profile.findOne(filter);
  },
  findOneLean(filter = {}) {
    return Profile.findOne(filter).lean();
  },
  create(payload) {
    return Profile.create(payload);
  },
  deleteMany(filter = {}) {
    return Profile.deleteMany(filter);
  },
};
