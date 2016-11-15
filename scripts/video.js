import * as config from './config';
import error from './error';


var stream;
export function getVideo() {
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

		setInterval(() => {
			hoge();
		}, config.interval);
	})
	.catch(function(err) {
		error('カメラの取得に失敗しちゃいました');
		console.error(err);
	})
}

function updateScore(emotions) {

}

function hoge() {
	var ctx = document.querySelector('#canvas-video').getContext('2d');
	ctx.drawImage(document.querySelector('#video'), 0, 0, 1280, 720);

	return;

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
			'Ocp-Apim-Subscription-Key': '2816742d8e244768b8c9ed243c365696'
			// 'Ocp-Apim-Subscription-Key': 'subscription_key_here'
		},
		method: 'POST',
		processData: false,
		url: 'https://api.projectoxford.ai/emotion/v1.0/recognize'
	})
	.done(function(data) {
		var canvas_overlay = document.querySelector('#canvas-overlay');
		var ctx_overlay = canvas_overlay.getContext('2d');
		ctx_overlay.clearRect(0, 0, canvas_overlay.width, canvas_overlay.height);

		for(var i in data) {
			var rect = data[i].faceRectangle;
			var text = MaxEmotion(data[i].scores);

			ctx_overlay.beginPath();
			ctx_overlay.strokeRect(rect.left, rect.top, rect.width, rect.height);
			ctx_overlay.fillStyle = 'black';
			var m = ctx_overlay.measureText(text);
			ctx_overlay.fillRect(rect.left, rect.top - 10, m.width, 10);
			ctx_overlay.fillStyle = 'white';
			ctx_overlay.fillText(text, rect.left, rect.top);
			ctx_overlay.closePath();
		}
	})
	.fail(function(error) {
		console.log(error);
	})
}
