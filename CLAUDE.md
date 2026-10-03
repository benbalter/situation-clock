# CLAUDE.md

LED-style situation room clock for iPads, published with GitHub Pages. See [README.md](README.md) for usage and clock configuration.

## Commands

Run these before pushing. They match what [build.yml](.github/workflows/build.yml) runs:

```sh
npm test        # type-check (tsc --noEmit)
npm run lint    # eslint
npm run build   # vite bundle + eleventy, output in _site/
```

`script/bootstrap` installs dependencies and `script/server` serves a live-reloading copy at localhost:8080.

## Deploying

- The default branch is `gh-pages`, and pushing to it is a production deploy. Pages builds from the branch on every push, and [build.yml](.github/workflows/build.yml) also deploys `_site/` after test, lint and build pass. Its `paths` filter skips docs-only pushes, but those still publish through the branch build.
- So run the checks above, then push or merge only when the owner says to. Opening a pull request against `gh-pages` is safe; it builds but doesn't deploy.

## Generated files

- `assets/script.js` is bundled from [src/script.ts](src/script.ts) and is gitignored. Edit the TypeScript.
- `_site/` is build output. Clocks live in the front matter of [index.html](index.html).
