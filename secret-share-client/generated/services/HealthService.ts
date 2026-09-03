/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class HealthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Check the status of all services
     * Returns the status of all services and indicates if all are running.
     * @returns any All services are running
     * @throws ApiError
     */
    public getHealth(): CancelablePromise<{
        success?: boolean;
        services?: {
            MongoConnection?: 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';
            RabbitMQConnection?: 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';
            ExpressServer?: 'STARTING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'ERROR' | 'UNKNOWN';
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/health',
            errors: {
                500: `Some or all services are not running`,
            },
        });
    }
}
