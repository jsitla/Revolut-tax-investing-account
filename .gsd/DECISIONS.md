# DECISIONS.md — Architecture Decision Records

## ADR-001: Frontend-Only Architecture
**Date**: 2026-01-28
**Status**: Accepted

**Context**: Project needs to process sensitive financial data.

**Decision**: Build as client-side only web app (no backend).

**Consequences**:
- ✅ Data privacy - all processing in browser
- ✅ No hosting costs for backend
- ✅ Simpler deployment (static hosting)
- ⚠️ ECB rate conversion requires client-side API call or manual input

---

## ADR-002: React + Vite + TypeScript Stack
**Date**: 2026-01-28
**Status**: Accepted

**Context**: Need modern, fast development setup.

**Decision**: Use Vite with React and TypeScript.

**Consequences**:
- ✅ Fast development with HMR
- ✅ Type safety for complex data structures
- ✅ Wide ecosystem support
