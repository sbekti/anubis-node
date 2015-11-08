import mqtt from 'mqtt';
import gpio from 'rpi-gpio';
import config from '../config';

function processMessage(topic, message) {
  if (topic == config.ANUBIS_MQTT_TOPIC) {
    try {
      const payload = JSON.parse(message);
      const state = payload.state == 1 ? true : false;

      gpio.write(config.ANUBIS_GPIO_PIN, state, function(err) {
        if (err) {
          console.error('Failed to set GPIO');
          return;
        }

        console.log('GPIO set to: ' + state);
      });
    } catch (err) {
      console.error(err);
    }
  }
}

function openMQTTConnection() {
  const client = mqtt.connect(config.ANUBIS_MQTT_SERVER, {
    username: config.ANUBIS_MQTT_USERNAME,
    password: config.ANUBIS_MQTT_PASSWORD
  });

  client.on('connect', () => {
    client.subscribe(config.ANUBIS_MQTT_TOPIC);
    console.log('Connected to server');
  });

  client.on('message', (topic, message) => {
    console.log('Got a message from topic: ' + topic.toString());
    console.log(message.toString());
    
    processMessage(topic.toString(), message.toString());
  });
}

function openGPIO() {
  gpio.setup(config.ANUBIS_GPIO_PIN, gpio.DIR_OUT, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    openMQTTConnection();
  });
}

openGPIO();
