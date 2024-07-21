import dotenv from 'dotenv';

dotenv.config();

import consumeMessages from "src/emailConsumer";

async function main() {
    try {
        await consumeMessages();
    }    catch (error) {
        console.error('Error in RabbitMQ consumer:', error);
    }
}

main()
    .then(_ => console.log('Consumer started'))
    .catch(e => console.error('Error starting consumer:', e));

