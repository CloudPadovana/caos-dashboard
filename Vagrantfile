#!/usr/bin/env ruby
# encoding: utf-8

######################################################################
#
# Filename: Vagrantfile
# Created: 2016-07-25T09:10:57+0200
# Time-stamp: <2016-10-03T10:57:53cest>
# Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
#
# Copyright © 2016 by Fabrizio Chiarello
#
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
######################################################################

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.provider "virtualbox" do |v|
    v.memory = 1024
    v.cpus = 2
    v.linked_clone = true
  end

  config.vm.box = "centos/7"

  config.vm.synced_folder ".", "/vagrant", type: "rsync",
                          rsync__exclude: [".git/", "node_modules/", "output/", "dist/"],
                          rsync__auto: true,
                          rsync__verbose: true

  # static HTTP server
  config.vm.network :forwarded_port, guest: 3333, host: 3333

  # WebSocket for live reload
  config.vm.network :forwarded_port, guest: 35729, host: 35729

  config.vm.hostname = "frontend.caos.vagrant.localhost"

  $script = <<SCRIPT
sed -i 's/AcceptEnv/# AcceptEnv/' /etc/ssh/sshd_config
localectl set-locale "LANG=en_US.utf8"
systemctl reload sshd.service

echo "cd /vagrant" >> /home/vagrant/.bash_profile

yum update -v -y
yum install -v -y epel-release git zip

# nodejs & co
yum install -v -y gcc-c++ make
curl --location https://rpm.nodesource.com/setup_6.x | bash -
yum install -v -y nodejs
npm install gulp -g
SCRIPT

  config.vm.provision :shell, :inline => $script
end
