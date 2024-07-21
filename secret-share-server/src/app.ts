import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import favicon from 'serve-favicon';
import path from 'path';
import { logger } from './middleware/logger';
import routes from './routes';
import http from 'http';

export enum ServiceState {
    STARTING = 'STARTING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR',
    UNKNOWN = 'UNKNOWN'
}

export interface AppState {
    MongoConnection: ServiceState;
    RabbitMQConnection: ServiceState;
    ExpressServer: ServiceState;
}

export const appState: AppState = {
    MongoConnection: ServiceState.UNKNOWN,
    RabbitMQConnection: ServiceState.UNKNOWN,
    ExpressServer: ServiceState.UNKNOWN
};

const app: Application = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger);
app.use('/', routes);

export const startServer = (app: Application): Promise<http.Server> => {
    const PORT = process.env.PORT || 5000;
    appState.ExpressServer = ServiceState.STARTING;
    console.log('<API> Starting server...');
    try {
        return new Promise((resolve, _) => {
            const server = app.listen(PORT, () => {
                console.log(`<API> Server is running on port ${PORT}`);
                appState.ExpressServer = ServiceState.RUNNING;
                resolve(server);
            });
        });
    } catch (e) {
        console.error('<API> Server startup error:', e);
        appState.ExpressServer = ServiceState.ERROR;
        throw e;
    }
};

export const stopServer = (server: http.Server): Promise<void> => {
    console.log('<API> Stopping server...');
    appState.ExpressServer = ServiceState.STOPPING;
    return new Promise((resolve, _) => {
        server.close(() => {
            appState.ExpressServer = ServiceState.STOPPED;
            resolve();
        });
    });
};

export default app;
