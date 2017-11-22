#!/usr/bin/env bash

################################################################################
#
# caos-dashboard - CAOS dashboard
#
# Copyright © 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
#
# Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
#
################################################################################

set -e

source ${CI_PROJECT_DIR}/ci-tools/common.sh

export_version_vars

docker_login

say_yellow  "Pulling docker container"
docker pull ${CAOS_DASHBOARD_DOCKER_IMAGE_TAG}

say_yellow  "Running docker container"
docker run -d --name caos-dashboard-test \
       -e CAOS_DASHBOARD_BASE_NAME=some-base-name \
       ${CAOS_DASHBOARD_DOCKER_IMAGE_TAG}
caos_dashboard_ip=$(docker inspect caos-dashboard-test --format '{{ .NetworkSettings.IPAddress }}')

sleep 10

docker logs caos-dashboard-test

say_yellow  "Running tests"
docker run --rm \
       -v "$PWD":/test \
       -w /test \
       alpine:3.6 /bin/sh -c "apk add --no-cache curl && curl -v -L http://${caos_dashboard_ip}:80/some-base-name"

say_yellow  "Cleanup"
docker rm -f caos-dashboard-test
