import mqtt from 'mqtt';
import gpio from 'pi-gpio';
import config from '../config';

function processMessage(topic, message) {
  if (topic == config.ANUBIS_NODE_TOPIC) {
    try {
      const payload = JSON.parse(message);
      const state = payload.state;

      if ((state == 0) || (state == 1)) {
        gpio.write(config.ANUBIS_GPIO_PIN, state, (err) => {
          if (err) {
            console.error('Failed to set GPIO');
            return;
          }

          console.log('GPIO set to: ' + state);
        });
      }
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
  });

  client.on('message', (topic, message) => {
    processMessage(topic.toString(), message.toString());
  });
}

function openGPIO() {
  gpio.open(config.ANUBIS_GPIO_PIN, 'output', (err) => {
    if (err) {
      console.error(err);
      return;
    }

    openMQTTConnection();
  });
}

openGPIO();
