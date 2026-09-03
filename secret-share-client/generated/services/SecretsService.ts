/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetSecretStatsResponse } from '../models/GetSecretStatsResponse';
import type { ICreateSecretRequest } from '../models/ICreateSecretRequest';
import type { ICreateSecretResponse } from '../models/ICreateSecretResponse';
import type { ISecretAccessLog } from '../models/ISecretAccessLog';
import type { SecretDefaults } from '../models/SecretDefaults';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class SecretsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new secret
     * @param requestBody
     * @returns any Secret created successfully
     * @throws ApiError
     */
    public postApiSecrets(
        requestBody: ICreateSecretRequest,
    ): CancelablePromise<{
        success?: boolean;
        data?: ICreateSecretResponse;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/secrets/',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
    /**
     * Get the default settings for secrets
     * @returns any Default secret settings retrieved successfully
     * @throws ApiError
     */
    public getApiSecretsDefaults(): CancelablePromise<{
        success?: boolean;
        data?: SecretDefaults;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/secrets/defaults',
        });
    }
    /**
     * Retrieve a secret by its identifier
     * @param identifier The identifier of the secret
     * @param xSecretPassword The secondary secret password (passed as a request header to avoid logging in server access logs)
     * @returns any Secret retrieved successfully
     * @throws ApiError
     */
    public getApiSecrets(
        identifier: string,
        xSecretPassword?: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            secret?: string;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/secrets/{identifier}',
            path: {
                'identifier': identifier,
            },
            headers: {
                'x-secret-password': xSecretPassword,
            },
            errors: {
                403: `Forbidden (expired, view limit reached, IP not allowed, or invalid secondary secret)`,
                404: `Secret not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Delete a given secret
     * Delete a secret by its creator identifier. This action is irreversible.
     * @param identifier The creator identifier of the secret
     * @returns any Secret deleted successfully
     * @throws ApiError
     */
    public deleteApiSecrets(
        identifier: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            message?: string;
        };
    }> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/secrets/{identifier}',
            path: {
                'identifier': identifier,
            },
            errors: {
                404: `Secret not found`,
                500: `Server error`,
            },
        });
    }
    /**
     * Get the access logs for a secret
     * Retrieve the access logs for a secret by its creator identifier
     * @param identifier The creator identifier of the secret
     * @returns any Access logs retrieved successfully
     * @throws ApiError
     */
    public getApiSecretsLogs(
        identifier: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: {
            logs?: Array<ISecretAccessLog>;
        };
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/secrets/logs/{identifier}',
            path: {
                'identifier': identifier,
            },
            errors: {
                404: `Secret not found`,
            },
        });
    }
    /**
     * Get usage statistics for a secret
     * Retrieve dashboard-ready usage statistics for a secret by its creator identifier
     * @param creatorIdentifier The creator identifier of the secret
     * @returns any Secret statistics retrieved successfully
     * @throws ApiError
     */
    public getApiSecretsStats(
        creatorIdentifier: string,
    ): CancelablePromise<{
        success?: boolean;
        data?: GetSecretStatsResponse;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/secrets/stats/{creatorIdentifier}',
            path: {
                'creatorIdentifier': creatorIdentifier,
            },
            errors: {
                404: `Secret not found`,
            },
        });
    }
}
