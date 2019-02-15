const mqtt = require('mqtt');
const config = require('./../config/config');

module.exports = class MqttHandler {
  constructor(logger) {
    this.logger = logger;
    this.mqttClient = mqtt.connect(config.Connection.mqttConfig.host);

    this.mqttClient.on('connect', () => {
      this.logger.info('MQTT Connected');
    });
    return this;
  }
};
