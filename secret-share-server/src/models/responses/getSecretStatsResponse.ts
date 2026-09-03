export interface IGetSecretStatsResponse {
  reportedViews: number;
  totalViews: number;
  uniqueViews: number;
  grantedAttempts: number;
  refusedAttempts: number;
  maxViews: number | null;         // null = unlimited (Infinity is not JSON-safe — never emit it raw)
  expirationDate: string | null;   // ISO
  createdAt: string | null;        // ISO
  hasPassword: boolean;            // NEVER include the actual secretPassword value in this response
  ipRestrictions: string[];
  emailNotification: string | null;
  status: 'active' | 'expired' | 'exhausted';
}
