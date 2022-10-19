import { Router } from 'express';
import ContratoController from './contrato-controller';

const router = Router();

// Contratos
router.get('/', ContratoController.list);
router.get('/:id', ContratoController.obtain);
router.delete('/:id', ContratoController.destroy);
router.post('/', ContratoController.store);
router.post('/condicoes', ContratoController.canStore);
router.post('/condicoes/sufixo', ContratoController.checkSufixo);

export default router;
