import * as config from './config';
import error from './error';


var stream;
export function getVideo() {
	return stream;
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
}
