const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Rotas públicas
router.post('/login', usersController.loginUser);

// Rotas privadas
router.get('/profile', authenticateToken, usersController.getUserProfile);
router.put('/profile', authenticateToken, usersController.updateUserProfile);

// Cadastro de criadores (admin)
router.post('/breeders', authenticateToken, authorize('admin', 'registration_agent'), usersController.createBreederByAdmin);

// Cadastro de agentes de registo (admin)
router.post('/agents', authenticateToken, authorize('admin'), usersController.createRegistrationAgentByAdmin);
router.delete('/agents/:id', authenticateToken, authorize('admin'), usersController.deleteRegistrationAgentByAdmin);
router.get('/agents/stats/monthly', authenticateToken, authorize('admin'), usersController.getAgentsMonthlyStats);
router.get('/agents/me/stats/monthly', authenticateToken, authorize('registration_agent'), usersController.getMyMonthlyStats);

// Aprovação de registos (admin)
router.put('/:id/verify', authenticateToken, authorize('admin'), usersController.verifyUser);

// Toggle de ativo/inativo para criadores (admin)
router.put('/:id/toggle-active', authenticateToken, authorize('admin'), usersController.toggleBreederActive);

// Rotas de admin
router.get('/', authenticateToken, authorize('admin'), usersController.getAllUsers);
router.get('/:id', authenticateToken, authorize('admin'), usersController.getUserById);

module.exports = router;
