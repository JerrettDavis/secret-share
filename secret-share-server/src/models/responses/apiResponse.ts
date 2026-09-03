import { SecretErrorCode } from '@responses/secretErrorCode';

export interface IApiResponse<TData> {
    success: boolean;
    data?: TData;
    error?: string;
    errorCode?: SecretErrorCode;
    details?: {
        expiresAt?: string;
        clientIp?: string;
    };
}