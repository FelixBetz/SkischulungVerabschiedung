# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Database

### Setup Environment Variables

Before using the database, you need to create a `.env` file in the project root with the database configuration:

1. **Copy the example file:**

   ```sh
   cp .env.example .env
   ```

2. **Or create manually:**

   Create a `.env` file in the project root with:

   ```env
   DATABASE_URL=sqlite:database.db
   ```

### Database Commands

```sh
# Push schema changes to database
npm run db:push

# Open database GUI (Drizzle Studio)
npm run db:studio

# Add test teams to database (clears existing data)
npm run db:add-test-data
```

# ideas

- Listen sortiern:
  - Featuers
    - oben und Begirffe wie sortiert wird: z.B.: jung und alt
    - falsche Begriffer unterjubeln
  - Listideen
    - Zeltlagerthemen
    - Gießkannenträger
