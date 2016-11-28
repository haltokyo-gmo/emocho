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

	var canvas = document.querySelector('#top');
	canvas.classList.add('active');

	displayDemo('トップ画面');
	var text = ['トップ画面', '笑顔でスタート', 'チュートリアル', 'ルーレット', 'ゲーム', 'シェア'];
	var it = 1;

	var next = document.querySelector('#btn-next');
	next.addEventListener('click', () => {
		next.innerText = '次へ';
		displayDemo(text[it]);
		it++;
		if(it >= text.length) {
			next.innerText = '最初に戻る';
			it = 0;
		}
	})
}

function displayDemo(text) {
	var canvas = document.querySelector('#demo');
	var ctx = canvas.getContext('2d');

	ctx.font = 'normal 400 24px sans-serif';
	var m = ctx.measureText(text);

	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'black';
	ctx.fillRect((config.width - m.width) / 2, 400, m.width + 2, 28);
	ctx.fillStyle = 'white';
	ctx.fillText(text, (config.width - m.width) / 2, 424);
	ctx.closePath();
}
