import * as config from './config';
import {drawRectangles, clearRectangles} from './video';

export default function demo() {
	var btn = document.querySelector('#btn-demo');
	var timer = null;

	btn.addEventListener('click', () => {
		if(timer) {
			setTimeout(() => {
				clearRectangles();
			}, 500)
			clearInterval(timer);
			timer = null;
		} else {
			timer = setInterval(() => {
				drawRectangles();
			}, config.interval)
		}
	})
}
