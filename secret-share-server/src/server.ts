import './config/dotenv';
import app, {startServer, stopServer} from './app';
import {connectToDatabase, stopMongoDB} from './config/db';
import {connectToRabbitMQ, stopRabbitMQ} from './config/rabbitmq';
import http from "http";

const handleShutdown = (server: http.Server) => {
    const shutdown = async () => {
        console.log('Shutting down...');
        await Promise.all([stopMongoDB(), stopRabbitMQ(), stopServer(server)]);
        process.exit(0);
    };

    process.on('SIGINT', async () => await shutdown());
    process.on('SIGTERM', async () => await shutdown());
};

const startup = async () => {
    console.log('<APP> Starting up...');

    try {
        await Promise.all([connectToDatabase(process.env.MONGO_URI || ''), connectToRabbitMQ()]);
        const server = await startServer(app);
        handleShutdown(server);
    } catch (err) {
        console.error('<APP> Startup error:', err);
        throw err;
    }
};

startup()
    .then(() => console.log('<APP> App startup completed'))
    .catch((e) => console.error('<APP> Error during app startup:', e));
