import express from 'express';
import secretRoutes from './secretRoutes';
import healthRoutes from './healthRoutes';
import swaggerUi from 'swagger-ui-express';
import specs from 'src/openapi';

const router = express.Router();

router.use('/api/secrets', secretRoutes);
router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
router.get('/swagger.json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});
router.use('/health', healthRoutes)

export default router;
