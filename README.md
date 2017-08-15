# Caos Dashboard

## How to start development

  1. Setup VM with `vagrant up && vagrant ssh` (requires docker)
  2. Install dependencies with `yarn`
  3. Run with `gulp dev`

Now you can visit [`localhost:3333`](http://localhost:3333) from your browser.

## How to build a release

Releases can be made by using the script `build_release.sh`, which
builds a release for HEAD. It will generate the file
`releases/caos_dashboard-<version>.tar.gz` containing the distribution.

The script `build_docker.sh` generates a minimal docker image to be used
for deployment.

## How to run in production

To run the container:
```
docker run -d -p 8080:80 --name caos-dashboard \
    -e CAOS_DASHBOARD_TSDB_HOST=<caos-tsdb host> \
    -e CAOS_DASHBOARD_TSDB_PORT=<caos-tsdb port> \
    -e CAOS_DASHBOARD_BASE=<base url> \
    caos-dashboard[:<tag>]
```

The container spawns an `nginx` instance, which both serves the
dashboard static files and proxies the caos-tsdb api.
