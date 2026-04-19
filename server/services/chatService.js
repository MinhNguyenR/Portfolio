const profileRepository = require('../repositories/profileRepository');
const contentRepository = require('../repositories/contentRepository');

async function loadChatContext() {
  const [profile, projects, research, certificates] = await Promise.all([
    profileRepository.findOneLean(),
    contentRepository.find({ type: 'project', visible: true }, '-readme').lean(),
    contentRepository.find({ type: 'research', visible: true }, '-readme').lean(),
    contentRepository.find({ type: 'certificate', visible: true }, '-readme -certificateImage').lean(),
  ]);
  return { profile, projects, research, certificates };
}

async function loadResearchSnippets(limit = 8) {
  return contentRepository.find({ type: 'research', visible: true }, 'title subtitle description readme')
    .sort({ order: 1 })
    .limit(limit)
    .lean();
}

module.exports = {
  loadChatContext,
  loadResearchSnippets,
};
