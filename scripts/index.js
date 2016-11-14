import * as config from './config';
import video from './page-video';
import timeline from './page-timeline';

(function() {
	document.querySelectorAll('canvas').forEach((canvas) => {
		if(canvas instanceof HTMLElement) {
			canvas.width = config.width;
			canvas.height = config.height;
		}
	})

	video();
	timeline();
})()
