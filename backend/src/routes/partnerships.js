const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/partnershipsController');
const { authenticateToken, authorize } = require('../middleware/auth');

// Todos os endpoints exigem login; breeders e admins podem usar
const canAccess = authenticateToken;

// Listar criadores verificados (para pesquisa/envio de pedido)
router.get('/breeders', canAccess, ctrl.getBreeders);

// Listar as minhas parcerias (aceites + pendentes)
router.get('/', canAccess, ctrl.getMyPartnerships);

// Enviar pedido de parceria
router.post('/', canAccess, ctrl.requestPartnership);

// Aceitar pedido recebido
router.put('/:id/accept', canAccess, ctrl.acceptPartnership);

// Recusar / cancelar / desfazer
router.delete('/:id', canAccess, ctrl.removePartnership);

module.exports = router;
