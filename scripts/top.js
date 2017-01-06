import $ from "jquery";
import palette from "google-material-color";

import * as config from "./config";
import {FACE_API_KEY} from "./secret";
import {displayError} from "./error";
import {fetchImage} from "./video";
import tutorial from "./tutorial";


// 操作対象のDOM
const video = document.querySelector("#video");
const page = document.querySelector("#page-top");
const heading = document.querySelector("#page-top h1");
const display = document.querySelector("#top-display");
const text = document.querySelector("#top-text");
const circle = document.querySelector("#top-svg circle");

// 最新の笑顔スコア
var score = -1;

// タイマー変数と、計測開始のしきい値カウンター
var timer = null;
var cnt = 0;


// トップ画面の初期化処理
export default function top() {
	page.classList.add("active");
	heading.classList.add("active");
	display.classList.remove("active");
	text.classList.remove("hidden");
	circle.classList.remove("finish");

	clearInterval(timer);
	timer = setInterval(nonMeasure, config.interval);
}

// トップ画面の片付け＆チュートリアル画面の初期化
function next() {
	clearInterval(timer);

	// 笑顔スタートアニメーション
	text.classList.add("hidden");
	circle.setAttribute("style", "");
	circle.classList.add("finish");

	circle.addEventListener("transitionend", nextFunc);
}

function nextFunc() {
	circle.removeEventListener("transitionend", nextFunc);
	page.classList.remove("active");
	tutorial();
}

// 計測前
function nonMeasure() {
	updateScore();

	if(score !== -1) {
		cnt++;
		if(cnt > config.threshold) {
			heading.classList.remove("active");
			display.classList.add("active");

			cnt = 0;
			clearInterval(timer);
			timer = setInterval(measure, config.interval);
		}
	}
}

// 計測中
function measure() {
	updateScore();

	if(score === -1) {
		cnt++;
		if(cnt > config.threshold) {
			heading.classList.add("active");
			display.classList.remove("active");

			cnt = 0;
			clearInterval(timer);
			timer = setInterval(nonMeasure, config.interval);
		}
		return;
	}

	if(score > 0.9) {
		next();
		return;
	}

	circle.style.strokeDasharray = getCircumference() * score + " 500";
	if(score > 0.6) {
		circle.style.stroke = palette.get("Orange");
	} else if(score > 0.4) {
		circle.style.stroke = palette.get("Green");
	} else if(score > 0.2) {
		circle.style.stroke = palette.get("Blue");
	} else {
		circle.style.stroke = palette.get("White");
	}
}

// stroke-dasharrayの設定のため、circleオブジェクトの円周を計算する
function getCircumference() {
	const r = circle.getAttribute("r");
	return 2 * r * Math.PI;
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
		if(data.length > 0) {
			var sum = 0;
			for(var i in data) {
				sum += data[i].faceAttributes.smile;
			}
			score = sum / data.length;
		} else {
			score = -1;
		}
	})
	.fail((err) => {
		displayError("通信エラー");
		console.error(err);
	});
}
