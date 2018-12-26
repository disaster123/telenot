var _ = require('lodash');
var HomieProperty = require('./homieProperty');
var EventEmitter = require('events').EventEmitter;

var HomieNode = module.exports = function(homieDevice, name, type, friendlyName) {

  var t = this;
  t.props = {};
  t.name = name;
  t.type = type;
  t.friendlyName = friendlyName;
  t.homieDevice = homieDevice;
  t.mqttTopic = t.homieDevice.mqttTopic + '/' + t.name;

}

require('util').inherits(HomieNode, EventEmitter);
var proto = HomieNode.prototype;
proto.advertise = 
/**
 * 
 * @param {string} propName - Property Id
 * @param {string} friendlyName - Name Attribute
 * @param {string} datatype - integer, float, boolean, string, enum, color
 * @param {string} format - No for $datatype string,integer,float,boolean. Yes for enum,color
 * @param {string} unit - Recommended: °C Degree Celsius; °F Degree Fahrenheit; ° Degree; L Liter; gal Galon; V Volts; W Watt
 *                        A Ampere; % Percent; m Meter; ft Feet; Pa Pascal; psi PSI; # Count or Amount
 */
  function(propName, friendlyName, dataType, format, unit) {
  var t = this;
  return t.props[propName] = new HomieProperty(t, propName, friendlyName, dataType, format, unit);
}

proto.advertiseRange = function(propName, start, end) {
  var t = this;
  var prop = t.props[propName] = new HomieProperty(t, propName);
  prop.setRange(start, end);
  return prop;
}

// Called on mqtt client connect
proto.onConnect = function() {
  var t = this;
  var mqttClient = t.homieDevice.mqttClient;

  // Announce properties to MQTT
  mqttClient.publish(t.mqttTopic + '/$type', t.type, {retain:true});
  mqttClient.publish(t.mqttTopic + '/$name', t.friendlyName, {retain:true});
  var ads = [];
  _.each(t.props, function(prop){
    var adMsg = prop.name;
    if (prop.rangeStart !== null) {
      adMsg += '[' + prop.rangeStart + '-' + prop.rangeEnd + ']';
    }
    if (prop.setter) {
      adMsg += ':settable'
    }
    ads.push(adMsg);
    prop.publishHomieAttributes()
    // advertise properties 
    //publishHomieAttributes
  })
  mqttClient.publish(t.mqttTopic + '/$properties', ads.join(','), {retain:true});

  t.emit('connect');
}

// Called on mqtt client disconnect
proto.onDisconnect = function() {
  var t = this;
  t.emit('disconnect');
}

// Called on every stats interval
proto.onStatsInterval = function() {
  var t = this;
  t.emit('stats-interval');
}

// This name isn't very good (should be getProperty), but it matches the esp8266 homie implementation
proto.setProperty = proto.getProperty = function(propName) {
  var t = this;
  return t.props[propName];
}
