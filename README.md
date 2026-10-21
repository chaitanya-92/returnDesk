# ReturnDesk

A returns and replacements management system built for the Frido full-stack assessment.

## Goals

- Manage return/replacement requests through a validated lifecycle.
- Persist requests and notes in PostgreSQL using Prisma.
- Enforce business rules on the server, not only in the UI.
- Provide a responsive operations dashboard, realistic seed data, and tests.

## Technology

- Next.js App Router, React, TypeScript, Tailwind CSS
- PostgreSQL and Prisma ORM
- Zod for request validation
- Vitest for focused unit/integration tests

## Business rules

- Allowed lifecycle: Open → In Review → Approved → Completed; In Review → Rejected.
- Rejected and Completed are terminal states.
- Approval requires a resolution: Refund, Replacement, or Store Credit.
- Refund requires a positive amount. Other resolutions must not include a refund amount.
- Only one active request may exist for an order item. Rejected and Completed requests do not block a new request.
- Request details cannot be edited after approval, rejection, or completion. Notes may still be appended.
- Only Open or Rejected requests may be removed; removal is an archive/soft-delete so the record remains auditable.

## Development

Requirements: Node.js 20.9 or newer and a PostgreSQL database.

```bash
npm install
cp .env.example .env
# Set DATABASE_URL in .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Then open http://localhost:3000.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Run these checks locally before treating the repository as ready for submission. Database migrations and seed data must be applied to the configured PostgreSQL instance first.

## Assessment status

The repository is being implemented in milestones. Each milestone should be reviewed and run locally before proceeding. Do not treat a GitHub file write as proof that the app compiles or tests pass.
