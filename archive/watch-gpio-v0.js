// Program to sense if there is power supply from the grid at any given time,
// using Raspberry Pi's GPIO-17 pin.

// A 12VDC relay is conneected to a grid-powered outlet that will fail in case of power disruption.
// A 3.3V pin (physical Pin #1 on Raspi) is connected to GPIO-17 through the NC contact of this relay.

// When grid power is available, relay will be active and GPIO-17 will be LOW.
// When grid power fails, relay will be inactive and GPIO-17 will be HIGH.

const Gpio = require('onoff').Gpio;  // Import the onoff library
const fs = require('fs');

const inputPin = new Gpio(17, 'in', 'both', {debounceTimeout: 500});  // Set GPIO pin 17 as input, watch for both rising and falling edges
const filename = 'power-failure.txt'

let state = inputPin.readSync();
const text = {"0": "KSEB Power ACTIVE", "1": "KSEB Power FAILURE"}

const updateFile = (message) => {
  fs.appendFileSync (`${filename}`, message, function (err) {
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

console.log(`Initial GPIO status: ${state}, ${text[state]} (${customDate()}) @app re-start`)
updateFile(`\n${customDate()} ${text[state]} @app re-start\n`)

// Function that is triggered when the GPIO pin value changes
const pinChangeHandler = (err, value) => {
  if (err) {
    console.error('There was an error:', err);
    return;
  }
  state = value
  console.log(`>> ${customDate()} ${text[state]}`);
  updateFile(`${customDate()} ${text[state]}\n`)
};

// Set up the watch method to monitor pin changes
inputPin.watch(pinChangeHandler);

// Clean up when the program exits
process.on('SIGINT', () => {
  inputPin.unexport();  // Release the pin
  console.log('Exiting...');
  process.exit();
});
