const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { callOpenRouter, translateToEnDe } = require('../utils/ai');
const Content = require('../models/Content');
const Profile = require('../models/Profile');

async function translateExisting() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Translate Profile
    console.log('Processing Profile...');
    const profile = await Profile.findOne();
    if (profile) {
      console.log('Translating Profile summary...');
      const toTrans = {
        name: profile.name,
        subtitle: profile.subtitle,
        summary: profile.summary,
      };

      if (profile.cv) {
        if (profile.cv.objective) toTrans['cv_objective'] = profile.cv.objective;
        if (profile.cv.highlights) {
          profile.cv.highlights.forEach((h, i) => {
            toTrans[`cv_highlight_${i}`] = h;
          });
        }
      }

      if (profile.skills) {
        Object.keys(profile.skills).forEach((cat, i) => {
          toTrans[`skill_cat_${i}`] = cat;
          profile.skills[cat].forEach((item, j) => {
             toTrans[`skill_item_${i}_${j}`] = item;
          });
        });
      }

      const trans = await translateToEnDe(toTrans);
      if (trans) {
        // Map back translation fields
        ['en', 'de'].forEach(l => {
          if (!trans[l]) return;
          
          // CV
          if (profile.cv) {
            if (!trans[l].cv) trans[l].cv = {};
            if (trans[l]['cv_objective']) {
              trans[l].cv.objective = trans[l]['cv_objective'];
              delete trans[l]['cv_objective'];
            }
            if (profile.cv.highlights) {
              trans[l].cv.highlights = profile.cv.highlights.map((h, i) => trans[l][`cv_highlight_${i}`] || h);
              profile.cv.highlights.forEach((_, i) => delete trans[l][`cv_highlight_${i}`]);
            }
          }

          // Skills
          if (profile.skills) {
            if (!trans[l].skills) trans[l].skills = {};
            Object.keys(profile.skills).forEach((cat, i) => {
              const translatedCat = trans[l][`skill_cat_${i}`] || cat;
              trans[l].skills[translatedCat] = profile.skills[cat].map((item, j) => trans[l][`skill_item_${i}_${j}`] || item);
              
              delete trans[l][`skill_cat_${i}`];
              profile.skills[cat].forEach((_, j) => delete trans[l][`skill_item_${i}_${j}`]);
            });
          }
        });

        profile.translations = trans;
        profile.markModified('translations');
        await profile.save();
        console.log('Profile updated.');
      }

      console.log('Translating Timeline items...');
      if (Array.isArray(profile.timeline)) {
        for (let i = 0; i < profile.timeline.length; i++) {
          const item = profile.timeline[i];
          console.log(`- Item ${i+1}: ${item.title}`);
          const itemToTrans = {
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
          };
          const itemTrans = await translateToEnDe(itemToTrans);
          if (itemTrans) {
            item.translations = itemTrans;
          }
        }
      }
      await profile.save();
      console.log('Profile updated.');
    }

    // 2. Translate Content
    console.log('Processing Content items...');
    const contents = await Content.find();
    console.log(`Found ${contents.length} items.`);

    for (const item of contents) {
      console.log(`Processing [${item.type}] ${item.title}...`);
      
      const toTrans = {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        readme: item.readme,
      };

      // Special handling for school meta
      if (item.type === 'school' && item.meta) {
        if (item.meta.highlights) {
          item.meta.highlights.forEach((h, i) => {
             toTrans[`meta_highlight_title_${i}`] = h.title;
             toTrans[`meta_highlight_desc_${i}`] = h.desc;
          });
        }
        if (item.meta.myJourney) {
          toTrans['meta_journey_grade'] = item.meta.myJourney.grade;
          toTrans['meta_journey_achievement'] = item.meta.myJourney.achievement;
          toTrans['meta_journey_note'] = item.meta.myJourney.note;
        }
        if (item.meta.programs) {
          item.meta.programs.forEach((p, i) => {
            toTrans[`meta_program_${i}`] = p;
          });
        }
      }

      const trans = await translateToEnDe(toTrans);
      if (trans) {
        // Map back the meta translations
        if (item.type === 'school' && item.meta) {
          ['en', 'de'].forEach(l => {
            if (!trans[l]) return;
            // Highlighting
            if (item.meta.highlights) {
              item.meta.highlights.forEach((h, i) => {
                const hKeyT = `meta_highlight_title_${i}`;
                const hKeyD = `meta_highlight_desc_${i}`;
                if (!trans[l].meta) trans[l].meta = {};
                if (!trans[l].meta.highlights) trans[l].meta.highlights = [];
                trans[l].meta.highlights[i] = {
                   title: trans[l][hKeyT] || h.title,
                   desc: trans[l][hKeyD] || h.desc,
                   icon: h.icon
                };
                delete trans[l][hKeyT];
                delete trans[l][hKeyD];
              });
            }
            // Journey
            if (item.meta.myJourney) {
              if (!trans[l].meta) trans[l].meta = {};
              trans[l].meta.myJourney = {
                ...item.meta.myJourney,
                grade: trans[l]['meta_journey_grade'] || item.meta.myJourney.grade,
                achievement: trans[l]['meta_journey_achievement'] || item.meta.myJourney.achievement,
                note: trans[l]['meta_journey_note'] || item.meta.myJourney.note,
              };
              delete trans[l]['meta_journey_grade'];
              delete trans[l]['meta_journey_achievement'];
              delete trans[l]['meta_journey_note'];
            }
            // Programs
            if (item.meta.programs) {
              if (!trans[l].meta) trans[l].meta = {};
              trans[l].meta.programs = item.meta.programs.map((p, i) => trans[l][`meta_program_${i}`] || p);
              item.meta.programs.forEach((_, i) => delete trans[l][`meta_program_${i}`]);
            }
          });
        }
        
        item.translations = trans;
        await item.save();
        console.log(`  Done: ${item.title}`);
      } else {
        console.log(`  Failed: ${item.title}`);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

translateExisting();
