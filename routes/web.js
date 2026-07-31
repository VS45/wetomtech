const express = require('express');
const pageController = require('../controllers/pageController');
const leadController = require('../controllers/leadController');

const router = express.Router();

router.get('/', pageController.home);
router.get('/about', pageController.about);
router.get('/services', pageController.services);
router.get('/projects', pageController.projects);
router.get('/quality-safety', pageController.qualitySafety);
router.get('/coverage', pageController.coverage);
router.get('/contact', pageController.contact);
router.get('/wetomnet', pageController.wetomnet);
router.get('/careers', pageController.careers);
router.get('/privacy', pageController.privacy);
router.get('/company-profile', pageController.downloadProfile);
router.get('/sitemap.xml', pageController.sitemap);
router.get('/robots.txt', pageController.robots);

router.post('/contact', leadController.commonValidators, leadController.submitLead);
router.post('/coverage', leadController.commonValidators, leadController.submitLead);
router.post('/quote', leadController.commonValidators, leadController.submitLead);
router.post('/careers', leadController.commonValidators, leadController.submitLead);

module.exports = router;
