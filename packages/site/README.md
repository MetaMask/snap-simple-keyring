# Simple Snap Keyring Site

This package contains the browser UI used to install and test the Simple Snap
Keyring snap.

## Scripts

`yarn start` runs the Webpack dev server at
[http://localhost:8000](http://localhost:8000).

`yarn build` creates a production build in `dist/`.

## Environment Variables

`SNAP_ORIGIN` defines the snap origin installed by the site. It defaults to
`local:http://localhost:8080`.

`PATH_PREFIX` defines the public asset prefix for static deployments, such as
GitHub Pages subdirectories.
