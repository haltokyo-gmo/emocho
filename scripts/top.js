import $ from 'jquery';
import createjs from 'EaselJS';

import config from './config';


export default function init() {
	// stub

	// example
	console.log('hogehoge');

	var stgTop = new createjs.Stage('top');
	var circle = new createjs.Shape();
	circle.graphics.beginFill('red').drawCircle(0, 0, 50);
	circle.x = 50;
	circle.y = 50;
	stgTop.addChild(circle);
	stgTop.update();
}
