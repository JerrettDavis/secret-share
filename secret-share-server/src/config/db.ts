import mongoose from 'mongoose';
import { appState, ServiceState } from 'src/appState';

export const connectToDatabase = async (MONGO_URI: string) => {
    console.log('<DB> Connecting to MongoDB...');
    appState.MongoConnection = ServiceState.STARTING;
    try {
        await mongoose.connect(MONGO_URI, {});
        console.log('<DB> Connected to MongoDB');
        appState.MongoConnection = ServiceState.RUNNING;
    } catch (err) {
        console.error('<DB> connection error:', err);
        appState.MongoConnection = ServiceState.ERROR;
        throw err;
    }
};

export const stopMongoDB = async () => {
    console.log('<DB> Disconnecting from MongoDB...');
    appState.MongoConnection = ServiceState.STOPPING;
    await mongoose.disconnect();
    appState.MongoConnection = ServiceState.STOPPED;
};