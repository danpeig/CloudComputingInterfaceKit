const express = require('express');
const app = express();
const port = 3000;
const appName = "Cloud Computing Interface Kit Backend";
const appVersion = "1.0.0";
let compute = require('./compute/compute').compute;

app.use(function(req, res, next) { //Headers to allow running both server and client loically
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.json()); //Load the JSON parser middleware
app.use('/static', express.static('static')); //Static files and resources directory

//Default root route
app.get('/', function (req, res) {
    res.send(appName + " v" + appVersion)
  });

//Template route
app.get('/template', function (req, res) {
  res.send(compute.template);
});

//Compute route
app.post('/compute', function (req, res) {
  compute.input = req.body;
  compute.compute();
  res.json(compute.output);
});

//Start the app
app.listen(port, () => console.log(`CCIK backend listening on port ${port}!`));
