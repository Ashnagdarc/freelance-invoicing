# Freelance invoicing

An invoicing app for one freelancer. The freelancer writes an invoice,
sends it to a client, and records the money when it arrives. The
client opens the invoice from a link and does not need an account. The
app shows the freelancer what they are owed and how late it is, and
it sends polite reminder emails about late invoices by itself.

## What finished looks like

Anyone can open the app on the internet and:

- create an account and add the clients they bill
- write an invoice whose total anyone can check by hand, to the penny
- issue the invoice and send the client a link that opens it without
  an account
- record each payment as it arrives, including part payments
- fix a mistake with a credit note, instead of changing the invoice
- see what they are owed in total, and how late each amount is
- give a client a statement of everything between them

Late invoices are chased by email on a fixed timetable, with nobody
pressing a button.

Finished means it is live on the internet, not just on your laptop.
Someone you have never met can use it, and the reminder emails still go
out when your laptop is shut.

## The road map

Eight sprints. Each sprint delivers one part of the list above. They
must be done in order, because each one builds on the one before.

| # | Sprint | What it delivers |
|---|---|---|
| 1 | Who you are, and who you bill | The freelancer has an account with the details every invoice needs. Clients are records the freelancer keeps, not accounts |
| 2 | An invoice that adds up | A draft invoice whose total is correct to the penny, with tax and discounts worked out by stated rules |
| 3 | Issued is a promise | Issuing gives the invoice a number and locks it. The client opens it from a link without signing in |
| 4 | Settling and correcting | Payments and credit notes are recorded as separate documents. The invoice itself never changes |
| 5 | What you are owed | One total of what is owed, how late each part is, and a statement for each client that does not change later |
| 6 | Chasing what is late | The freelancer sends one reminder email per client, with the amount still owed |
| 7 | Chasing that runs itself | Reminders go out on a timetable by themselves, and never twice for the same step |
| 8 | Off the laptop | The app is live on the internet, and the reminders are sent from there |

## The hard parts

**An issued invoice never changes.** Once the client has an invoice,
their bookkeeper may have filed it and their finance team may have
planned the payment. So the app has no way to edit an issued invoice.
A mistake is fixed with a credit note. A credit note is a second
document that says which invoice it corrects, by how much, and why.
The original invoice stays exactly as it was sent.

**The totals must be exact.** 7.5 hours at £33.33 an hour is £249.975,
and there is no half penny. The app needs one written rule for
rounding. Tax worked out on each line and tax worked out on the total
can differ by a penny, so the app must pick one method and always use
it. A discount must be shared out across the lines before tax, or the
tax is charged on money the client is not paying. Each of these is a
small piece of code, and each is easy to get wrong by a penny.

**What is owed is worked out, not stored.** The amount still owed on
an invoice is its total, less its payments, less its credit notes. The
app calculates it from those documents every time. It never keeps a
separate running figure that could fall out of step.

**Reminders must not repeat.** A job that runs by itself sometimes
runs twice, for example after a restart. A client must still get each
reminder only once.

## No payment provider needed

Freelancers are usually paid by bank transfer. The freelancer sees the
money in their bank account and records it in the app. So there is no
card payment service, no test keys and no outside service to set up.
The work in this product is the arithmetic and the record of
corrections.

## Working on it

The sprints, their briefs and their tickets are in Blacksmith
Experience. Start with sprint 1. Each sprint opens when the one before
it is finished.

Read the documents attached to a sprint before you start its first
ticket. They explain the choices you will make and the options you are
choosing between.

## What this is built with

The whole product: an API and the screens that use it.

- **Express 5** in **TypeScript** for the API.
- **Prisma** for the models and the migrations, against the schema in `prisma/schema.prisma`.
- **Zod** for validating every request, and **zod-to-openapi** for the OpenAPI schema, served at `/api/schema/` and browsable at `/api/docs/`.
- **JWT** for authentication, in `src/modules/auth`.
- **React** with **Vite** for the dev server and the build.
- **Chakra UI** for components, and **React Router** for routes.
- **TanStack Query** for every call to the API, so caching and refetching are decided in one place.

## Setting it up

You need the CLI once: `npm install -g blacksmith-cli`.

```bash
blacksmith setup     # dependencies, Prisma client, migrations
blacksmith dev       # start it
```

The API answers on `http://localhost:8000`, and the app on `http://localhost:5173`.

Copy `backend/.env.example` to `backend/.env` before the first run. It is ignored by git and holds the JWT secret, the database URL and anything else this project should not carry in its history.

## Where the code lives

```
backend/
├── prisma/
│   └── schema.prisma    # your models, and the migrations they generate
├── src/
│   ├── config/          # environment, OpenAPI, Zod setup
│   ├── db/              # the Prisma client, made once
│   ├── middleware/      # authentication, validation, error handling
│   ├── modules/
│   │   └── auth/        # register, log in, refresh
│   ├── utils/           # errors, pagination, tokens
│   ├── app.ts           # where routes are mounted
│   └── index.ts
├── package.json
└── tsconfig.json

frontend/
└── src/
    ├── api/
    │   ├── generated/   # written by `blacksmith sync` — do not edit
    │   └── hooks/       # your queries and mutations
    ├── pages/           # one folder per page
    ├── features/        # auth, and anything else that spans pages
    ├── router/          # routes and layouts
    ├── shared/          # components and hooks used across pages
    └── styles/
```

## Day to day

| Command | What it does |
| --- | --- |
| `blacksmith dev` | Run it locally. |
| `blacksmith sync` | Regenerate the frontend API types and hooks from the backend schema. Run it after changing a Zod schema or a route. |
| `blacksmith make:resource Post` | Scaffold a Prisma model, Zod schemas, a service, a controller and routes, plus the hooks and pages that use them. |
| `blacksmith backend <command>` | Run an npm script in the backend, e.g. `blacksmith backend run migrate`. |
| `blacksmith frontend <command>` | Run an npm command in the frontend, e.g. `blacksmith frontend install axios`. |
| `blacksmith eject` | Remove Blacksmith and keep a plain Express and React project. Nothing here is a dependency on us. |
