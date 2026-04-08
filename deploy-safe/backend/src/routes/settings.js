const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// Obter uma configuração (pública)
router.get('/:key', settingsController.getSetting);

// Obter todas as configurações (apenas admin)
router.get('/', authenticateToken, settingsController.getAllSettings);

// Atualizar uma configuração (apenas admin)
router.put('/:key', authenticateToken, settingsController.updateSetting);

module.exports = router;
