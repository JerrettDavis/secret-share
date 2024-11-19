import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import Secret from 'src/models/Secret';
import { validateSecret } from 'src/validators/secretValidator';

let mongoServer: MongoMemoryServer;
const app = express();

jest.mock('src/services/rabbitmq', () => ({
    rabbitMQ: {
        publishToQueue: jest.fn(),
    },
}));

app.use(express.json());
app.get('/test/:identifier', validateSecret, (req, res) => {
    res.status(200).send({ success: true, data: { secret: req.body.secret.encryptedSecret } });
});

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

describe('Secret Validator Middleware', () => {
    it('should return 404 if secret is not found', async () => {
        const res = await request(app).get('/test/nonexistent-id');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Secret not found');
    });

    it('should return 403 if secret is expired', async () => {
        const secret = new Secret({
            identifier: 'expired-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            expirationDate: new Date(Date.now() - 1000), // Expired date
        });
        await secret.save();

        const res = await request(app).get('/test/expired-id');
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Secret expired');
    });

    it('should return 403 if view limit is reached', async () => {
        const secret = new Secret({
            identifier: 'view-limit-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            maxViews: 1,
            currentViews: 1,
        });
        await secret.save();

        const res = await request(app).get('/test/view-limit-id');
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('View limit reached');
    });

    it('should return 403 if IP is not allowed', async () => {
        const secret = new Secret({
            identifier: 'ip-restriction-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            ipRestrictions: ['192.168.0.1'], // Different IP
        });
        await secret.save();

        const res = await request(app).get('/test/ip-restriction-id');
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('IP not allowed');
    });

    it('should return 403 if secret password is invalid', async () => {
        const secret = new Secret({
            identifier: 'password-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            secretPassword: 'correct-password',
        });
        await secret.save();

        const res = await request(app).get('/test/password-id').query({ secretPassword: 'wrong-password' });
        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Invalid secret password');
    });

    it('should return 200 if all validations pass', async () => {
        const secret = new Secret({
            identifier: 'valid-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id',
            ipRestrictions: [], // Allow all IPs
            maxViews: 10,
            currentViews: 0,
            secretPassword: 'password',
        });
        await secret.save();

        const res = await request(app).get('/test/valid-id').query({ secretPassword: 'password' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.secret).toBe(secret.encryptedSecret);
    });
});