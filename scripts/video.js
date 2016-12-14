import $ from "jquery";

import * as config from "./config";
import * as secret from "./secret";
import {pageError} from "./error";


// 操作対象のDOM
const video = document.querySelector("#video");
const canvas = document.querySelector("#canvas-video");
const ctx = canvas.getContext("2d");


var stream;
export function getSteam() {
	return stream;
}


// カメラ初期化
export default function initVideo() {
	navigator.mediaDevices.getUserMedia({
		video: {
			width:  config.width,
			height: config.height
		},
		audio: false
	})
	.then(function(s) {
		stream = s;

		video.src = URL.createObjectURL(stream);
		video.play();
	})
	.catch(function(err) {
		pageError("カメラの取得に失敗しちゃいました");
		console.error(err);
	})
}

// 映像から静止画を取得する
export function fetchImage() {
	ctx.drawImage(video, 0, 0, config.imgWidth, config.imgHeight);

	var data = canvas.toDataURL("image/jpeg");
	var bin = atob(data.replace(/^.*,/, ""));
	var buffer = new Uint8Array(bin.length);
	for(var i=0; i<bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}

	return buffer.buffer;
}
