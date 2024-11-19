import request from 'supertest';
import app from 'src/app';
import { appState, ServiceState } from 'src/appState';

describe('Health Routes', () => {
    beforeEach(() => {
        // Reset the appState to its default values before each test
        appState.MongoConnection = ServiceState.UNKNOWN;
        appState.RabbitMQConnection = ServiceState.UNKNOWN;
        appState.ExpressServer = ServiceState.UNKNOWN;
    });

    it('should return 200 when all services are running', async () => {
        // Set all services to RUNNING
        appState.MongoConnection = ServiceState.RUNNING;
        appState.RabbitMQConnection = ServiceState.RUNNING;
        appState.ExpressServer = ServiceState.RUNNING;

        const response = await request(app.app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            services: {
                MongoConnection: 'RUNNING',
                RabbitMQConnection: 'RUNNING',
                ExpressServer: 'RUNNING',
            },
        });
    });

    it('should return 500 when any service is not running', async () => {
        // Set MongoConnection to ERROR
        appState.MongoConnection = ServiceState.ERROR;
        appState.RabbitMQConnection = ServiceState.RUNNING;
        appState.ExpressServer = ServiceState.RUNNING;

        const response = await request(app.app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            services: {
                MongoConnection: 'ERROR',
                RabbitMQConnection: 'RUNNING',
                ExpressServer: 'RUNNING',
            },
        });
    });

    it('should return 500 when all services are unknown', async () => {
        // Set all services to UNKNOWN
        appState.MongoConnection = ServiceState.UNKNOWN;
        appState.RabbitMQConnection = ServiceState.UNKNOWN;
        appState.ExpressServer = ServiceState.UNKNOWN;

        const response = await request(app.app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            services: {
                MongoConnection: 'UNKNOWN',
                RabbitMQConnection: 'UNKNOWN',
                ExpressServer: 'UNKNOWN',
            },
        });
    });

    it('should return 500 when any services are unknown', async () => {
        // Set all services to UNKNOWN
        appState.MongoConnection = ServiceState.UNKNOWN;
        appState.RabbitMQConnection = ServiceState.RUNNING;
        appState.ExpressServer = ServiceState.RUNNING;

        const response = await request(app.app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            success: false,
            services: {
                MongoConnection: 'UNKNOWN',
                RabbitMQConnection: 'RUNNING',
                ExpressServer: 'RUNNING',
            },
        });
    });
});
