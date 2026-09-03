import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from 'src/app'; // Assuming your Express app is exported from this module
import Secret from 'src/models/Secret';

// Slower CI/sandboxed environments can take longer than the library default
// (10s) to spawn the in-memory mongod, so give it more headroom.
jest.setTimeout(30000);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    const collections = await mongoose.connection.db!.collections();
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

    describe('retrieve error codes', () => {
        it('should return 403 with EXPIRED errorCode and expiresAt detail when secret is expired', async () => {
            const expiresAt = new Date(Date.now() - 1000);
            const secret = new Secret({
                identifier: 'expired-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                expirationDate: expiresAt,
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/expired-id');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.errorCode).toBe('EXPIRED');
            expect(res.body.details.expiresAt).toBe(expiresAt.toISOString());
        });

        it('should return 403 with VIEW_LIMIT_REACHED errorCode when view limit is reached', async () => {
            const secret = new Secret({
                identifier: 'view-limit-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                maxViews: 1,
                currentViews: 1,
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/view-limit-id');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.errorCode).toBe('VIEW_LIMIT_REACHED');
        });

        it('should return 403 with IP_NOT_ALLOWED errorCode and clientIp detail when IP is restricted', async () => {
            const secret = new Secret({
                identifier: 'ip-restriction-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                ipRestrictions: ['192.168.0.1'],
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/ip-restriction-id');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.errorCode).toBe('IP_NOT_ALLOWED');
            expect(res.body.details).toHaveProperty('clientIp');
        });

        it('should return 403 with PASSWORD_REQUIRED errorCode when no password header is sent', async () => {
            const secret = new Secret({
                identifier: 'password-required-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                secretPassword: 'correct-password',
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/password-required-id');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.errorCode).toBe('PASSWORD_REQUIRED');
        });

        it('should return 403 with INVALID_PASSWORD errorCode when the wrong password header is sent', async () => {
            const secret = new Secret({
                identifier: 'invalid-password-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                secretPassword: 'correct-password',
            });
            await secret.save();

            const res = await request(app.app)
                .get('/api/secrets/invalid-password-id')
                .set('x-secret-password', 'wrong-password');
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.errorCode).toBe('INVALID_PASSWORD');
        });

        it('should return 200 when the correct x-secret-password header is sent (regression test)', async () => {
            const secret = new Secret({
                identifier: 'valid-password-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'creator-id',
                secretPassword: 'correct-password',
            });
            await secret.save();

            const res = await request(app.app)
                .get('/api/secrets/valid-password-id')
                .set('x-secret-password', 'correct-password');
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.secret).toBe('encrypted-data');
        });
    });

    describe('extended stats response', () => {
        it('should report maxViews as null when unlimited', async () => {
            const secret = new Secret({
                identifier: 'unlimited-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'unlimited-creator-id',
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/stats/unlimited-creator-id');
            expect(res.status).toBe(200);
            expect(res.body.data.maxViews).toBeNull();
            expect(res.body.data.status).toBe('active');
        });

        it('should report hasPassword correctly and never leak the secretPassword value', async () => {
            const secretWithPassword = new Secret({
                identifier: 'with-password-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'with-password-creator-id',
                secretPassword: 'super-secret-password',
            });
            await secretWithPassword.save();

            const resWith = await request(app.app).get('/api/secrets/stats/with-password-creator-id');
            expect(resWith.body.data.hasPassword).toBe(true);
            expect(JSON.stringify(resWith.body.data)).not.toContain('super-secret-password');
            expect(resWith.body.data).not.toHaveProperty('secretPassword');
            expect(resWith.body.data.createdAt).not.toBeNull();

            const secretWithoutPassword = new Secret({
                identifier: 'without-password-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'without-password-creator-id',
            });
            await secretWithoutPassword.save();

            const resWithout = await request(app.app).get('/api/secrets/stats/without-password-creator-id');
            expect(resWithout.body.data.hasPassword).toBe(false);
        });

        it('should report status as expired for an expired secret', async () => {
            const secret = new Secret({
                identifier: 'expired-stats-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'expired-stats-creator-id',
                expirationDate: new Date(Date.now() - 1000),
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/stats/expired-stats-creator-id');
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('expired');
            expect(res.body.data.createdAt).not.toBeNull();
        });

        it('should report status as exhausted when view limit reached', async () => {
            const secret = new Secret({
                identifier: 'exhausted-stats-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'exhausted-stats-creator-id',
                maxViews: 2,
                currentViews: 2,
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/stats/exhausted-stats-creator-id');
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('exhausted');
        });

        it('should report status as active for a fresh secret', async () => {
            const secret = new Secret({
                identifier: 'active-stats-id',
                encryptedSecret: 'encrypted-data',
                creatorIdentifier: 'active-stats-creator-id',
                maxViews: 5,
                currentViews: 1,
            });
            await secret.save();

            const res = await request(app.app).get('/api/secrets/stats/active-stats-creator-id');
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('active');
            expect(res.body.data.createdAt).not.toBeNull();
        });
    });
});
