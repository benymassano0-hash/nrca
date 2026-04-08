const express = require('express');
const router = express.Router();
const vaccinesController = require('../controllers/vaccinesController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.get('/dog/:dog_id', authenticateToken, vaccinesController.getVaccinesByDog);
router.post('/', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), vaccinesController.createVaccine);

module.exports = router;
