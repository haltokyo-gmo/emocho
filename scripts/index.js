import * as config from './config';
import video from './page-video';
import timeline from './page-timeline';

(function() {
	var canvas = document.querySelectorAll('canvas');
	for(var i=0; i<canvas.length; i++) {
		canvas.item(i).width = config.width;
		canvas.item(i).height = config.height;
	}

	video();
	timeline();
})()
