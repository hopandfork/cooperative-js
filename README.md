# CooperativeJS #
This simple project allows to connect Web Browsers running apps using the *client* and the NodeJS *server* based on WebSocket protocol. 
In the *examples* directory you can find a simple distributed Wordcount application.

# Requirements #
**nodejs** >= *v6.12.0* and **npm** >= *3.10.10*.

# Usage #
From inside the *client* project execute `npm install` and later `npm run build`.

Now from the *server* project you have to execute `npm install` and `npm start`.

To run the example applications go inside the *examples* directory and execute `npm install` and `npm start` for the desired appliation.

# Development #
If the client is modified execute `npm run build` and remove the old version from *server* and *examples* erasing *./node_modules/client*.
