const contentRepository = require('../repositories/contentRepository');

async function getPagedByType({ type, page = 1, limit = 9, category }) {
  const filter = { type, visible: true };
  if (category && category !== 'all') filter.category = category;
  const total = await contentRepository.countDocuments(filter);
  const items = await contentRepository.find(filter, '-readme -certificateImage')
    .sort({ order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));
  return { items, total };
}

async function getFeaturedByType(type, max = 3) {
  const items = await contentRepository.find({ type, visible: true }, '-readme -certificateImage')
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .limit(max);
  const total = await contentRepository.countDocuments({ type, visible: true });
  return { items, total };
}

async function getByTypeAndSlug(type, slug) {
  return contentRepository.findOneAndUpdate(
    { type, slug },
    { $inc: { viewCount: 1 } },
    { new: true }
  ).select('-certificateImage');
}

module.exports = {
  getPagedByType,
  getFeaturedByType,
  getByTypeAndSlug,
};
