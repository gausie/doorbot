# doorbot
This application essentially reads the unique id from an RFID card, checks it against a database and finally performs a customisable set of "actions" on the results.

It also runs a webserver to administrate the system and view logs.

I use it on a Raspberry Pi (Model B) to open the front door of my house via GPIO, as well as a bunch of cool other stuff.

## Requirements
* [MongoDB](http://mongodb.org)
* [PC/SC lite](http://pcsclite.alioth.debian.org/pcsclite.html)

## My setup
All files in the `/actions` folder are loaded and run once a card is read. The project comes with the ones I use by way of example.

* `gpio.js` - Briefly sends HIGH to a configurable GPIO pin. This is attached to a relay which will run 12V to an [electric door strike](http://en.wikipedia.org/wiki/Electric_strike), allowing the door to be pushed open.
* `beep.js` - Sends some audiovisual feedback to my [ACR122U RFID reader](http://www.acs.com.hk/en/products/3/acr122u-usb-nfc-reader/).
* `json-rpc.js` - Sends a notification to my TV (running [Kodi](http://kodi.tv)) over its JSON-RPC API.
* `log.js` - Writes a line to the Log.
* `notify.js` - Under certain conditions, sends an email to some users about the entry.

