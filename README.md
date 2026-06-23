# secret-share

A self-hosted, end-to-end encrypted secret sharing application. Secrets are encrypted client-side before transmission and can only be retrieved once — after which they are permanently deleted.

## Services

| Directory | Description |
|---|---|
| `secret-share-client` | React/TypeScript front-end (rsbuild) |
| `secret-share-server` | Express/TypeScript API server |
| `secret-share-mailer` | RabbitMQ-backed email notification service |

## Quick Start

```bash
docker compose up
```

## Development

Each service can be run independently. See the `Dockerfile.dev` files and `docker-compose.dev.yml` for local development setup.

## License

MIT — see [LICENSE](./LICENSE).
