import express from 'express';
import { isLoggedIn } from '../middleware/authenticationMiddleware.js';
import { registerUser, registerView, loginView, loginUser, logoutUser, deleteUser, logoutView } from '../controllers/auth.js';

const router = express.Router();

router.get('/register', registerView);

router.post('/register', registerUser);

router.get('/login', loginView);

router.post('/login', loginUser);

router.use(isLoggedIn);

router.get('/logout', logoutView);

router.post('/logout', logoutUser);

router.delete('/delete', deleteUser);

export default router;