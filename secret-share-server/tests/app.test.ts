import request from 'supertest';
import http from 'http';
import app from 'src/app';
import {Application, NextFunction, Request, Response} from "express";
import {appState, ServiceState} from "src/appState";

// Mock middleware and modules
jest.mock('@middleware/logger', () => ({
    logger: jest.fn((_, __, next) => next())
}));
jest.mock('@middleware/errorMiddleware', () => jest.fn((err, _, __, next) => next(err)));
jest.mock('serve-favicon', () => jest.fn(() => (_: Request, __: Response, next: NextFunction) => next()));

describe('App tests', () => {
    let server: http.Server;

    afterAll(async () => {
        if (server) {
            await app.stopServer(server);
        }
    });

    test('should configure middleware correctly', async () => {
        // Testing that middleware is configured by making a request and checking response headers
        const res = await request(app.app).get('/');
        expect(res.status).toBe(404); // Assuming the root route isn't defined
        expect(res.header['content-type']).toContain('application/json');
    });

    test('should start the server correctly', async () => {
        server = await app.startServer(app.app);
        expect(server).toBeInstanceOf(http.Server);
        expect(appState.ExpressServer).toBe(ServiceState.RUNNING);
    });

    test('should stop the server correctly', async () => {
        await app.stopServer(server);
        expect(appState.ExpressServer).toBe(ServiceState.STOPPED);
    });

    test('should transition app state correctly on start failure', async () => {
        const faultyApp = {
            ...app.app, listen: () => {
                throw new Error('Startup error');
            }
        };
        try {
            await app.startServer(faultyApp as unknown as Application);
        } catch (e) {
            expect(appState.ExpressServer).toBe(ServiceState.ERROR);
        }
    });

    test('should transition app state correctly on stop', async () => {
        server = await app.startServer(app.app);
        await app.stopServer(server);
        expect(appState.ExpressServer).toBe(ServiceState.STOPPED);
    });
});
