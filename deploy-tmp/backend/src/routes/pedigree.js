const express = require('express');
const router = express.Router();
const pedigreeController = require('../controllers/pedigreeController');
const { authenticateToken, authorize } = require('../middleware/auth');

// ===== ROTAS PÚBLICAS (sem autenticação) =====

// Busca pública de pedigrees por nome do cão, ID do cão, ou criador
router.get('/public/search', pedigreeController.searchPublicPedigree);

// Obter detalhe completo do pedigree de um cão (público)
router.get('/public/detail/:dog_id', pedigreeController.getPublicPedigreeDetail);

// ===== ROTAS PRIVADAS (com autenticação) =====

// Obter pedigree por ID do cão
router.get('/dog/:dog_id', authenticateToken, pedigreeController.getPedigreeById);

// Obter pedigree por ID de Registro
router.get('/registration/:registration_id', authenticateToken, pedigreeController.getPedigreeByRegistrationId);

// Obter descendentes (filhos)
router.get('/:dog_id/offspring', authenticateToken, pedigreeController.getOffspring);

// Verificar consanguinidade
router.post('/check-consanguinity', authenticateToken, pedigreeController.checkConsanguinity);

// Registar pedigree (admin)
router.post('/register', authenticateToken, authorize('admin'), pedigreeController.registerPedigree);

module.exports = router;
