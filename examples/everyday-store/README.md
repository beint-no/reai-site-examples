# everyday-store

Generic ReAI commerce design using the shared starter.

```sh
npm run demo -- everyday-store
# Connect to a real test Site instead:
cp examples/everyday-store/.dev.vars.example examples/everyday-store/.dev.vars
# Set a server-side credential in the ignored file.
npm run dev -- everyday-store
```

The explicit offline demo uses synthetic fixtures and rejects checkout. The
normal Worker requires ReAI configuration, reads actual published catalog data
and can start hosted checkout. It never falls back to demo data.

Customize `theme.css`; shared rendering and editorial copy live in `starter/src`.
Use `npm run export -- everyday-store /absolute/path/to/new-private-repo` to create a
standalone client source tree. Review and replace policy copy before launch.
