import * as config from "./config";

export function pageError(message) {
	var pages = document.querySelectorAll("section");
	for(var i=0; i<pages.length; i++) {
		pages.item(i).classList.remove("active");
	}

	var el = document.querySelector("#page-error");
	el.innerText = message;
	el.classList.add("active");
}

export function canvasError(canvas, message) {
	var ctx = canvas.getContext("2d");

	ctx.font = "normal 400 14px sans-serif";
	var m = ctx.measureText(message);

	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect((config.width - m.width) / 2, 500, m.width, 14);
	ctx.fillStyle = "red";
	ctx.fillText(message, (config.width - m.width) / 2, 514);
	ctx.closePath();
}
