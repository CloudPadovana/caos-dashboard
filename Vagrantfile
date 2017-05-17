#!/usr/bin/env ruby
# encoding: utf-8

######################################################################
#
# caos-dashboard - CAOS dashboard
#
# Copyright © 2016, 2017 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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
######################################################################

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.hostname = "caos-dashboard"
  config.ssh.username = "vagrant"
  config.ssh.password = "vagrant"

  config.vm.provider :docker do |d|
    d.has_ssh = true

    d.build_dir = "./docker"
    d.build_args = [ "-t", "caos-dashboard" ]

    d.ports = [
      # static HTTP server
      '3333:3333',

      # WebSocket for live reload
      '35729:35729'
    ]
  end
end
