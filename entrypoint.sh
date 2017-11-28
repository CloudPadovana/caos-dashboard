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

if [ -z "${CAOS_DASHBOARD_BASE_NAME}" ] ; then
    export CAOS_DASHBOARD_BASE_TSDB_API="/api"
else
    export CAOS_DASHBOARD_BASE_TSDB_API="/${CAOS_DASHBOARD_BASE_NAME}/api"
fi

# generate /etc/nginx/nginx.conf
echo "Generating /etc/nginx/nginx.conf"
envsubst '\${CAOS_DASHBOARD_TSDB_HOST} \${CAOS_DASHBOARD_TSDB_PORT} \${CAOS_DASHBOARD_BASE_NAME} \${CAOS_DASHBOARD_BASE_TSDB_API}' < /nginx.conf.template > /etc/nginx/nginx.conf
echo "OK"

# generate /caos-dashboard/js/env.js
echo "Generating /caos-dashboard/js/env.js"
envsubst '\${CAOS_DASHBOARD_BASE_TSDB_API}' < /env.js.template > /caos-dashboard/env.js
echo "OK"

# rewrite base href
if [ ! -z "${CAOS_DASHBOARD_BASE_NAME}" ] ; then
    echo "Rewriting base href in /caos-dashboard/index.html..."
    sed -i "s|<base href=\"/\">|<base href=\"/${CAOS_DASHBOARD_BASE_NAME}/\">|" /caos-dashboard/index.html
    echo "OK"
fi

# start nginx
echo "Starting nginx"
nginx -g 'daemon off;'
