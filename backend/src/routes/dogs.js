const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const dogsController = require('../controllers/dogsController');
const { authenticateToken, authorize } = require('../middleware/auth');

const dogUploadsDir = path.join(__dirname, '..', '..', 'uploads', 'dogs');
if (!fs.existsSync(dogUploadsDir)) {
	fs.mkdirSync(dogUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, dogUploadsDir),
	filename: (req, file, cb) => {
		const extension = path.extname(file.originalname || '').toLowerCase() || '.jpg';
		const safeName = String(req.body?.name || 'cao').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		cb(null, `${Date.now()}-${safeName || 'cao'}${extension}`);
	},
});

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, cb) => {
		if ((file.mimetype || '').startsWith('image/')) {
			return cb(null, true);
		}
		return cb(new Error('Apenas imagens são permitidas'));
	},
});

// Rotas públicas (leitura)
router.get('/', dogsController.getAllDogs);
router.get('/sale/public', dogsController.getPublicDogsForSale);
router.get('/sale/my/listings', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), dogsController.getMySaleDogs);
router.get('/next-registration-id', authenticateToken, authorize('admin', 'registration_agent'), dogsController.getNextRegistrationId);
router.get('/registration/:registration_id', dogsController.getDogByRegistrationId);
router.get('/:id', dogsController.getDogById);

// Rotas privadas (escrita requer autenticação)
router.post('/', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), upload.single('photo'), dogsController.createDog);
router.put('/:id', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), upload.single('photo'), dogsController.updateDog);
router.delete('/:id', authenticateToken, authorize('admin', 'registration_agent'), dogsController.deleteDog);
router.put('/:id/sale', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), dogsController.announceDogForSale);
router.delete('/:id/sale', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), dogsController.removeDogFromSale);

// Transferência de cão
router.post('/transfer/init', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), dogsController.transferDog);
router.get('/transfer/breeders', authenticateToken, authorize('admin', 'registration_agent', 'breeder'), dogsController.getAvailableBreeders);
router.get('/transfer/my-overview', authenticateToken, authorize('breeder'), dogsController.getBreederTransferOverview);

module.exports = router;
