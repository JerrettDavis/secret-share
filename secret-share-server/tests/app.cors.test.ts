import request from 'supertest';
import app from 'src/app';

// Mock middleware and modules that aren't relevant to CORS behavior
jest.mock('@middleware/logger', () => ({
    logger: jest.fn((_, __, next) => next())
}));
jest.mock('@middleware/errorMiddleware', () => jest.fn((err, _, __, next) => next(err)));
jest.mock('serve-favicon', () => jest.fn(() => (_: any, __: any, next: any) => next()));

describe('CORS configuration', () => {
    it('should allow the x-secret-password header in a preflight response', async () => {
        const res = await request(app.app)
            .options('/api/secrets/x')
            .set('Origin', 'http://localhost:3000')
            .set('Access-Control-Request-Method', 'GET')
            .set('Access-Control-Request-Headers', 'x-secret-password');

        expect(res.header['access-control-allow-headers']).toBeDefined();
        expect(res.header['access-control-allow-headers'].toLowerCase()).toContain('x-secret-password');
    });
});
