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

export CAOS_DASHBOARD_RELEASE_VERSION=$(ci-tools/git-semver.sh)

if [ -z "${CAOS_DASHBOARD_RELEASE_VERSION}" ] ; then
    die "CAOS_DASHBOARD_RELEASE_VERSION not set."
fi

RELEASES_DIR=${CI_PROJECT_DIR}/releases
if [ ! -d "${RELEASES_DIR}" ] ; then
    say_yellow  "Creating releases directory"
    mkdir ${RELEASES_DIR}
fi

if [ "${DO_PROD_BUILD}" == true ] ; then
    say_yellow "Building production release"
    ng build --verbose --target=production
else
    say_yellow "Building release"
    ng build --verbose
fi

say_yellow  "Creating release file"
tar cvfz ${RELEASES_DIR}/caos_dashboard-${CAOS_DASHBOARD_RELEASE_VERSION}.tar.gz -C dist .
