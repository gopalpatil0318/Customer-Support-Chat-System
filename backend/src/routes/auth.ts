import { Router } from 'express';
import { signUp, signIn, logout, getUserData } from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/logout', logout);
router.get('/user', authenticateToken, getUserData);

export default router;