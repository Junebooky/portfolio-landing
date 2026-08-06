# Planner Supabase setup

The Planner uses the existing Supabase project with ref
`rvaowhriekibxtcpyalu`.

1. Link the project and apply the migration:

   ```bash
   npx supabase login
   npx supabase link --project-ref rvaowhriekibxtcpyalu
   npx supabase db push
   ```

2. In Supabase Dashboard, open **Settings > API > Exposed schemas** and add
   `planner`. Keep `planner_private` unexposed.

3. Copy `.env.example` to `.env.local` and set
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from the project Connect dialog.

4. In **Authentication > URL Configuration**, add these redirect URLs:

   - `http://localhost:3000/auth/callback`
   - `https://portfolio-landing-chi-six.vercel.app/auth/callback`

The migration allows only the Supabase Auth user whose email is
`gotoward7@gmail.com` to become a Planner member. Other users in the shared
project cannot read or mutate Planner rows.
