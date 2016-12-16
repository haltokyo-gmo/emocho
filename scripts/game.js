import $ from "jquery";
import palette from "google-material-color";

import * as config from "./config";
import {EMOTION_API_KEY} from "./secret";
import {displayError} from "./error";
import {getStream, fetchImage} from "./video";
import share from "./share";


// 操作対象のDOM
const page = document.querySelector("#page-game");
const elCountdown = document.querySelector("#game-countdown");
const elGame = document.querySelector("#game");
const countdownCircle = document.querySelector("#game-countdown circle");
const countdownText = document.querySelector("#game-countdown-text");
const scoreGraph = document.querySelector("#game-graph line");
const gameCountdown = document.querySelector("#game-timer-text");
const gameScoreText = document.querySelector("#game-score-text");

// 最新のスコアと画像
var score = 0;
var image;

// タイマー変数とカウントダウン用のカウンター
var timer = null;
var cnt = 3;

// 計測対象の感情 (freeはフリーモード)
var targetEmotion = "free";

// フリーモード時で最大の感情
var maxEmotion = "";

// 計測で最大スコアのときのスコアと画像
var maxMoment = {
	score: 0,
	image: null
};

// 動画保存
var stream = getStream();
var recorder;
var video = [];
var videoURL = "";


export default function game(target) {
	page.classList.add("active");
	elCountdown.classList.add("active");
	elGame.classList.remove("active");
	score = 0;
	image = null;
	cnt = 3;
	targetEmotion = target || "free";
	maxMoment.score = 0;
	maxMoment.image = null;
	scoreGraph.setAttribute("style", "");
	recorder = null;
	video = [];
	videoURL = "";

	clearInterval(timer);
	timer = setInterval(countdown, 1000);
}

function next() {
	recorder.stop();

	page.classList.remove("active");
	scoreGraph.setAttribute("style", "");

	share(video, videoURL);
}

// 開始前カウントダウン
function countdown() {
	if(cnt > 0) {
		countdownCircle.classList.add("active");
		countdownText.innerText = cnt;
		cnt--;
	} else {
		countdownText.innerText = 0;

		countdownCircle.classList.remove("active");
		elCountdown.classList.remove("active");
		elGame.classList.add("active");
		cnt = 7 * (1000 / config.interval);

		clearInterval(timer);
		timer = setInterval(measure, config.interval);

		beginRecord();
	}
}

// 計測中
function measure() {
	if(cnt > 0) {
		gameCountdown.innerText = Math.floor(cnt / (1000 / config.interval));

		updateScore();

		// 最大スコアが更新されたら、画像を差し替える
		if(score > maxMoment.score) {
			maxMoment.score = score;
			maxMoment.image = image;
		}

		// グラフの数値を更新する
		gameScoreText.innerText = Math.floor(score * 100);

		scoreGraph.style.strokeDasharray = score * 100 + " 100";
		const r = score * 255;
		const g = score * 255 / 2;
		const b = score > 0.5 ? 0 : (-2 * score + 1) * 255;
		scoreGraph.style.stroke = "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";

		// cnt--;
	} else {
		clearInterval(timer);

		next();
	}
}

// 感情スコアをアップデートする
function updateScore() {
	image = fetchImage();

	$.ajax({
		cache: false,
		contentType: "application/octet-stream",
		data: image,
		dataType: "json",
		headers: {
			"Ocp-Apim-Subscription-Key": EMOTION_API_KEY
		},
		method: "POST",
		processData: false,
		url: "https://api.projectoxford.ai/emotion/v1.0/recognize"
	})
	.done((data) => {
		if(data.length > 0) {
			var sum = 0;
			for(var i in data) {
				if(targetEmotion === "free") {
					sum += getMaxEmotion(data[i].scores);
				} else {
					sum += data[i].scores[targetEmotion];
				}
			}
			score = sum / data.length;
		}
	})
	.fail((err) => {
		displayError("通信エラー");
		console.error(err);
	});
}

// フリーモード時に最大の感情を返す
function getMaxEmotion(scores) {
	return Math.max(
		scores.anger,
		scores.contempt,
		scores.disgust,
		scores.fear,
		scores.happiness,
		scores.neutral,
		scores.sadness,
		scores.surprise
	);
}

// 動画保存開始
function beginRecord() {
	recorder = new MediaRecorder(stream, {
		videoBitsPerSecond: 512 * 1024, // 512kbps
		mimeType: "video/mp4"
	});

	recorder.onstop = (e) => {
		var blob = new Blob(video, {"type": "video/mp4"});
		video = [];
		videoURL = URL.createObjectURL(blob);

		recorder.onstop = null;
		recorder.ondataavailable = null;
	}

	recorder.ondataavailable = (e) => {
		video.push(e.data);
	}

	recorder.start();
}
