export enum ServiceState {
    STARTING = 'STARTING',
    RUNNING = 'RUNNING',
    STOPPING = 'STOPPING',
    STOPPED = 'STOPPED',
    ERROR = 'ERROR',
    UNKNOWN = 'UNKNOWN'
}

export interface AppState {
    MongoConnection: ServiceState;
    RabbitMQConnection: ServiceState;
    ExpressServer: ServiceState;
}

export const appState: AppState = {
    MongoConnection: ServiceState.UNKNOWN,
    RabbitMQConnection: ServiceState.UNKNOWN,
    ExpressServer: ServiceState.UNKNOWN
};