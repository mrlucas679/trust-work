# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the TrustWork project. ADRs document important architectural decisions made during the project's development.

## What is an ADR?

An Architecture Decision Record (ADR) captures a single architectural decision along with its context and consequences. ADRs help:

- Document why decisions were made
- Provide historical context for future team members
- Track the evolution of the architecture
- Facilitate architectural reviews and discussions

## ADR Format

Each ADR follows this structure:

1. **Title**: Short descriptive name
2. **Status**: Proposed | Accepted | Deprecated | Superseded
3. **Context**: What forces are at play (technical, business, team)
4. **Decision**: What we decided to do
5. **Consequences**: What becomes easier or harder as a result

## Naming Convention

ADRs are numbered sequentially and use kebab-case:

```
0001-use-supabase-for-backend.md
0002-adopt-react-query-for-state-management.md
0003-implement-row-level-security.md
```

## How to Create a New ADR

1. Copy the `template.md` file in this directory
2. Rename it with the next sequential number and a descriptive title
3. Fill in all sections with relevant information
4. Submit as part of your pull request
5. Update the index below once accepted

## Index

### Active ADRs

| Number | Title | Status | Date |
|--------|-------|--------|------|
| 0001 | [Use Supabase for Backend Services](./0001-use-supabase-for-backend.md) | Accepted | 2024-10-15 |
| 0002 | [Adopt TanStack Query for State Management](./0002-adopt-tanstack-query-for-state-management.md) | Accepted | 2024-10-20 |
| 0003 | [Implement Row-Level Security (RLS)](./0003-implement-row-level-security.md) | Accepted | 2024-10-22 |
| 0004 | [Use shadcn/ui for Component Library](./0004-use-shadcn-ui-for-components.md) | Accepted | 2024-10-25 |

### Superseded ADRs

| Number | Title | Superseded By | Date |
|--------|-------|---------------|------|
| _None yet_ | | | |

### Deprecated ADRs

| Number | Title | Reason | Date |
|--------|-------|--------|------|
| _None yet_ | | | |

---

## References

- [ADR GitHub Organization](https://adr.github.io/)
- [Documenting Architecture Decisions by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR Tools](https://github.com/npryce/adr-tools)

---

**Last Updated:** November 3, 2025  
**Maintained By:** TrustWork Engineering Team
