import $ from 'jquery';
import createjs from 'EaselJS';

const width  = 640;
const height = 360;

$(function() {
	var stream;
	var canvasTop;

	var elVideo = document.getElementById('video');

	var canvas = document.querySelectorAll('canvas');
	for(var i=0; i<canvas.length; i++) {
		canvas.item(i).width  = width;
		canvas.item(i).height = height;
	}

	// カメラ映像取得
	navigator.mediaDevices.getUserMedia({
		video: {
			mandatory: {
				maxWidth:  width,
				maxHeight: height
			}
		},
		audio: false
	})
	.then(function(s) {
		stream = s;

		elVideo.src = URL.createObjectURL(stream);
		elVideo.play();
	})
	.catch(function(err) {
		console.error(err);
	})

	var stgTop = new createjs.Stage('top');
	var circle = new createjs.Shape();
	circle.graphics.beginFill('red').drawCircle(0, 0, 50);
	circle.x = 50;
	circle.y = 50;
	stgTop.addChild(circle);
	stgTop.update();
})
