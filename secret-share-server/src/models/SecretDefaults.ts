/**
 * Represents the default configuration settings for a secret.
 * @interface
 */
export interface ISecretDefaults {
    maxViews: number;
    defaultExpirationLength: number;
    destroyOnFailedAccess: boolean;
}

/**
 * Represents the default configuration settings for a secret.
 * @class
 */
export class SecretDefaults implements ISecretDefaults {

    /**
     * The maximum number of views allowed.
     *
     * @type {number}
     * @constant
     * @default 1
     */
    public maxViews: number = !!process.env.MAX_VIEWS && !Number.isNaN(+process.env.MAX_VIEWS)
        ? +process.env.MAX_VIEWS
        : 1;

    /**
     * The default length of time before a secret expires.
     *
     * @type {number}
     * @constant
     * @default 604800000
     * @description 604800000 milliseconds = 1 week
     */
    public defaultExpirationLength: number = !!process.env.DEFAULT_EXPIRATION_LENGTH
        && !Number.isNaN(+process.env.DEFAULT_EXPIRATION_LENGTH)
            ? +process.env.DEFAULT_EXPIRATION_LENGTH
            : 604800000;

    /**
     * Whether to destroy the secret after a failed access attempt.
     *
     * @type {boolean}
     * @default false
     */
    public destroyOnFailedAccess: boolean = process.env.DESTROY_ON_FAILED_ACCESS === 'true';
}