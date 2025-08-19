import { Router } from 'express';
import { createForm, getForm, listForms } from '../controllers/formsController.js';

const router = Router();

router.get('/', listForms);
router.post('/create', createForm);
router.get('/:id', getForm);

export default router;
