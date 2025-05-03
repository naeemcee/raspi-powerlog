// Program to sense if there is power supply from the grid at any given time,
// using Raspberry Pi's GPIO-17 pin.

// A 12VDC relay is conneected to a grid-powered outlet that will fail in case of power disruption.
// A 3.3V pin (physical Pin #1 on Raspi) is connected to GPIO-17 through the NC contact of this relay.

// When grid power is available, relay will be active and GPIO-17 will be LOW.
// When grid power fails, relay will be inactive and GPIO-17 will be HIGH.

const Gpio = require('onoff').Gpio;  // Import the onoff library
const fs = require('fs');

const inputPin = new Gpio(17, 'in', 'both', {debounceTimeout: 500});  // Set GPIO pin 17 as input, watch for both rising and falling edges
const filename = '/home/pi/projects/raspi-gpio/powerstatus.txt'

let state = inputPin.readSync();
const text = {"0": "Power RESTORED", "1": "Power FAILURE "}

const updateFile = (event) => {
  fs.appendFileSync (`${filename}`, `${customDate()} ${event}\n`, function (err) {
    if(err) {
      console.log(`!error: ${err} writing to file ${filename}`)
      throw err;
    }
  })
}

const customDate = () => {
  return new Date().toLocaleString('null', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: 'numeric', minute: 'numeric'
  });
};

console.log(`App re-start GPIO state: ${state}, ${text[state]} (at ${customDate()})`)
updateFile(`App re-started. Status: ${text[state]}`);

// Function that is triggered when the GPIO pin value changes
const pinChangeHandler = (err, value) => {
  if (err) {
    console.error('There was an error:', err);
    return;
  }

  if (value == state) return;  // reject false trigger

  state = value
  console.log(`${customDate()} ${text[state]}`);
  updateFile(`${text[state]}`);

};

// Set up the watch method to monitor pin changes
inputPin.watch(pinChangeHandler);

// Clean up when the program exits
process.on('SIGINT', () => {
  inputPin.unexport();  // Release the pin
  console.log('Exiting...');
  process.exit();
});
