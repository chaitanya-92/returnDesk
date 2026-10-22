# ReturnDesk

A returns management workspace built with Next.js, TypeScript, and PostgreSQL.

**Live Demo:** [https://returndesk-nine.vercel.app/](https://returndesk-nine.vercel.app/)\
**Source Code:** [https://github.com/chaitanya-92/returnDesk](https://github.com/chaitanya-92/returnDesk)

## Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL database

### 1. Clone the repository
```
git clone https://github.com/chaitanya-92/returnDesk.git
cd returnDesk
npm install
```

### 2. Configure environment variables

Create your local environment file:
```
cp .env.example .env
```

Update `.env` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/returndesk?sslmode=require"
```

Replace the placeholders with your actual database credentials. Adjust the connection options if your database provider requires it.

Never commit your actual `.env` file or database credentials.

### 3. Set up the database

Generate the Prisma client and apply the existing database migrations:
```
npx prisma generate
npx prisma migrate deploy
```

### 4. Load sample data
```
npm run db:seed
```

This runs the Prisma seed script to populate the database with sample return requests, notes, and activity events.

### 5. Run the application
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application requires a working PostgreSQL connection to load and manage requests.

## Overview

ReturnDesk is a returns operations tool for a small online store. It gives support agents a place to review return requests, check customer and order details, decide how a request should be resolved, and keep track of activity throughout the process.

The main focus is request management and enforcing workflow rules on the server, rather than relying on the UI alone.

## Features

### Dashboard

- Request counts grouped by status.
- Breakdown of return reasons.
- Recent requests and pending reviews.
- Resolution metrics and activity insights.
- Loading, error, and refresh states.

### Request management

- Create return requests with customer, order, item, quantity, and reason details.
- Automatically generate unique request references.
- View request details, notes, and activity history.
- Edit eligible requests.
- Add internal notes without overwriting previous notes.
- Archive eligible requests while retaining their database records.

### Search and filtering

- Search customer details, order information, item details, descriptions, and request references.
- Filter by status, reason, resolution, and creation date.
- Sort by supported fields and direction.
- Server-side pagination.
- Debounced search to avoid sending a request on every keystroke.
- Preserve list filters and pagination in the URL.

### Request workflow

The intended workflow is:

`Open → In Review → Approved → Completed`

A request can also be rejected from In Review. Rejected and completed requests are terminal states.

The server validates transitions, requires a resolution for approval, and checks refund amounts. Request details are locked after a decision, while notes can still be added.

## Tech Stack

| Technology             | Usage                   |
| ---------------------- | ----------------------- |
| Next.js App Router     | Application and routing |
| React 19               | Frontend                |
| TypeScript             | Type safety             |
| Tailwind CSS           | Styling                 |
| Node.js                | Server-side logic       |
| Next.js Route Handlers | REST API                |
| PostgreSQL             | Persistent data storage |
| Prisma ORM             | Database access         |
| Yup                    | Input validation        |
| Vitest                 | Testing                 |

## Project Structure
```
returnDesk/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── requests/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   └── requests/
│   └── lib/
├── .env.example
├── package.json
└── README.md
```

The application separates UI components, API routes, validation schemas, and business logic. Request-related functionality lives under `src/features/requests`, while dashboard functionality is maintained separately.

## API Endpoints

| Method   | Endpoint                       | Description                 |
| -------- | ------------------------------ | --------------------------- |
| `GET`    | `/api/health`                  | Check database connectivity |
| `GET`    | `/api/dashboard`               | Fetch dashboard metrics     |
| `GET`    | `/api/requests`                | List and filter requests    |
| `POST`   | `/api/requests`                | Create a request            |
| `GET`    | `/api/requests/:id`            | Fetch request details       |
| `PATCH`  | `/api/requests/:id`            | Update request details      |
| `DELETE` | `/api/requests/:id`            | Archive a request           |
| `POST`   | `/api/requests/:id/transition` | Change request status       |
| `POST`   | `/api/requests/:id/notes`      | Add an internal note        |

Successful API responses use a `data` wrapper. Errors return a message and machine-readable code, along with an appropriate HTTP status.

## Implementation Decisions

### PostgreSQL and Prisma

PostgreSQL provides persistent storage, while Prisma handles database queries and transactions.

The data model separates return requests, internal notes, and request events. This keeps request information distinct from the activity recorded against it.

### Server-side search and pagination

Search, filters, sorting, and pagination are applied in the database query. The API returns the current page along with pagination metadata, rather than requiring the browser to load every record.

### Business logic on the server

Request transitions, approval requirements, refund validation, editing restrictions, and archiving rules are checked by the backend. The frontend controls which actions are presented, but it is not the only layer enforcing those rules.

### Archiving

Removing an eligible request sets its archive timestamp instead of deleting it permanently. Archived requests are excluded from the normal list and detail queries, while their records remain in the database.

### Request history

Notes and system events are stored separately. This makes it possible to review internal comments and changes made during a request's lifecycle.

## Available Scripts

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start the development server |
| `npm run build`       | Build the application        |
| `npm run start`       | Start the production server  |
| `npm run lint`        | Run ESLint                   |
| `npm run typecheck`   | Run TypeScript checks        |
| `npm test`            | Run Vitest tests             |
| `npm run test:watch`  | Run tests in watch mode      |
| `npm run db:generate` | Generate the Prisma client   |
| `npm run db:migrate`  | Run development migrations   |
| `npm run db:seed`     | Populate sample data         |

## Deployment

The application is deployed on Vercel.

**Live application:** [https://returndesk-nine.vercel.app/](https://returndesk-nine.vercel.app/)

The database must be configured separately through the deployment environment. Set `DATABASE_URL` to the production PostgreSQL connection string and apply migrations before using the application.

The health endpoint is available at:
```
https://returndesk-nine.vercel.app/api/health
```

A successful response indicates that the application can connect to the database.

## Improvements to Consider

Some areas that could be strengthened further include:

- More automated tests for business-rule violations and concurrent requests.
- Additional database-level protections for active-request uniqueness.
- Authentication and role-based permissions before using the application in a real support team.

## Time Spent

Approximately **17 hours** on the assessment.
