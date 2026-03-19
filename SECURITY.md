# Security Policy

## Reporting

If you find a security issue, do not open a public issue with exploit details. Report it privately to the maintainer with:

- affected file or surface area
- reproduction steps
- impact assessment
- suggested mitigation if available

## Secrets

- Do not commit API keys or production credentials.
- Keep local secrets in `.env` or `web/.env.local`.
- Treat research providers and model providers as external dependencies with their own failure and rate-limit modes.
