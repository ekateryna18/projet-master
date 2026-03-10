# Semgrep Security Audit Report

| | |
|---|---|
| **Date** | 2026-03-10 11:03 UTC |
| **Commit** | `58617a0` |
| **Branch** | `main` |
| **Findings** | 1 |
| **Pipeline** | [View run](https://github.com/ekateryna18/projet-master/actions/runs/22899376767) |

## ERROR (1)

### `javascript.lang.security.detect-child-process.detect-child-process`
- **File**: `app/index.js:21`
- **Message**: Detected calls to child_process from a function argument `req`. This could lead to a command injection if the input is user controllable. Try to avoid calls to child_process, and if it is needed ensure user input is correctly sanitized or sandboxed.

