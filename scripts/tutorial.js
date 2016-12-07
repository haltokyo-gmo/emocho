import * as config from "./config";
import {drawRectangles} from "./video";

var canvas = document.querySelector("#tutorial");
var ctx = canvas.getContext("2d");

export default function tutorial() {
	canvas.classList.add("active");

	setInterval(() => {
		drawRectangles(canvas, ctx);
	}, config.interval);
}
