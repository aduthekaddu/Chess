import express, {Router} from 'express';
import { createGame } from '../controller/game';
import { authMiddleware } from '../middleware/auth';

const router:Router = express.Router();


router.post('/game/create', authMiddleware, createGame);

export default router;