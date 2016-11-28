import $ from 'jquery';

import * as config from './config';
import * as secret from './secret';
import error from './error';

import demo from './demo';

var stream;
export function getSteam() {
	return stream;
}

var score;
export function getScore() {
	return score;
}

export default function init() {
	// カメラ映像取得
	navigator.mediaDevices.getUserMedia({
		video: {
			width:  config.width,
			height: config.height
		},
		audio: false
	})
	.then(function(s) {
		stream = s;

		var elVideo = document.querySelector('#video');
		elVideo.src = URL.createObjectURL(stream);
		elVideo.play();
	})
	.catch(function(err) {
		error('カメラの取得に失敗しちゃいました');
		console.error(err);
	})

	// demo
	demo();
}

export function updateScore(emotions) {

}

export function drawRectangles() {
	var canvas = document.querySelector('#canvas-video');
	var ctx = canvas.getContext('2d');
	ctx.drawImage(document.querySelector('#video'), 0, 0, 1280, 720);

	var base64 = canvas.toDataURL('image/jpeg');
	var bin = atob(base64.replace(/^.*,/, ''));
	var buffer = new Uint8Array(bin.length);
	for (var i = 0; i < bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}

	$.ajax({
		cache: false,
		contentType: 'application/octet-stream',
		data: buffer.buffer,
		dataType: 'json',
		headers: {
			'Ocp-Apim-Subscription-Key': secret.EMOTION_API_KEY
		},
		method: 'POST',
		processData: false,
		url: 'https://api.projectoxford.ai/emotion/v1.0/recognize'
	})
	.done(function(data) {
		console.log(data);

		var canvas_overlay = document.querySelector('#top');
		var ctx_overlay = canvas_overlay.getContext('2d');

		ctx_overlay.font = 'normal 400 14px sans-serif';

		ctx_overlay.beginPath();
		ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);

		for(var i in data) {
			var rect = data[i].faceRectangle;
			var text = maxEmotion(data[i].scores);

			ctx_overlay.strokeStyle = 'red';
			ctx_overlay.strokeRect(config.width - rect.left - rect.width, rect.top, rect.width, rect.height);
			var m = ctx_overlay.measureText(text);
			ctx_overlay.fillStyle = 'white';
			ctx_overlay.fillRect(config.width - rect.left - rect.width, rect.top - 14, m.width, 14);
			ctx_overlay.fillStyle = 'red';
			ctx_overlay.fillText(text, config.width - rect.left - rect.width, rect.top);
		}

		ctx_overlay.closePath();
	})
	.fail(function(err) {
		console.error(err);

		var canvas_overlay = document.querySelector('#top');
		var ctx_overlay = canvas_overlay.getContext('2d');

		ctx_overlay.font = 'normal 400 14px sans-serif';
		var m = ctx_overlay.measureText(err.statusText);

		ctx_overlay.beginPath();
		ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);
		ctx_overlay.fillStyle = 'black';
		ctx_overlay.fillRect((config.width - m.width) / 2, 500, m.width, 14);
		ctx_overlay.fillStyle = 'red';
		ctx_overlay.fillText(err.statusText, (config.width - m.width) / 2, 514);
		ctx_overlay.closePath();
	})
}

export function clearRectangles() {
	var canvas_overlay = document.querySelector('#top');
	var ctx_overlay = canvas_overlay.getContext('2d');

	ctx_overlay.beginPath();
	ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);
	ctx_overlay.closePath();
}

function maxEmotion(scores) {
	var max = Math.max(
		scores.anger,
		scores.contempt,
		scores.disgust,
		scores.fear,
		scores.happiness,
		scores.neutral,
		scores.sadness,
		scores.surprise
	);

	switch(max) {
	case scores.anger:
		return '怒り ' + scores.anger.toFixed(4);
	case scores.contempt:
		return '軽蔑 ' + scores.contempt.toFixed(4);
	case scores.disgust:
		return '嫌悪 ' + scores.disgust.toFixed(4);
	case scores.fear:
		return '恐れ ' + scores.fear.toFixed(4);
	case scores.happiness:
		return '幸せ ' + scores.happiness.toFixed(4);
	case scores.neutral:
		return '普通 ' + scores.neutral.toFixed(4);
	case scores.sadness:
		return '悲しみ ' + scores.sadness.toFixed(4);
	case scores.surprise:
		return '驚き ' + scores.surprise.toFixed(4);
	default:
		return 'なし';
	}
}
