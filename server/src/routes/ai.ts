import { Router } from 'express';
import { chat, search } from '../controllers/ai.controller.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = Router();

router.use(authenticateUser);

router.post('/chat', chat);
router.get('/search', search);

export default router;
