import $ from "jquery";
import palette from "google-material-color";

import Game from "./assets/Game";

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
const gameCountdown = document.querySelector("#game-timer-text");
const gameGraph = document.querySelector("#game-graph");
const stageGraph = new createjs.Stage("game-graph");

// 最新のスコアと画像
var score = 0;
var scores = [];
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
var recorder;
var video = [];
var videoURL = "";

// CreateJSオブジェクト
var objGraph = {};


export default function game(target) {
	page.classList.add("active");
	elCountdown.classList.add("active");
	elGame.classList.remove("active");

	var game = new Game(target, next);
	return;

	score = 0;
	scores = [];
	image = null;
	cnt = 3;
	targetEmotion = target || "free";
	maxMoment.score = 0;
	maxMoment.image = null;
	recorder = null;
	video = [];
	videoURL = "";

	gameGraph.width = config.width;
	gameGraph.height = config.graphHeight;

	objGraph = {};

	clearInterval(timer);
	timer = setInterval(countdown, 1000);
}

function next(img, video, url) {
	page.classList.remove("active");
	share(img, video, url);
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

		initGraph();
		createjs.Ticker.addEventListener("tick", stageGraph);

		clearInterval(timer);
		timer = setInterval(measure, config.interval);

		beginRecord();
	}
}

// 計測中
function measure() {
	if(cnt > 0) {
		gameCountdown.innerText = Math.floor(cnt / (1000 / config.interval));

		updateScores();

		// 最大スコアが更新されたら、画像を差し替える
		if(score > maxMoment.score) {
			maxMoment.score = score;
			maxMoment.image = image;
		}

		// グラフを更新する
		renderGraph();

		// cnt--;
	} else {
		clearInterval(timer);

		next();
	}
}

// 感情スコアをアップデートする
function updateScores() {
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
			for(var i in data) {
				if(targetEmotion === "free") {
					scores[i] = getMaxEmotion(data[i].scores);
				} else {
					scores[i] = data[i].scores[targetEmotion];
				}
			}
			// 配列の中身の合計を配列の要素数で割る
			score = scores.reduce((a, b) => a + b) / scores.length;

			console.log(score);
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
	recorder = new MediaRecorder(getStream(), {
		videoBitsPerSecond: 512 * 1024, // 512kbps
		mimeType: "video/webm"
	});

	recorder.onstop = (e) => {
		var blob = new Blob(video, {"type": "video/webm"});
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

// グラフ初期化
function initGraph() {
	objGraph = {};
	objGraph.circles = [];

	// グラフの背景矩形
	var gBg = new createjs.Graphics();
	objGraph.bgRect = new createjs.Graphics.Rect(config.width / 2 - 50, 0, 100, config.graphHeight);
	gBg.append(createjs.Graphics.beginCmd);
	gBg.append(objGraph.bgRect);
	gBg.append(new createjs.Graphics.Fill(palette.get("Black", "Dividers")));

	objGraph.bg = new createjs.Shape(gBg);
	objGraph.bg.shadow = new createjs.Shadow(palette.get("Black", "Secondary"), 0, 1, 4);

	// 合計スコアのグラフ
	var gTotal = new createjs.Graphics();
	gTotal.append(createjs.Graphics.beginCmd);
	gTotal.append(new createjs.Graphics.Circle(config.width / 2, config.graphHeight / 2, config.graphHeight / 2 - 10));
	gTotal.append(new createjs.Graphics.StrokeStyle(1));
	gTotal.append(new createjs.Graphics.Stroke(palette.get("White")));

	objGraph.total = {};

	objGraph.total.graph = {
		rect: new createjs.Graphics.Rect(5, config.graphHeight - 5, config.graphHeight - 10, config.graphHeight - 10),
		fill: new createjs.Graphics.Fill(palette.get("Light Blue"))
	};

	var gTotalGraph = new createjs.Graphics();
	gTotalGraph.append(createjs.Graphics.beginCmd);
	gTotalGraph.append(objGraph.total.graph.rect);
	gTotalGraph.append(objGraph.total.graph.fill);

	objGraph.total.graph.shape = new createjs.Shape(gTotalGraph);
	objGraph.total.graph.shape.mask = new createjs.Shape(new createjs.Graphics().beginFill("black").drawCircle(config.graphHeight / 2, config.graphHeight / 2, config.graphHeight / 2 - 11));
	objGraph.total.graph.shape.x = (config.width - config.graphHeight - 10) / 2;
	// objGraph.total.graph.shape.x = (config.width - config.graphHeight - 10) / 2;

	objGraph.total.border = new createjs.Shape(gTotal);

	objGraph.total.label = new createjs.Text("TOTAL", "20px", palette.get("White"));
	objGraph.total.label.x = config.width / 2 - 25;
	objGraph.total.label.y = 25;

	stageGraph.addChild(objGraph.bg);
	stageGraph.addChild(objGraph.total.border);
	stageGraph.addChild(objGraph.total.graph.shape);
	stageGraph.addChild(objGraph.total.label);
}

// グラフ描画
function renderGraph() {
	createjs.Tween.get(objGraph.total.graph.rect, {override: true})
		.to({y: config.graphHeight - 5 - (config.graphHeight - 10) * score}, 500, createjs.Ease.cubicOut);

	if(scores.length !== objGraph.circles.length) {

	}
}
