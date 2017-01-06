var express = require('express');
var app = express();

app.use(express.static('public'));

app.listen(5555, function() {
	console.log('server listeing on port 5555');
});
