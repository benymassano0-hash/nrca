const express = require('express');
const router = express.Router();
const breedsController = require('../controllers/breedsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Rotas públicas
router.get('/', breedsController.getAllBreeds);
router.get('/:id', breedsController.getBreedById);

// Rotas privadas (require autenticação)
router.post('/', authenticateToken, authorize('admin'), breedsController.createBreed);
router.post('/import-world', authenticateToken, authorize('admin'), breedsController.importGlobalBreeds);
router.put('/:id', authenticateToken, authorize('admin'), breedsController.updateBreed);
router.delete('/:id', authenticateToken, authorize('admin'), breedsController.deleteBreed);

module.exports = router;
