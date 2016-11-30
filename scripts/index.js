import * as config from './config';
import initVideo from './page-video';
import top from './top';

(function() {
	var canvas = document.querySelectorAll('canvas');
	for(var i=0; i<canvas.length; i++) {
		canvas.item(i).width = config.width;
		canvas.item(i).height = config.height;
	}

	// var sendImage = document.querySelector('#canvas-video');
	// sendImage.width = config.imgWidth;
	// sendImage.height = config.imgHeight;

	initVideo();
	// top();
})()
