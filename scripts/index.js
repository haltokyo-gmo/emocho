import $ from 'jquery';

$(function() {
	var stream;
	var canvasTop;

	var elVideo = document.getElementById('video');

	// カメラ映像取得
	navigator.mediaDevices.getUserMedia({
		video: {
			mandatory: {
				maxWidth:  640,
				maxHeight: 360
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
})
