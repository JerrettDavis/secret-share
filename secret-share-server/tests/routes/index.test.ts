import request from 'supertest';
import express, { Request, Response } from 'express';
import router from '@routes/index';
import swaggerUi from 'swagger-ui-express';
import specs from 'src/openapi';

// Mock the routes
jest.mock('@routes/secretRoutes', () => {
    const router = express.Router();
    router.get('/', (_, res) => res.sendStatus(200));
    return router;
});

jest.mock('@routes/healthRoutes', () => {
    const router = express.Router();
    router.get('/', (_, res) => res.sendStatus(200));
    return router;
});

// Mock swagger-ui-express
jest.mock('swagger-ui-express', () => ({
    serve: jest.fn((_, __, next) => next()),
    setup: jest.fn(() => (_: Request, res: Response) => res.sendStatus(200))
}));

const app = express();
app.use(router);

describe('Index Routes', () => {
    it('should use /api/secrets for secretRoutes', async () => {
        const res = await request(app).get('/api/secrets');
        expect(res.status).toBe(200);
    });

    it('should use /health for healthRoutes', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
    });

    it('should serve swagger documentation at /api-docs', async () => {
        const res = await request(app).get('/api-docs');
        expect(res.status).toBe(200);
        expect(swaggerUi.serve).toHaveBeenCalled();
        expect(swaggerUi.setup).toHaveBeenCalledWith(specs);
    });

    it('should serve swagger.json at /swagger.json', async () => {
        const res = await request(app).get('/swagger.json');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expect(res.body).toEqual(specs);
    });
});

afterAll(() => {
    jest.resetAllMocks();
});
