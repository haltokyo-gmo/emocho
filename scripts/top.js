import $ from 'jquery';
// import easelJS from 'EaselJS';

import * as config from './config';
import {FACE_API_KEY} from './secret';
import {canvasError} from './error';
import {fetchImage} from './video';

import tutorial from './tutorial';


var video = document.querySelector('#video');
var canvas = document.querySelector('#top');
var ctx = canvas.getContext('2d');
var timer = null;

export default function top() {
	canvas.classList.add('active');

	timer = setInterval(() => {
		update();
	}, config.interval)
}

function next() {
	canvas.classList.remove('active');
	clearInterval(timer);
	timer = null;

	tutorial();
}

function update() {
	$.ajax({
		cache: false,
		contentType: 'application/octet-stream',
		data: fetchImage(),
		dataType: 'json',
		headers: {
			'Ocp-Apim-Subscription-Key': FACE_API_KEY
		},
		method: 'POST',
		processData: false,
		url: 'https://api.projectoxford.ai/face/v1.0/detect?returnFaceAttributes=smile'
	})
	.done((data) => {
		var score = calcSmile(data);

		ctx.beginPath();
		ctx.clearRect(0, 0, config.width, config.height);

		ctx.font = 'normal 600 16px sans-serif';
		ctx.textBaseline = 'top';
		ctx.shadowColor = '#fff';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		ctx.shadowBlur = 5;
		ctx.fillStyle = '#333';

		var text = '笑顔でスタート！';
		var m = ctx.measureText(text);
		ctx.fillText(text, (config.width - m.width) / 2, (config.height - 16) / 2 - 10);

		text = (score * 100).toFixed(0);
		m = ctx.measureText(text);
		ctx.fillText(text, (config.width - m.width) / 2, (config.height - 16) / 2 + 10);

		ctx.closePath();

		if(score > 0.9) {
			next();
		}
	})
	.fail((err) => {
		canvasError(canvas, 'エラー');
		console.error(err);
	})
}

function calcSmile(data) {
	var sum = 0;
	for(var i in data) {
		sum += data[i].faceAttributes.smile;
	}
	return sum / data.length;
}
