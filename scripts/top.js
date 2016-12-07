import $ from "jquery";

import * as config from "./config";
import {FACE_API_KEY} from "./secret";
import {canvasError} from "./error";
import {fetchImage} from "./video";

import tutorial from "./tutorial";


var video = document.querySelector("#video");
var canvas = document.querySelector("#top");
var stage = new createjs.Stage("top");
var obj = {};
var score = 0;
var timer = null;


// トップ画面の初期化処理
export default function top() {
	canvas.classList.add("active");

	init();

	timer = setInterval(() => {
		updateScore();

		var scoreRadian = score * 2 * config.PI;
		var score255 = score * 255;
		var colorFilter = {
			redMultiplier: 1,
			greenMultiplier: 1,
			blueMultiplier: 1
		}

		createjs.Tween.get(obj["arc"], {override: true})
			.to({endAngle: scoreRadian}, 300, createjs.Ease.bounceInOut);
		createjs.Tween.get(obj["filter"], {override: true})
			.to(colorFilter, 300, createjs.Ease.quadIn);
	}, config.interval)
	createjs.Ticker.addEventListener("tick", () => {
		obj["shape"].cache(-200, -200, 500, 500);
		stage.update();
	});
}

// トップ画面の片付け＆チュートリアル画面の初期化
function next() {
	canvas.classList.remove("active");
	clearInterval(timer);
	timer = null;
	createjs.Ticker.removeEventListener("tick", stage);

	tutorial();
}

// 描画オブジェクトの初期化
function init() {
	var heading = new createjs.Text("笑顔でスタート！", "20px sans-serif", "#fff");
	heading.shadow = new createjs.Shadow("rgba(0,0,0,.87)", 0, 0, 5);
	heading.x = (config.width - heading.getMeasuredWidth()) / 2;
	heading.y = (config.height - heading.getMeasuredHeight()) / 2;
	heading.alpha = 0;

	var graphics = new createjs.Graphics();
	var arc = new createjs.Graphics.Arc(200, 200, 150, 0, 0, 0);
	var strokeStyle = new createjs.Graphics.StrokeStyle(10);
	var stroke = new createjs.Graphics.Stroke("#fff");

	graphics.append(createjs.Graphics.beginCmd);
	graphics.append(arc);
	graphics.append(strokeStyle);
	graphics.append(stroke);

	var shape = new createjs.Shape(graphics);
	shape.regX = shape.regY = 200;
	shape.x = config.width / 2;
	shape.y = config.height / 2;
	shape.rotation = 270;
	shape.scaleY = -1;

	var filter = new createjs.ColorFilter();
	shape.filters = [filter];

	createjs.Tween.get(heading, {loop: true})
		.to({alpha: 1}, 1000, createjs.Ease.quadIn)
		.to({alpha: 0}, 1000, createjs.Ease.quadIn);

	stage.addChild(heading);
	stage.addChild(shape);

	obj["heading"] = heading;
	obj["arc"] = arc;
	obj["strokeStyle"] = strokeStyle;
	obj["shape"] = shape;
	obj["filter"] = filter;
}

// 笑顔スコアをアップデートする
function updateScore() {
	$.ajax({
		cache: false,
		contentType: "application/octet-stream",
		data: fetchImage(),
		dataType: "json",
		headers: {
			"Ocp-Apim-Subscription-Key": FACE_API_KEY
		},
		method: "POST",
		processData: false,
		url: "https://api.projectoxford.ai/face/v1.0/detect?returnFaceAttributes=smile"
	})
	.done((data) => {
		var sum = 0;
		for(var i in data) {
			sum += data[i].faceAttributes.smile;
		}
		score = sum / data.length;
	})
	.fail((err) => {
		canvasError(canvas, "エラー");
		console.error(err);
	})
}
