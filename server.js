
const express = require('express');
const app = express(); 

// search static files in 'static' directories
app.use(express.static('static'));

var port = 1234;

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});
