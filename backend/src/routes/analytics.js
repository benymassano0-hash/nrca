const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Público: regista visitas de páginas
router.post('/track', analyticsController.trackVisit);

// Admin: resumo de visitas para cartão no painel
router.get('/summary', authenticateToken, authorize('admin'), analyticsController.getVisitsSummary);

module.exports = router;
