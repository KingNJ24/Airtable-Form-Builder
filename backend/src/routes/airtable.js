import { Router } from 'express';
import { listBases, listTables, listFields } from '../controllers/airtableController.js';

const router = Router();

router.get('/bases', listBases);
router.get('/tables', listTables);
router.get('/fields', listFields);

export default router;
