# Caos Dashboard

## How to start development

  1. Setup VM with `vagrant up && vagrant ssh` (requires docker)
  2. Install dependencies with `yarn`
  3. Run with `gulp dev`

Now you can visit [`localhost:3333`](http://localhost:3333) from your browser.

## How to build for production
rm -rf dist/ output/
vagrant@caos-dashboard:/vagrant$ gulp prod build
