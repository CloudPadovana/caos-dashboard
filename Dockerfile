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

FROM nginx:1.13

LABEL maintainer "Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>"

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY env.js.template /

ARG RELEASE_FILE
ADD $RELEASE_FILE /caos-dashboard

ENV LANG=C.UTF-8

ENV CAOS_DASHBOARD_TSDB_HOST=localhost
ENV CAOS_DASHBOARD_TSDB_PORT=4000
ENV CAOS_DASHBOARD_BASE=/

CMD [ "/bin/bash", "-c", "envsubst < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && envsubst < /env.js.template > /caos-dashboard/js/env.js && nginx -g 'daemon off;'" ]
