import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Secret, { ISecret, SecretAccessLog } from 'src/models/Secret';

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

describe('Secret Model Test', () => {

    it('should create & save a secret successfully', async () => {
        const secretData: Partial<ISecret> = {
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id'
        };
        const validSecret = new Secret(secretData);
        const savedSecret = await validSecret.save();

        // Object Id should be defined when successfully saved to MongoDB.
        expect(savedSecret._id).toBeDefined();
        expect(savedSecret.identifier).toBe(secretData.identifier);
        expect(savedSecret.encryptedSecret).toBe(secretData.encryptedSecret);
        expect(savedSecret.creatorIdentifier).toBe(secretData.creatorIdentifier);
    });

    it('should fail when a required field is missing', async () => {
        const secretData: Partial<ISecret> = {
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data'
        };
        const secretWithoutRequiredField = new Secret(secretData);
        let err: any;
        try {
            await secretWithoutRequiredField.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.creatorIdentifier).toBeDefined();
    });

    it('should have default values', async () => {
        const secretData: Partial<ISecret> = {
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id'
        };
        const secretWithDefaults = new Secret(secretData);
        const savedSecret = await secretWithDefaults.save();

        expect(savedSecret.ipRestrictions).toEqual([]);
        expect(savedSecret.maxViews).toBe(Infinity);
        expect(savedSecret.currentViews).toBe(0);
    });

    it('should save and retrieve embedded accessLogs', async () => {
        const secretData: Partial<ISecret> = {
            identifier: 'unique-id',
            encryptedSecret: 'encrypted-data',
            creatorIdentifier: 'creator-id'
        };
        const secretWithDefaults = new Secret(secretData);
        const savedSecret = await secretWithDefaults.save();

        // Simulate adding access logs by a different service
        const accessLog = new SecretAccessLog(
            '127.0.0.1',
            new Date(),
            true,
            'referrer',
            'user-agent',
            ['header1', 'header2'],
            'request-body'
        );

        savedSecret.accessLogs = [accessLog];
        const updatedSecret = await savedSecret.save();

        const retrievedSecret = await Secret.findById(updatedSecret._id).exec();

        expect(retrievedSecret!.accessLogs).toHaveLength(1);
        if (!savedSecret.accessLogs) {
            throw new Error('No access logs found');
        }
        expect(retrievedSecret!.accessLogs![0].ipAddress).toBe('127.0.0.1');
        expect(retrievedSecret!.accessLogs![0].accessGranted).toBe(true);
    });
});
