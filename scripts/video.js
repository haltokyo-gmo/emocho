import $ from "jquery";

import * as config from "./config";
import * as secret from "./secret";
import {pageError, canvasError} from "./error";

var stream;
export function getSteam() {
	return stream;
}

var score;
export function getScore() {
	return score;
}

export default function initVideo() {
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

		var elVideo = document.querySelector("#video");
		elVideo.src = URL.createObjectURL(stream);
		elVideo.play();
	})
	.catch(function(err) {
		pageError("カメラの取得に失敗しちゃいました");
		console.error(err);
	})
}

function updateScore(emotions) {

}


var video = document.querySelector("#video");
var canvas = document.querySelector("#canvas-video");
var ctx = canvas.getContext("2d");

// 映像から静止画を取得する
export function fetchImage() {
	ctx.drawImage(video, 0, 0, config.width, config.height);

	var data = canvas.toDataURL("image/jpeg");
	var bin = atob(data.replace(/^.*,/, ""));
	var buffer = new Uint8Array(bin.length);
	for(var i=0; i<bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}

	return buffer.buffer;
}

export function drawRectangles(canvas, ctx) {
	$.ajax({
		cache: false,
		contentType: "application/octet-stream",
		data: fetchImage(),
		dataType: "json",
		headers: {
			"Ocp-Apim-Subscription-Key": secret.EMOTION_API_KEY
		},
		method: "POST",
		processData: false,
		url: "https://api.projectoxford.ai/emotion/v1.0/recognize"
	})
	.done(function(data) {
		ctx.font = "normal 400 14px sans-serif";

		ctx.beginPath();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for(var i in data) {
			var rect = data[i].faceRectangle;
			var text = maxEmotion(data[i].scores);

			ctx.strokeStyle = "red";
			ctx.strokeRect(config.width - rect.left - rect.width, rect.top, rect.width, rect.height);
			var m = ctx.measureText(text);
			ctx.fillStyle = "white";
			ctx.fillRect(config.width - rect.left - rect.width, rect.top - 14, m.width, 14);
			ctx.fillStyle = "red";
			ctx.fillText(text, config.width - rect.left - rect.width, rect.top);
		}

		ctx.closePath();
	})
	.fail(function(err) {
		canvasError(canvas, err.responseText);
		console.error(err);
	})
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
		return "怒り " + scores.anger.toFixed(4);
	case scores.contempt:
		return "軽蔑 " + scores.contempt.toFixed(4);
	case scores.disgust:
		return "嫌悪 " + scores.disgust.toFixed(4);
	case scores.fear:
		return "恐れ " + scores.fear.toFixed(4);
	case scores.happiness:
		return "幸せ " + scores.happiness.toFixed(4);
	case scores.neutral:
		return "普通 " + scores.neutral.toFixed(4);
	case scores.sadness:
		return "悲しみ " + scores.sadness.toFixed(4);
	case scores.surprise:
		return "驚き " + scores.surprise.toFixed(4);
	default:
		return "なし";
	}
}
