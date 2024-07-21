export interface ICreateSecretRequest {
    encryptedSecret: string;
    ipRestrictions: string[];
    maxViews: number;
    secretPassword: string;
    expirationDate: Date;
    emailNotification: boolean;
}