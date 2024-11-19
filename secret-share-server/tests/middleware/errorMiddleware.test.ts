import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import errorMiddleware from '@middleware/errorMiddleware';

const app = express();

app.get('/error', (_: Request, __: Response, next: NextFunction) => {
    next(new Error('Test error'));
});

app.use(errorMiddleware);

describe('Error Handling Middleware', () => {
    it('should handle errors and return a 500 status code with an error message', async () => {
        const res = await request(app).get('/error');
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ success: false, error: 'Test error' });
    });
});
