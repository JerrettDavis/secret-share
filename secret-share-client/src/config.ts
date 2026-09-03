/**
 * Runtime configuration.
 *
 * `PUBLIC_API_URL` must carry the `PUBLIC_` prefix: rsbuild only inlines env
 * vars with that prefix into client code. (The old `API_URL` variable was
 * silently dropped at build time, which is why it never took effect.)
 *
 * An empty value means "same origin" — the production nginx container proxies
 * `/api` to the server, so the deployed app needs no absolute base URL.
 */
const raw = (import.meta.env.PUBLIC_API_URL ?? '').trim();

/** Base URL with any trailing slashes stripped. `''` => same-origin. */
export const API_BASE_URL = raw.replace(/\/+$/, '');
