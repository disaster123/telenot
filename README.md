# TELENOT_NODEJS
Program to read the states for several contacts from a Telenot alarm system using the GMS-Protcol.
To recognize the data there is a REGEG pattern for different firmwares. For 25.56 it's for *Meldebreiche* `/^(.*)6846466873023a24000500020(.*?)16$/` and for *Meldegruppen* `/^683e3e6873023224(.*?)16$/`. Lately I updated to Firmware 33.68 where the REGEG string has changed for *Meldebreiche* `/^(.*)6860606873025424000500020(.*?)16$/` and for *Meldegruppen* `/^689393687302872400000001(.*?)16$/`.

## Updates
- 2018-12-26: added [Homie convention implementation](https://homieiot.github.io/) to detect the mqtt-topics automatically by [openhab using add-on](https://www.openhab.org/addons/bindings/mqtt.generic/)
- 2019-02-15: 
-- adjust source code to eslint and airbnb style guide; 
-- Changed REGEG for firmware 33.68.
-- added new branch for homie and converted master into plain mqtt
- 2019-03-24:
-- added docker-compose.yaml file. You can now start the container (including the build process) using `docker-compose up -d --build` which makes setup easier. For setting up the env-variables, create a `.env` file and add the parameters.

## Idea
As the Telenot KNX Gateway is quite expensive, I started research for another solution. Some people already got a solution working for Loxone, which I took as a reference. Then I started to implement a solution in Python which was working but caused high CPU usage running as a docker container (see python branch). So I decided to implement it in Javascript using node.js. This is my first Javascript project so it might not follow best practices. I'm welcome for tips / best-practices.

## Run
You can either run the program using your local node.js version or run it using docker. For Docker you need to build the docker image using
```docker build -t michelmu/telenot-nodejs .```
afterwards you can start the container using
```docker run --name telenot-nodejs --restart=always -d michelmu/telenot-nodejs```
You can pass some config variables also as environment variables:

|PARAMETER       | Description                             |
|----------------|-----------------------------------------|
|MQTTHOST        | name or ip for the mqtt broker          |
|MQTTPORT        | port for the mqtt broker                |
|TELNETHOST      | name or ip for the socket adapter       |
|TELNETPORT      | port for the socket adapter             |
|LOG_LEVEL       | Posible log levels are ["error", "warn", "info", "verbose", "debug", "silly"] |

This will result in:
```
docker run --name telenot-nodejs \
  --restart=always \
  -d \
  -e MQTTHOST="mqtt://host.name" \
  -e MQTTPORT="1883" \
  -e TELNETHOST="192.168.1.22" \
  -e TELNETPORT="1234" \
  michelmu/telenot-nodejs
```

## Hardware
To get the serial data to the ethernet bus I use the following converter: USR-TCP232-302 Tiny - RS232 to Ethernet TCP-IP-Server-Modul (ordered at Amazon). In my program I can connect to this module using a socket connection and get the data.

## To-Do's
- setup Mocha as Test Framework