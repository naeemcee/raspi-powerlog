// Program to sense if there is power supply from the grid at any given time,
// using Raspberry Pi's GPIO-17 pin.

// A 12VDC relay is conneected to a grid-powered outlet that will fail in case of power disruption.
// A 3.3V pin (physical Pin #1 on Raspi) is connected to GPIO-17 through the NC contact of this relay.

// When grid power is available, relay will be active and GPIO-17 will be LOW.
// When grid power fails, relay will be inactive and GPIO-17 will be HIGH.

const fs = require('fs');
const Gpio = require('onoff').Gpio;
const inputPin = new Gpio(17, 'in');  // Set GPIO pin 17 as input

const customDate = () => {
  return new Date().toLocaleString('null', {
    day: '2-digit', month:'2-digit', year: 'numeric',
    hour: 'numeric', minute: 'numeric'
  });
}

const appendToFile = (message) => {
  fs.appendFile('ksebstatus.txt', message, function (err) {
    if (err) throw err;
  });
}

let state = inputPin.readSync();      // Get initial state; 0=PowerON; 1=PowerOFF.
const text = {"0": "KSEB Supply ACTIVE", "1": "KSEB Supply FAILURE!"}

console.log(`Initial GPIO status: ${state}, ${text[state]} (${customDate()})`);
appendToFile(`${customDate()} ${text[state]} @ app restart.\n`);

// Function to read GPIO pin status
const readPinStatus = () => {
  // console.log(`GPIO state: ${state}, ${text[state]}`);
  const status = inputPin.readSync();  // Read pin value (0 or 1)

  if (status !== state) {
    state = status;
    console.log(`GPIO state: ${state}, ${text[state]} (${customDate()})`);
    appendToFile(`${customDate()} ${text[state]}\n`);
  };
};

// Read the GPIO pin status 5 every seconds
setInterval(readPinStatus, 5000);

// Clean up when the program exits
process.on('SIGINT', () => {
  inputPin.unexport();  // Release the pin
  console.log('Exiting...');
  process.exit();
});

