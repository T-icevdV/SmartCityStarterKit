In Eindhoven DITSS developed, with partners like Atos and the State Advocate Pels Rijcken, the Smart City StarterK!t. Its purpose is to contribute to developing an innovation platform to improve the safety and security of systems and people in tomorrow’s Smart City.  

<strong>About the kit</strong><br />
Our Smart City StarterK!t contains both non-technological instruments as well as technological solutions. Non-technological instruments are policies that municipalities can use to smooth the transition in their city; think of Open Data Principles to address ownership of publicly created data or an IoT Charter to help hardware suppliers cooperate on the equipment they install in the city.

<strong>Fiware</strong><br />
The technology part is the translation of 5 years of application and software development into a FIWARE implementation. FIWARE is an initiative of the European Commission to facilitate Smart City developments with Open Source software and a shared reference architecture (a common framework). Using the StarterK!t enables cities to skip man-years of Living Lab research and man-months on FIWARE software development.

== Non technological documentation ==
<strong>Smart City Starter Kit v.1.0</strong>
* [http://scsk.all.atostechlab.net/files/documentation/Smart%20City%20StarterK!t%20aanbiedingsbrief.pdf Smart City StarterK!t aanbiedingsbrief.pdf]
* [http://scsk.all.atostechlab.net/files/documentation/Smart%20City%20StarterK!t%20introduction%20letter.pdf Smart City StarterK!t introduction letter.pdf]
* Policy Instruments
** [http://scsk.all.atostechlab.net/files/documentation/Policy%20Instruments/A%5D%20Report%20Spotlight%20on%20Smart%20City%20Eindhoven.pdf A Report Spotlight on Smart City Eindhoven.pdf]
** [http://scsk.all.atostechlab.net/files/documentation/Policy%20Instruments/B%5D%20Open%20Data%20Principes%20Eindhoven%20Dutch.pdf B Open Data Principes Eindhoven Dutch.pdf]
** [http://scsk.all.atostechlab.net/files/documentation/Policy%20Instruments/C%5D%20Smart%20Society%20IoT%20charter%20Eindhoven.pdf C Smart Society IoT charter Eindhoven.pdf]
** [http://scsk.all.atostechlab.net/files/documentation/Policy%20Instruments/D%5D%20Digitale%20stad%20%2D%20Brief%20wethouders%20Ollongren%20en%20Depla%20Dutch.pdf D Digitale stad - Brief wethouders Ollongren en Depla Dutch.pdf]

== Technological documentation ==
<strong>Installation script (beta)</strong><br />
The installation script has been tested on the following systems:
* Ubuntu 17.10 64bit
* Ubuntu 18.04 64bit
Keep in mind that at least 8GB free RAM and an active internet connection are required.

=== Ubuntu ===
Please download the Shell installation script (setup.sh) using:
 $ wget http://atos.pdkwebs.nl/projects/scsk/version/1.0/setup_ubuntu.sh
Or if you want demo data to be already present, please use instead:
 $ wget http://atos.pdkwebs.nl/projects/scsk/version/1.0/setup_ubuntu_demo.sh


=== Ubuntu ===
After uploading the file, please change file permissions using:
 $ chmod 755 setup.sh
Then execute the file using:
 $ sudo ./setup.sh

The Smart City Starter Kit uses Docker containers for each of the components. The following Fiware components will be installed:
* [https://fiware-orion.readthedocs.io/en/master/ Orion]
* [https://quantumleap.readthedocs.io/ QuantumLeap]
* [https://crate.io/docs/ CrateDB]
* [https://grafana.com/ Grafana]

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

== Contact us ==
[http://scsk.all.atostechlab.net/index.php/Special:Contact Contact us]
