var express = require('express');
var cors = require('cors');
var app = express();

// CORSを許可する
app.use(cors());

app.use(express.static('public'));

app.listen(5555, function() {
	console.log('server listeing on port 5555');
})
