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
router.put('/:id/dog-limit', authenticateToken, authorize('admin'), usersController.updateBreederDogLimit);
router.post('/:id/credit-tickets', authenticateToken, authorize('admin'), usersController.creditBreederTickets);
router.post('/:id/debit-tickets', authenticateToken, authorize('admin'), usersController.debitBreederTickets);
router.post('/:id/credit-balance', authenticateToken, authorize('admin'), usersController.creditBreederTickets);

// Rotas de admin
router.get('/', authenticateToken, authorize('admin'), usersController.getAllUsers);
router.put('/:id', authenticateToken, authorize('admin'), usersController.updateUserByAdmin);
router.delete('/:id', authenticateToken, authorize('admin'), usersController.deleteUserByAdmin);
router.get('/:id', authenticateToken, authorize('admin'), usersController.getUserById);

module.exports = router;
