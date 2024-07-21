import { Channel, Connection, connect } from "amqplib";
import sendEmail from "./emailer";
import Redis from "ioredis";
import { setTimeout } from "timers/promises";

type EmailerConfig = {
    host: string;
    username: string;
    password: string;
    queue: string;
    redisHost: string;
    redisPort: number;
    redisPassword?: string;
    maxEmailsPerHour: number;
    emailCountKey: string;
    emailLockKey: string;
    emailLockTTL: number;
};

const getConfig = (): EmailerConfig => {
    const {
        RABBITMQ_HOST,
        RABBITMQ_USERNAME,
        RABBITMQ_PASSWORD,
        RABBITMQ_QUEUE,
        REDIS_HOST,
        REDIS_PORT,
        REDIS_PASSWORD,
        MAX_EMAILS_PER_HOUR,
        EMAIL_COUNT_KEY,
        EMAIL_LOCK_KEY,
        EMAIL_LOCK_TTL
    } = process.env;
    if (!RABBITMQ_HOST || !RABBITMQ_USERNAME || !RABBITMQ_PASSWORD || !RABBITMQ_QUEUE || !REDIS_HOST
        || !REDIS_PORT || !MAX_EMAILS_PER_HOUR || !EMAIL_COUNT_KEY || !EMAIL_LOCK_KEY || !EMAIL_LOCK_TTL) {
        throw new Error('Missing required environment variables');
    }
    return {
        host: RABBITMQ_HOST,
        username: RABBITMQ_USERNAME,
        password: RABBITMQ_PASSWORD,
        queue: RABBITMQ_QUEUE,
        redisHost: REDIS_HOST,
        redisPort: Number(REDIS_PORT),
        redisPassword: REDIS_PASSWORD,
        maxEmailsPerHour: Number(MAX_EMAILS_PER_HOUR),
        emailCountKey: EMAIL_COUNT_KEY,
        emailLockKey: EMAIL_LOCK_KEY,
        emailLockTTL: Number(EMAIL_LOCK_TTL)
    };
};

type ConnectResult = {
    channel: Channel | null;
    error: any;
};

const connectToRabbitMQ = (connectionString: string): Promise<ConnectResult> =>
    connect(connectionString)
        .then((connection: Connection) => connection.createChannel())
        .then((channel: Channel) => ({ channel, error: null }))
        .catch((error: any) => ({ channel: null, error }));

type AssertQueueResult = {
    success: boolean;
    error: any;
};

const assertQueue = (channel: Channel, queueName: string): Promise<AssertQueueResult> =>
    channel.assertQueue(queueName, { durable: true })
        .then(() => ({ success: true, error: null }))
        .catch((error: any) => ({ success: false, error }));

const getRedisClient = (config: EmailerConfig): Redis => {
    return new Redis({
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword
    });
};

const acquireLock = async (redis: Redis, config: EmailerConfig): Promise<boolean> => {
    const lock = await redis.set(config.emailLockKey, 'locked', 'PX', config.emailLockTTL, 'NX');
    return lock !== null;
};

const checkRateLimit = async (redis: Redis, config: EmailerConfig): Promise<boolean> => {
    const emailCount = await redis.get(config.emailCountKey);
    return Number(emailCount) < config.maxEmailsPerHour;
};

const processMessage = async (msg: any, channel: Channel, redis: Redis, config: EmailerConfig): Promise<void> => {
    const message = JSON.parse(msg.content.toString());
    console.log('Received message:', message);

    const { to, subject, body } = message;
    try {
        await sendEmail(to, subject, body);
        await redis.incr(config.emailCountKey);
        const emailCount = await redis.get(config.emailCountKey);
        console.log(`Email sent. Count: ${Number(emailCount)}`);
        channel.ack(msg);
    } catch (error) {
        console.error('Error sending email:', error);
        channel.nack(msg, false, true);  // Requeue the message
    } finally {
        await redis.del(config.emailLockKey);
    }
};

const handleMessage = async (msg: any, channel: Channel, redis: Redis, config: EmailerConfig): Promise<void> => {
    if (msg !== null) {
        const lockAcquired = await acquireLock(redis, config);
        if (!lockAcquired) {
            console.log('Failed to acquire lock, requeueing message.');
            channel.nack(msg, false, true);
            return;
        }

        const withinRateLimit = await checkRateLimit(redis, config);
        if (!withinRateLimit) {
            console.log('Rate limit reached. Delaying message consumption.');
            await redis.del(config.emailLockKey);
            await setTimeout(60 * 1000);  // Wait for 1 minute before trying again
            channel.nack(msg, false, true);  // Requeue the message
            return;
        }

        await processMessage(msg, channel, redis, config);
    }
};

const consumeMessages = async (): Promise<void> => {
    const config = getConfig();
    const redis = getRedisClient(config);
    const connectionString = `amqp://${config.username}:${config.password}@${config.host}`;
    const { channel, error: connectionError } = await connectToRabbitMQ(connectionString);

    if (connectionError) {
        console.error('Error connecting to RabbitMQ:', connectionError);
        return;
    }

    if (!channel) {
        console.error('Failed to create a channel');
        return;
    }

    const { success, error: queueError } = await assertQueue(channel, config.queue);
    if (!success) {
        console.error('Error asserting RabbitMQ queue:', queueError);
        return;
    }

    console.log(`Waiting for messages in queue: ${config.queue}`);

    await channel.consume(config.queue, (msg) => handleMessage(msg, channel, redis, config));

    // Reset the counter every hour
    setInterval(() => {
        redis.set(config.emailCountKey, '0')
            .then(() => console.log("Email counter reset."))
            .catch((error) => console.error('Error resetting email counter:', error));
    }, 60 * 60 * 1000);
};

export default consumeMessages;
