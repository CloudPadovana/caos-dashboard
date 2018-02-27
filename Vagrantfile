#!/usr/bin/env ruby
# encoding: utf-8

######################################################################
#
# caos-dashboard - CAOS dashboard
#
# Copyright © 2016, 2017, 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
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
  config.vm.define "caos-dashboard", primary: true do |dashboard|
    dashboard.vm.hostname = "caos-dashboard"
    dashboard.ssh.username = "vagrant"
    dashboard.ssh.password = "vagrant"

    dashboard.vm.provider :docker do |d|
      d.name = "caos-dashboard"
      d.has_ssh = true
      d.build_dir = "."
      d.dockerfile = "Dockerfile.vagrant"
      d.build_args = [ "-t", "vagrant-caos-dashboard" ]
      d.create_args = [ ]

      d.ports = [
        # ng serve
        '4200:4200',
      ]
    end

    $script = <<~SCRIPT
      curl -sS https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - && \
        echo "deb https://deb.nodesource.com/node_8.x jessie main" > /etc/apt/sources.list.d/nodesource.list

      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
        echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list

      DEBIAN_FRONTEND=noninteractive apt-get update && \
        apt-get install -y nodejs yarn

      yarn --network-concurrency 1 global add @angular/cli
    SCRIPT

    dashboard.vm.provision :shell, privileged: true, inline: $script

    $script = <<~SCRIPT
      ng set --global packageManager=yarn
    SCRIPT

    dashboard.vm.provision :shell, privileged: false, inline: $script
  end
end
