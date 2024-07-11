import {Document, model, Schema} from 'mongoose';


export interface ISecret extends Document {
    identifier: string;
    encryptedSecret: string;
    creatorIdentifier: string;
    ipRestrictions?: string[];
    maxViews?: number;
    currentViews?: number;
    secretPassword?: string;
    expirationDate?: Date;
    emailNotification?: string;
    destroyOnFailedAccess?: boolean;
    accessLogs?: ISecretAccessLog[];
}

interface ISecretAccessLog {
    ipAddress: string;
    accessDate: Date;
    accessGranted: boolean;
    referrer?: string;
    userAgent?: string;
    requestHeaders?: string[];
    requestBody?: string;
}


export class SecretAccessLog implements ISecretAccessLog {
    constructor(
        public ipAddress: string,
        public accessDate: Date,
        public accessGranted: boolean,
        public referrer?: string | undefined,
        public userAgent?: string | undefined,
        public requestHeaders?: string[],
        public requestBody?: string) {
    }
}

const SecretScheme = new Schema<ISecret>({
    identifier: {type: String, required: true, unique: true},
    encryptedSecret: {type: String, required: true},
    creatorIdentifier: {type: String, required: true},
    ipRestrictions: {type: [String], default: []},
    maxViews: {type: Number, default: Infinity},
    currentViews: {type: Number, default: 0},
    secretPassword: {type: String},
    expirationDate: {type: Date},
    emailNotification: {type: String},
    accessLogs: {
        type: [{
            ipAddress: {type: String, required: true},
            accessDate: {type: Date, required: true},
            accessGranted: {type: Boolean, required: true},
            referrer: String,
            userAgent: String,
            requestHeaders: [String],
            requestBody: String
        }]
    },
});

export default model<ISecret>('Secret', SecretScheme);
