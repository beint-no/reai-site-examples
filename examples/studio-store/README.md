# studio-store

Generic ReAI commerce design using the shared starter.

```sh
npm run demo -- studio-store
# Connect to a real test Site instead:
cp examples/studio-store/.dev.vars.example examples/studio-store/.dev.vars
# Set a server-side credential in the ignored file.
npm run dev -- studio-store
```

The explicit offline demo uses synthetic fixtures and rejects checkout. The
normal Worker requires ReAI configuration, reads actual published catalog data
and can start hosted checkout. It never falls back to demo data.

Customize `theme.css`; shared rendering and editorial copy live in `starter/src`.
Use `npm run export -- studio-store /absolute/path/to/new-private-repo` to create a
standalone client source tree. Review and replace policy copy before launch.
