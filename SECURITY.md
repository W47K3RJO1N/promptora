# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Privacy and Local-First Architecture
Promptora is designed from the ground up as a **100% local-first tool**:
- Prompts, optimizations, and evaluations are processed on your local Ollama daemon (`localhost:11434`).
- No prompt text is transmitted to third-party cloud APIs or external telemetry servers.
- History items are retained locally within your machine's session and browser storage.

## Reporting a Vulnerability
If you discover a security vulnerability within Promptora:
1. Please do NOT open a public GitHub issue.
2. Email security findings directly to `security@tokenwise.dev` or file a private advisory on GitHub.
3. Include detailed steps to reproduce, affected versions, and proof of concept.
We will respond within 48 hours.
