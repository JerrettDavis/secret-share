import { ApiClient } from '@generated/ApiClient';
import { API_BASE_URL } from '../config';

/**
 * The single module in the app that touches the generated OpenAPI client.
 *
 * Everything else imports `secretsApi` from here, so a codegen rename (a
 * swagger tag change, a new service split) is a one-file fix rather than a
 * repo-wide find-and-replace.
 *
 * NOTE: `api.secrets` is the post-regeneration shape (swagger tag `Secrets`).
 * Older generated output exposed the same service as `api.default`.
 */
const api = new ApiClient({ BASE: API_BASE_URL });

export const secretsApi = api.secrets;

export { api };
export default secretsApi;
