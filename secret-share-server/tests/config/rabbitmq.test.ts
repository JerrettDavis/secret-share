import { connectToRabbitMQ, stopRabbitMQ } from 'src/config/rabbitmq';
import { appState, ServiceState } from 'src/appState';
import { rabbitMQ } from 'src/services/rabbitmq';

jest.mock('src/services/rabbitmq', () => ({
    rabbitMQ: {
        connect: jest.fn(),
        disconnect: jest.fn(),
    },
}));

describe('RabbitMQ Connection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to RabbitMQ successfully', async () => {
        (rabbitMQ.connect as jest.Mock).mockResolvedValueOnce({});

        await connectToRabbitMQ();

        expect(rabbitMQ.connect).toHaveBeenCalled();
        expect(appState.RabbitMQConnection).toBe(ServiceState.RUNNING);
    });

    it('should set state to ERROR on connection failure', async () => {
        const error = new Error('connection error');
        (rabbitMQ.connect as jest.Mock).mockRejectedValueOnce(error);

        await expect(connectToRabbitMQ()).rejects.toThrow('connection error');
        expect(rabbitMQ.connect).toHaveBeenCalled();
        expect(appState.RabbitMQConnection).toBe(ServiceState.ERROR);
    });

    it('should disconnect from RabbitMQ successfully', async () => {
        await stopRabbitMQ();

        expect(rabbitMQ.disconnect).toHaveBeenCalled();
        expect(appState.RabbitMQConnection).toBe(ServiceState.STOPPED);
    });
});
