/// <reference types="@rsbuild/core/types" />

// Augments the `ImportMetaEnv` interface that @rsbuild/core/types declares.
// `import.meta.env` itself is already typed by that reference — only the
// project-specific keys belong here.
interface ImportMetaEnv {
  /**
   * Absolute base URL of the SecretShare API, e.g. `http://localhost:5000`.
   * Leave unset (or empty) to talk to the same origin — the production nginx
   * container proxies `/api` to the server.
   *
   * Must keep the `PUBLIC_` prefix: rsbuild only exposes prefixed vars to
   * client code.
   */
  readonly PUBLIC_API_URL?: string;
}
