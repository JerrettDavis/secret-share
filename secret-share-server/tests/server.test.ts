import http from 'http';
import app from 'src/app';
import {connectToDatabase, stopMongoDB} from 'src/config/db';
import {connectToRabbitMQ, stopRabbitMQ} from 'src/config/rabbitmq';

jest.mock('src/app', () => ({
    startServer: jest.fn(),
    stopServer: jest.fn(),
}));

jest.mock('src/config/db', () => ({
    connectToDatabase: jest.fn(),
    stopMongoDB: jest.fn(),
}));

jest.mock('src/config/rabbitmq', () => ({
    connectToRabbitMQ: jest.fn(),
    stopRabbitMQ: jest.fn(),
}));

const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
    // throw new Error(`process.exit(${code}) called`);
    console.log(`process.exit(${code}) called`);
    return code as never;
});

describe('Server Startup', () => {
    let server: http.Server;

    beforeEach(() => {
        jest.clearAllMocks();
        server = {} as http.Server;
        (app.startServer as jest.Mock).mockResolvedValue(server);
        (connectToDatabase as jest.Mock).mockResolvedValue({});
        (connectToRabbitMQ as jest.Mock).mockResolvedValue({});
        console.log = jest.fn();
        console.error = jest.fn();
    });

    it('should start up correctly', async () => {
        const startup = require('src/startup').default;
        await startup();

        expect(connectToDatabase).toHaveBeenCalledWith(process.env.MONGO_URI || '');
        expect(connectToRabbitMQ).toHaveBeenCalled();
        expect(app.startServer).toHaveBeenCalledWith(app.app);
        expect(console.log).toHaveBeenCalledWith('<APP> App startup completed');
    });

    it('should handle database connection failure', async () => {
        (connectToDatabase as jest.Mock).mockRejectedValue(new Error('Database error'));

        const startup = require('src/startup').default;
        await expect(startup()).rejects.toThrow('Database error');

        expect(console.error).toHaveBeenCalledWith('<APP> Startup error:', expect.any(Error));
    });

    it('should handle RabbitMQ connection failure', async () => {
        (connectToRabbitMQ as jest.Mock).mockRejectedValue(new Error('RabbitMQ error'));

        const startup = require('src/startup').default;
        await expect(startup()).rejects.toThrow('RabbitMQ error');

        expect(console.error).toHaveBeenCalledWith('<APP> Startup error:', expect.any(Error));
    });

    it('should handle server startup failure', async () => {
        (app.startServer as jest.Mock).mockRejectedValue(new Error('Server error'));

        const startup = require('src/startup').default;
        await expect(startup()).rejects.toThrow('Server error');

        expect(console.error).toHaveBeenCalledWith('<APP> Startup error:', expect.any(Error));
    });

    it('should handle SIGINT for graceful shutdown', async () => {
        process.emit('SIGINT');

        await new Promise(process.nextTick);

        expect(stopMongoDB).toHaveBeenCalled();
        expect(stopRabbitMQ).toHaveBeenCalled();
        expect(app.stopServer).toHaveBeenCalledWith(server);
        expect(mockExit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith('Shutting down...');
    });

    it('should handle SIGTERM for graceful shutdown', async () => {
        process.emit('SIGTERM');

        await new Promise(process.nextTick);

        expect(stopMongoDB).toHaveBeenCalled();
        expect(stopRabbitMQ).toHaveBeenCalled();
        expect(app.stopServer).toHaveBeenCalledWith(server);
        expect(mockExit).toHaveBeenCalledWith(0);
        expect(console.log).toHaveBeenCalledWith('Shutting down...');
    });
});
