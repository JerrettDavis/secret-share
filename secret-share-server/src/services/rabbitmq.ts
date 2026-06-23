import amqplib, { ChannelModel, Channel } from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const { RABBITMQ_HOST, RABBITMQ_USERNAME, RABBITMQ_PASSWORD, RABBITMQ_QUEUE } = process.env;

if (!RABBITMQ_HOST || !RABBITMQ_USERNAME || !RABBITMQ_PASSWORD || !RABBITMQ_QUEUE) {
  throw new Error('Missing required RabbitMQ environment variables');
}

class RabbitMQ {
  private channelModel: ChannelModel | null = null;
  private channel: Channel | null = null;

  async connect() {
    const url = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}`;
    this.channelModel = await amqplib.connect(url);
    this.channel = await this.channelModel.createChannel();
    await this.channel.assertQueue(RABBITMQ_QUEUE!, { durable: true });
  }

  async publishToQueue(queueName: string, message: string) {
    if (!this.channel) throw new Error('Channel is not initialized');
    this.channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  }

  async disconnect() {
    if (this.channel) await this.channel.close();
    if (this.channelModel) await this.channelModel.close();
  }
}

export const rabbitMQ = new RabbitMQ();
