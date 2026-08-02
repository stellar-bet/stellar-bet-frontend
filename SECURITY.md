# Security Policy

## Reporting

Report vulnerabilities via GitHub Security Advisories — do not open public issues.

## Key rules

- Never put private keys, secrets, or seed phrases in frontend code
- All contract addresses come from `NEXT_PUBLIC_*` env vars — never hardcode them
- User input (stake amounts, addresses) must be validated client-side before
  building Soroban transactions
- Do not `eval()` or `dangerouslySetInnerHTML` with any user-controlled data
- Transaction signing goes through Freighter — the app never touches private keys
