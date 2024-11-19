import { rabbitMQ } from '@services/rabbitmq';
import { appState, ServiceState } from 'src/appState';

export const connectToRabbitMQ = async (): Promise<void> => {
    console.log('<MQ> Connecting to RabbitMQ...');
    appState.RabbitMQConnection = ServiceState.STARTING;
    try {
        await rabbitMQ.connect();
        console.log('<MQ> Connected to RabbitMQ');
        appState.RabbitMQConnection = ServiceState.RUNNING
    } catch (err) {
        console.error('<MQ> RabbitMQ connection error:', err);
        appState.RabbitMQConnection = ServiceState.ERROR
        throw err;
    }
};

export const stopRabbitMQ = async (): Promise<void> => {
    console.log('<MQ> Disconnecting from RabbitMQ...');
    appState.RabbitMQConnection = ServiceState.STOPPING;
    await rabbitMQ.disconnect();
    appState.RabbitMQConnection = ServiceState.STOPPED;
};
