/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GetSecretStatsResponse = {
    reportedViews?: number;
    totalViews?: number;
    uniqueViews?: number;
    grantedAttempts?: number;
    refusedAttempts?: number;
    /**
     * null indicates unlimited views
     */
    maxViews?: number | null;
    expirationDate?: string | null;
    createdAt?: string | null;
    hasPassword?: boolean;
    ipRestrictions?: Array<string>;
    emailNotification?: string | null;
    status?: GetSecretStatsResponse.status;
};
export namespace GetSecretStatsResponse {
    export enum status {
        ACTIVE = 'active',
        EXPIRED = 'expired',
        EXHAUSTED = 'exhausted',
    }
}

