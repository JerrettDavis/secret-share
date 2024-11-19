import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from 'src/app'; // Assuming your Express app is exported from this module
import Secret from 'src/models/Secret';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

describe('Secret Routes', () => {
    it('should create a new secret', async () => {
        const res = await request(app.app)
            .post('/api/secrets/')
            .send({
                encryptedSecret: 'encrypted-data',
                ipRestrictions: ['127.0.0.1'],
                maxViews: 5,
                secretPassword: 'password',
                emailNotification: 'test@example.com'
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('identifier');
        expect(res.body.data).toHaveProperty('creatorIdentifier');
    });

    it('should retrieve default secret settings', async () => {
        const res = await request(app.app).get('/api/secrets/defaults');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('maxViews');
        expect(res.body.data).toHaveProperty('defaultExpirationLength');
    });

    it('should retrieve a secret by identifier', async () => {
        const secret = new Secret({
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id'
        });
        await secret.save();

        const res = await request(app.app).get('/api/secrets/unique-id');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.secret).toBe('encrypted-data');
    });

    it('should delete a secret by creator identifier', async () => {
        const secret = new Secret({
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id'
        });
        await secret.save();

        const res = await request(app.app).delete('/api/secrets/creator-id');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.message).toBe('Secret deleted');

        const deletedSecret = await Secret.findOne({ creatorIdentifier: 'creator-id' });
        expect(deletedSecret).toBeNull();
    });

    it('should retrieve access logs for a secret by creator identifier', async () => {
        const secret = new Secret({
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            accessLogs: [{
                ipAddress: '127.0.0.1',
                accessDate: new Date(),
                accessGranted: true
            }]
        });
        await secret.save();

        const res = await request(app.app).get('/api/secrets/logs/creator-id');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.logs).toHaveLength(1);
        expect(res.body.data.logs[0].ipAddress).toBe('127.0.0.1');
    });

    it('should retrieve stats for a secret by creator identifier', async () => {
        const secret = new Secret({
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            currentViews: 2,
            accessLogs: [
                { ipAddress: '127.0.0.1', accessDate: new Date(), accessGranted: true },
                { ipAddress: '127.0.0.2', accessDate: new Date(), accessGranted: true }
            ]
        });
        await secret.save();

        const res = await request(app.app).get('/api/secrets/stats/creator-id');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.reportedViews).toBe(2);
        expect(res.body.data.totalViews).toBe(2);
        expect(res.body.data.uniqueViews).toBe(2);
    });
});
