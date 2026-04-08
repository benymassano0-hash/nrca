const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Rotas públicas
router.get('/published', eventsController.getPublishedEvents);
router.get('/details/:id', eventsController.getEventById);

// Rotas privadas (criadores)
router.get('/my-events', authenticateToken, eventsController.getCreatorEvents);
router.post('/create', authenticateToken, authorize('breeder', 'admin'), eventsController.createEvent);
router.put('/:id', authenticateToken, eventsController.updateEvent);
router.put('/:id/publish', authenticateToken, eventsController.publishEvent);
router.put('/:id/cancel', authenticateToken, eventsController.cancelEvent);
router.delete('/:id', authenticateToken, eventsController.deleteEvent);

// Rotas admin
router.get('/pending-approval', authenticateToken, authorize('admin'), eventsController.getPendingEvents);
router.put('/:id/approve', authenticateToken, authorize('admin'), eventsController.approveEvent);

module.exports = router;
