# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Reporting a Vulnerability

**Do not open public GitHub Issues for security vulnerabilities.**

- **Low severity** (UI bugs, minor disclosure): open a GitHub Issue with label `security`
- **High severity** (RCE, data exfiltration, supply chain): email the maintainer directly (see GitHub profile)

Expect acknowledgment within 48 hours, fix within 7 days for critical issues.

## Security Architecture

- No backend, no server, no user data transmitted anywhere
- Mermaid rendering uses `securityLevel: 'strict'` — prevents script injection via diagram syntax
- Static export only — no server-side code in the distributed package
- Dependencies audited on every CI run via `pnpm audit`

## Auditing Locally

```bash
pnpm audit --audit-level moderate
```
