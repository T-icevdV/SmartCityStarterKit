Installation script (beta)
The installation script has been tested on the following systems:

Ubuntu 17.10 64bit
Ubuntu 18.04 64bit
Keep in mind that at least 8GB free RAM and an active internet connection are required.

Ubuntu
Please download the Shell installation script (setup.sh) using:

$ wget http://atos.pdkwebs.nl/projects/scsk/version/1.0/setup_ubuntu.sh
Or if you want demo data to be already present, please use instead:

$ wget http://atos.pdkwebs.nl/projects/scsk/version/1.0/setup_ubuntu_demo.sh

Ubuntu
After uploading the file, please change file permissions using:

$ chmod 755 setup.sh
Then execute the file using:

$ sudo ./setup.sh
The Smart City Starter Kit uses Docker containers for each of the components. The following Fiware components will be installed:

Orion
QuantumLeap
CrateDB
Grafana
When the installation is finished, please navigate to the installation directory using:

$ cd ~/scsk/v1.0
You can check the status of the Docker containers using:

$ sudo docker-compose ps
It should look like this:

   Name                  Command               State                            Ports
----------------------------------------------------------------------------------------------------------------
db-crate       /docker-entrypoint.sh -Ccl ...   Up      0.0.0.0:4200->4200/tcp, 0.0.0.0:4300->4300/tcp, 5432/tcp
grafana        /run.sh                          Up      0.0.0.0:3003->3000/tcp
iot-mongo      docker-entrypoint.sh mongo ...   Up      0.0.0.0:27017->27017/tcp
orion          /usr/bin/contextBroker -fg ...   Up      0.0.0.0:1026->1026/tcp
quantum-leap   /bin/sh -c python app.py         Up      0.0.0.0:8668->8668/tcp

The new installation has some connections with airboxes in Eindhoven by default. This will help you to understand the purpose of the different Fiware components and to connect your own IOT-devices. A Grafana dashboard is available at http://{HOST-IP}:3003. You can login using the default Grafana credentials (admin/admin). You can navigate to the dashboard to see a map with all the airboxes in Eindhoven, as well as a graph that shows an example of historical airbox data.

If you want to check the connection to the airboxes in Eindhoven, you can run the following to do a manual update:

$ python export_air_quality.py update
A cron job to execute this Python script is scheduled for every 10 minutes. You can view the results of this cron job using:

$ cd /var/mail | ls -l
After installation, your Grafana dashboard should look like this: http://atos.pdkwebs.nl/files/images/scsk_screenshot1.png.

Note that both the implementation configuration guide and the shell installation script are still under development. If you'd like to contribute to the development, please contact us!

Contact us
http://scsk.all.atostechlab.net/index.php/Special:Contact
