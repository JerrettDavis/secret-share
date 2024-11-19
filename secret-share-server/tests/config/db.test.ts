import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, stopMongoDB } from 'src/config/db';
import {appState, ServiceState} from "src/appState";

describe('Database Connection', () => {
    let mongoServer: MongoMemoryServer;
    const MONGO_URI = 'mongodb://localhost:27017/testdb';

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await connectToDatabase(uri);
    });

    afterAll(async () => {
        await stopMongoDB();
        await mongoServer.stop();
    });

    it('should connect to the database successfully', async () => {
        expect(mongoose.connection.readyState).toBe(1); // 1 indicates connected state
        expect(appState.MongoConnection).toBe(ServiceState.RUNNING);
    });

    it('should set state to ERROR on connection failure', async () => {
        await stopMongoDB();
        const originalUri = mongoose.connect;
        mongoose.connect = jest.fn().mockRejectedValueOnce(new Error('connection error'));

        await expect(connectToDatabase(MONGO_URI)).rejects.toThrow('connection error');
        expect(appState.MongoConnection).toBe(ServiceState.ERROR);

        // Restore original function
        mongoose.connect = originalUri;
    });

    it('should disconnect from the database successfully', async () => {
        await stopMongoDB();

        expect(mongoose.connection.readyState).toBe(0); // 0 indicates disconnected state
        expect(appState.MongoConnection).toBe(ServiceState.STOPPED);
    });
});
