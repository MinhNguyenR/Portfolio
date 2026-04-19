const visitorRepository = require('../repositories/visitorRepository');
const pageViewRepository = require('../repositories/pageViewRepository');
const interactionRepository = require('../repositories/interactionRepository');
const contactRepository = require('../repositories/contactRepository');
const contentRepository = require('../repositories/contentRepository');
const profileRepository = require('../repositories/profileRepository');

async function getDashboardOverview(today, weekAgo, monthAgo) {
  const [
    totalVisitors, todayVisitors, weekVisitors, monthVisitors,
    totalPageViews, todayPageViews, totalInteractions,
    unreadContacts, totalContacts, contentCounts,
    recentVisitors, topPages, browserStats, deviceStats,
    countryStats, dailyVisits, knownVisitors,
  ] = await Promise.all([
    visitorRepository.countDocuments(),
    visitorRepository.countDocuments({ lastVisit: { $gte: today } }),
    visitorRepository.countDocuments({ lastVisit: { $gte: weekAgo } }),
    visitorRepository.countDocuments({ lastVisit: { $gte: monthAgo } }),
    pageViewRepository.countDocuments(),
    pageViewRepository.countDocuments({ timestamp: { $gte: today } }),
    interactionRepository.countDocuments(),
    contactRepository.countDocuments({ read: false }),
    contactRepository.countDocuments(),
    contentRepository.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
    visitorRepository.find()
      .sort({ lastVisit: -1 })
      .limit(50)
      .select('ip fingerprint browser os device screen hardware network timezone firstVisit lastVisit visitCount name email'),
    pageViewRepository.aggregate([
      { $group: { _id: '$section', count: { $sum: 1 }, avgDuration: { $avg: '$duration' } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    visitorRepository.aggregate([
      { $group: { _id: '$browser.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    visitorRepository.aggregate([
      { $group: { _id: '$device.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    visitorRepository.aggregate([
      { $group: { _id: '$network.countryCode', country: { $first: '$network.country' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 15 },
    ]),
    visitorRepository.aggregate([
      { $match: { lastVisit: { $gte: monthAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastVisit' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    visitorRepository.countDocuments({ email: { $exists: true, $ne: null, $ne: '' } }),
  ]);
  return {
    totalVisitors, todayVisitors, weekVisitors, monthVisitors,
    totalPageViews, todayPageViews, totalInteractions,
    unreadContacts, totalContacts, contentCounts, recentVisitors,
    topPages, browserStats, deviceStats, countryStats, dailyVisits, knownVisitors,
  };
}

module.exports = {
  getDashboardOverview,
  repositories: {
    visitorRepository,
    pageViewRepository,
    interactionRepository,
    contactRepository,
    contentRepository,
    profileRepository,
  },
};
