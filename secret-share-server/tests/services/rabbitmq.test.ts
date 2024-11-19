import amqplib, { Connection, Channel } from 'amqplib';
import { rabbitMQ } from 'src/services/rabbitmq';

jest.mock('amqplib');

describe('RabbitMQ Service', () => {
    let mockConnection: Connection;
    let mockChannel: Channel;

    beforeEach(() => {
        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
            close: jest.fn(),
        } as unknown as Channel;

        mockConnection = {
            createChannel: jest.fn().mockResolvedValue(mockChannel),
            close: jest.fn(),
        } as unknown as Connection;

        (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Reset the rabbitMQ instance to ensure it's not connected for the next test
        (rabbitMQ as any).connection = null;
        (rabbitMQ as any).channel = null;
    });

    it('should connect to RabbitMQ successfully', async () => {
        await rabbitMQ.connect();

        expect(amqplib.connect).toHaveBeenCalledWith(`amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}`);
        expect(mockConnection.createChannel).toHaveBeenCalled();
        expect(mockChannel.assertQueue).toHaveBeenCalledWith(process.env.RABBITMQ_QUEUE, { durable: true });
    });

    it('should throw an error if publishToQueue is called without initializing the channel', async () => {
        await expect(rabbitMQ.publishToQueue('test-queue', 'test-message')).rejects.toThrow('Channel is not initialized');
    });

    it('should publish a message to the queue successfully', async () => {
        await rabbitMQ.connect();
        await rabbitMQ.publishToQueue('test-queue', 'test-message');

        expect(mockChannel.sendToQueue).toHaveBeenCalledWith('test-queue', Buffer.from('test-message'), { persistent: true });
    });

    it('should disconnect from RabbitMQ successfully', async () => {
        await rabbitMQ.connect();
        await rabbitMQ.disconnect();

        expect(mockChannel.close).toHaveBeenCalled();
        expect(mockConnection.close).toHaveBeenCalled();
    });
});
