import { Router } from 'express';
import { submitResponse } from '../controllers/responsesController.js';

const router = Router();

router.post('/:id', submitResponse);

export default router;
