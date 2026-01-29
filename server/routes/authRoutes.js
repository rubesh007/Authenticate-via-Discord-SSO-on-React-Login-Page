import express from 'express';
import { discordAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/discord', discordAuth);

export default router;
