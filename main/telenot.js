const hexToBinary = require('hex-to-binary');
const utilFunc = require('../util/common');
const config = require('./../config/config');

const MELDEBEREICHE = config.Telenot.Meldebereiche;
const MELGEGRUPPEN = config.Telenot.Meldegruppen;

module.exports = class Telenot {
  constructor(logger, mqttHandler) {
    this.logger = logger;
    this.mqttClient = mqttHandler.mqttClient;
    return this;
  }

  decodeMeldebereiche(hexStr) {
    const telenotHexStr = hexStr.substr(56, 2) + hexStr.substr(54, 2) + hexStr.substr(52, 2);
    const telenotBinary = utilFunc.reverseANumber(hexToBinary(telenotHexStr));
    this.logger.debug(`Meldebereiche${telenotBinary}`);

    for (let index = 0; index < telenotBinary.length; index += 1) {
      const element = telenotBinary[index];
      if (MELDEBEREICHE[index].value !== element && MELDEBEREICHE[index].name !== '') {
        // save new values
        this.logger.debug(`New Value: ${telenotBinary}`);
        MELDEBEREICHE[index].value = element;
        if (this.mqttClient.connected) {
          this.mqttClient.publish(MELDEBEREICHE[index].topic, utilFunc.mapBinaryValue(MELDEBEREICHE[index].value));
          this.logger.verbose(`Publish change for Meldebereich: ${MELDEBEREICHE[index].name} value: ${utilFunc.mapBinaryValue(MELDEBEREICHE[index].value)}`);
        } else {
          this.logger.debug(`Cant publish state as Mqtt not connected: ${MELDEBEREICHE[index].topic}`);
        }
      }
    }
    this.logger.debug(`Meldebereiche ${telenotBinary}`);
  }

  decodeMeldegruppen(hexStr) {
    this.logger.debug(`HEX ${hexStr.substr(22, 8)}`);
    const telenotHexStr = hexStr.substr(26, 2) + hexStr.substr(24, 2);
    const telenotBinary = utilFunc.reverseANumber(hexToBinary(telenotHexStr));
    this.logger.debug(`Meldegruupe ${telenotBinary}`);

    for (let index = 0; index < telenotBinary.length; index += 1) {
      const element = telenotBinary[index];
      if (MELGEGRUPPEN[index].value !== element && MELGEGRUPPEN[index].name !== '') {
        // save new values
        MELGEGRUPPEN[index].value = element;
        if (this.mqttClient.connected) {
          this.mqttClient.publish(MELGEGRUPPEN[index].topic, utilFunc.mapBinaryValue(MELGEGRUPPEN[index].value));
          this.logger.verbose(`Publish change for Meldegruppe: ${MELGEGRUPPEN[index].name} value: ${utilFunc.mapBinaryValue(MELGEGRUPPEN[index].value)}`);
        } else {
          this.logger.debug(`Cant publish state as Mqtt not connected: ${MELGEGRUPPEN[index].topic}`);
        }
      }
    }

    this.logger.debug(`Meldegruppen ${telenotBinary}`);
  }
};
