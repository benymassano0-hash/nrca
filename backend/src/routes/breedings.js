const express = require('express');
const router = express.Router();
const breedingsController = require('../controllers/breedingsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Rotas públicas (leitura)
router.get('/', breedingsController.getAllBreedings);
router.get('/:id', breedingsController.getBreedingById);

// Rotas privadas (requer autenticação)
router.post('/', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), breedingsController.createBreeding);
router.put('/:id', authenticateToken, authorize('admin', 'registration_agent'), breedingsController.updateBreeding);
router.put('/:id/confirm', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), breedingsController.confirmBreeding);
router.delete('/:id', authenticateToken, authorize('admin', 'registration_agent'), breedingsController.deleteBreeding);

module.exports = router;
