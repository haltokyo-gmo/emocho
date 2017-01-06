import $ from "jquery";
import palette from "google-material-color";

import * as config from "../config";
import {FACE_API_KEY, EMOTION_API_KEY} from "../secret";
import {displayError} from "../error";
import {getStream, fetchImage} from "../video";

const DOM_BEFORE = document.querySelector("#game-countdown");
const DOM_GAME = document.querySelector("#game");
const CANVAS_EFFECT = document.querySelector("#game-effect");
const CANVAS_GRAPH = document.querySelector("#game-graph");
const CANVAS_RECORD = document.querySelector("#game-record");
const VIDEO = document.querySelector("#video");

export default class Game {
	constructor(emotion, nextFunc) {
		// this bind
		this.render = this.render.bind(this);
		this.beforeStart = this.beforeStart.bind(this);
		this.updateScore = this.updateScore.bind(this);

		// DOM
		this.beforeDOM = DOM_BEFORE;
		this.gameDOM = DOM_GAME;
		this.beforeCircle = this.beforeDOM.querySelector("circle");
		this.beforeText = this.beforeDOM.querySelector("p");
		this.gameText = this.gameDOM.querySelector("p");

		CANVAS_EFFECT.width = config.width;
		CANVAS_EFFECT.height = config.height;
		CANVAS_GRAPH.width = config.width;
		CANVAS_GRAPH.height = config.graphHeight;

		// 計測対象の感情
		this.emotion = emotion || "free";

		// CreateJSのインスタンス
		this.gameStage = new createjs.Stage(CANVAS_EFFECT.id);
		this.scoreStage = new createjs.Stage(CANVAS_GRAPH.id);

		// スコア最大時の画像を保存するためのオブジェクト
		this.maxMoment = {
			score: 0,
			image: null
		};

		// 録画用のCanvas
		this.recorderCanvas = CANVAS_RECORD;
		this.recorderCanvas.width = config.recordWidth;
		this.recorderCanvas.height = config.recordHeight;
		this.recorderCtx = this.recorderCanvas.getContext("2d");

		// 録画するやつ
		this.stream = this.recorderCanvas.captureStream(config.recordFPS);
		this.recorder = new MediaRecorder(this.stream, {
			videoBitsPerSecond: 512 * 1024, // 512kbps
			mimeType: "video/webm"
		});
		this.videoChunks = [];

		// 録画終了
		this.recorder.onstop = () => {
			var blob = new Blob(this.videoChunks, {"type": "video/webm"});
			this.recordURL = URL.createObjectURL(blob);

			nextFunc(this.maxMoment.image, blob, this.recordURL);
		};

		this.recorder.ondataavailable = (e) => {
			this.videoChunks.push(e.data);
		};

		// ゲーム中の動画
		this.video = null;

		// スコア表示のグラフ
		this.scoreBg = new ScoreBackground(config.graphHeight, this.scoreStage);
		this.totalScoreGraph = new TotalScoreCircle(config.width / 2, 0.9, this.scoreStage);
		this.scoreGraph = [];

		// スコア
		this.totalScore = 0;
		this.scores = [];

		// タイマー (開始前、ゲーム)
		this.timer = null;
		this.durationStart = 3;
		this.durationGame = 7;

		// 開始前処理
		this.count = this.durationStart;
		this.timer = setInterval(this.beforeStart, 1000);
	}

	// お掃除
	release() {
		createjs.Ticker.removeEventListener("tick", this.render);

	}

	// 開始前のカウントダウン
	beforeStart() {
		// カウントが開始前ならカウントダウン
		if(this.count > 0) {
			this.beforeCircle.classList.add("active");
			this.beforeText.innerText = this.count;
			this.count--;
			return;
		}

		this.startGame();
	}

	// ゲーム開始
	startGame() {
		// 開始前の表示を消して、ゲーム画面を表示する
		this.beforeText.innerText = 0;
		this.beforeCircle.classList.remove("active");
		this.beforeDOM.classList.remove("active");
		this.gameDOM.classList.add("active");

		// スコアの更新回数
		this.count = this.durationGame * (1000 / config.interval);

		// 描画処理
		this.initGraph();
		createjs.Ticker.addEventListener("tick", this.render);

		// スコア更新処理
		clearInterval(this.timer);
		this.timer = setInterval(this.updateScore, config.interval);

		// 録画開始
		this.recorder.start();
	}

	// スコア表示グラフの初期化
	initGraph() {
		// 使ってない
	}

	// グラフが増えた
	addGraph() {
		const leftEdge = config.width / 2 - (this.scoreGraph.length + 1) * config.graphHeight / 2;

		for(var i in this.scoreGraph) {
			this.scoreGraph[i].moveTo(leftEdge + config.graphHeight * (i + 1));
		}
		this.totalScoreGraph.moveTo(config.width - leftEdge);

		this.scoreGraph.push(new ScoreCircle(leftEdge, 0.8, this.scoreStage));

		this.scoreBg.resize((this.scoreGraph.length + 1) * config.graphHeight);
	}

	// スコア表示のグラフ更新
	updateGraph() {
		this.totalScoreGraph.updateScore(this.totalScore);

		var inc = this.scores.length - this.scoreGraph.length;
		for(; inc > 0; inc--) {
			this.addGraph();
		}

		for(var i in this.scores) {
			this.scoreGraph[i].updateScore(this.scores[i]);
		}
	}

	// フレーム処理
	render() {
		this.gameStage.update();
		this.scoreStage.update();

		this.recorderCtx.drawImage(VIDEO, 0, 0, this.recorderCanvas.width, this.recorderCanvas.height);
		this.recorderCtx.drawImage(CANVAS_GRAPH, 0, 290, this.recorderCanvas.width, 50);
		// this.recorderCtx.drawImage(CANVAS_EFFECT, 0, 0, this.recorderCanvas.width, this.recorderCanvas.height);
	}

	// スコア更新
	updateScore() {
		// カウントダウン終わったらゲーム終了
		if(this.count <= 0) {
			this.recorder.stop();
			clearInterval(this.timer);
			return;
		}

		// カウントダウン表示を更新
		this.gameText.innerText = Math.floor(this.count / (1000 / config.interval));

		// 映像から最新の画像を取得
		var image = fetchImage();

		// 計測してスコア更新
		this._measureEmotions(image);

		// スコアが最高になったときの画像を保存する
		if(this.totalScore > this.maxMoment.score) {
			this.maxMoment.score = this.totalScore;

			const canvas = document.querySelector("#canvas-video");
			const ctx = canvas.getContext("2d");
			ctx.drawImage(VIDEO, 0, 0, config.imgWidth, config.imgHeight);
			this.maxMoment.image = canvas.toDataURL("image/jpeg");
		}

		// グラフを更新する
		this.updateGraph();

		this.count--;
	}

	// 計測対象の顔識別
	_detectFaces(image) {
		// TODO
		// Face APIの顔識別機能を使って、個人ごとにスコアを出す
	}

	// 感情値の測定
	_measureEmotions(image) {
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
					// TODO: 顔識別に対応する
					if(this.emotion === "free") {
						this.scores[i] = this.getMaxEmotion(data[i].scores);
					} else {
						this.scores[i] = data[i].scores[this.emotion];
					}
				}
				// 配列の中身の合計を配列の要素数で割る
				this.totalScore = this.scores.reduce((a, b) => a + b) / this.scores.length;
			}
		})
		.fail((err) => {
			displayError("通信エラー");
			console.error(err);
		});
	}

	// フリーモード時に最大の感情を返す
	getMaxEmotion(scores) {
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
}

class Shape {
	constructor() {
		this.graphics = new createjs.Graphics();
		this.graphics.append(createjs.Graphics.beginCmd);
	}
}

class ScoreBackground extends Shape {
	constructor(width, stage) {
		super();

		this.rect = new createjs.Graphics.Rect((config.width - width) / 2, 0, width, config.graphHeight);
		this.graphics.append(this.rect);
		this.graphics.append(new createjs.Graphics.Fill(palette.get("Black", "Secondary")));

		this.shape = new createjs.Shape(this.graphics);
		this.shape.shadow = new createjs.Shadow(palette.get("Black", "Dividers"), 0, 1, 4);

		stage.addChild(this.shape);
	}

	resize(width) {
		createjs.Tween.get(this.rect, {override: true})
			.to({x: (config.width - width) / 2, w: width}, 250, createjs.Ease.quadOut);
	}
}

class ScoreCircle {
	constructor(cx, scale, stage) {
		this.text = new createjs.Text("000.0", "18px sans-serif", palette.get("White"));
		this.text.textAlign = "center";
		this.text.textBaseline = "middle";
		this.text.x = config.graphHeight / 2;
		this.text.y = config.graphHeight / 2;

		this.outer = new OuterCircle();
		this.inner = new InnerCircle();

		// this.text.setTransform(0, 0, scale, scale, 0, 0, 0, config.graphHeight / 2, config.graphHeight / 2);
		this.outer.shape.setTransform(0, 0, scale, scale, 0, 0, 0, config.graphHeight / 2, config.graphHeight / 2);
		this.inner.shape.setTransform(0, 0, scale, scale, 0, 0, 0, config.graphHeight / 2, config.graphHeight / 2);
		this.inner.shape.mask.setTransform(0, 0, scale, scale, 0, 0, 0, config.graphHeight / 2, config.graphHeight / 2);

		this.appearTo(cx);

		stage.addChild(this.outer.shape);
		stage.addChild(this.inner.shape);
		stage.addChild(this.text);
	}

	updateScore(score) {
		// 000.0の形式
		this.text.text = ("00" + (score * 100).toFixed(1)).slice(-5);

		createjs.Tween.get(this.inner.shape)
			.to({y: config.graphHeight * (1 - score)}, config.interval, createjs.Ease.cubicOut);
	}

	// アニメーション無し移動
	appearTo(cx) {
		this.outer.appearTo(cx);
		this.inner.appearTo(cx);
		this.text.x = cx;
	}

	// 移動アニメーション
	moveTo(cx) {
		this.outer.moveTo(cx);
		this.inner.moveTo(cx);

		createjs.Tween.get(this.text, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
	}
}

class TotalScoreCircle extends ScoreCircle {
	constructor(cx, scale, stage) {
		super(cx, scale, stage);

		this.text.font = "bold 24px sans-serif";

		this.label = new createjs.Text("TOTAL", "12px sans-serif", palette.get("White"));
		this.label.textAlign = "center";
		this.label.x = config.graphHeight / 2;
		this.label.y = config.graphHeight / 4;

		// this.label.setTransform(0, 0, scale, scale, 0, 0, 0, config.graphHeight / 2, config.graphHeight / 2);

		this.appearTo(cx);

		stage.addChild(this.label);
	}

	// 出現アニメーション
	appearTo(cx) {
		this.outer.appearTo(cx);
		this.inner.appearTo(cx);
		this.text.x = cx;

		if(this.label) {
			this.label.x = cx;
		}
	}

	// 移動アニメーション
	moveTo(cx) {
		this.outer.moveTo(cx);
		this.inner.moveTo(cx);

		createjs.Tween.get(this.text, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
		createjs.Tween.get(this.label, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
	}
}

class OuterCircle extends Shape {
	constructor() {
		super();

		this.graphics.append(new createjs.Graphics.Circle(config.graphHeight / 2, config.graphHeight / 2, config.graphHeight / 2));
		this.graphics.append(new createjs.Graphics.StrokeStyle(2));
		this.graphics.append(new createjs.Graphics.Stroke(palette.get("White")));

		this.shape = new createjs.Shape(this.graphics);
	}

	appearTo(cx) {
		this.shape.x = cx;
		this.shape.y = config.graphHeight / 2;
	}

	moveTo(cx) {
		createjs.Tween.get(this.shape, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
	}
}

class InnerCircle extends Shape {
	constructor() {
		super();

		this.rect = new createjs.Graphics.Rect(0, config.graphHeight / 2, config.graphHeight, config.graphHeight * 1.2);
		this.fill = new createjs.Graphics.Fill(palette.get("Light Blue"));

		this.graphics.append(this.rect);
		this.graphics.append(this.fill);

		this.shape = new createjs.Shape(this.graphics);
		this.shape.mask = new createjs.Shape(new createjs.Graphics().beginFill("black").drawCircle(config.graphHeight / 2, config.graphHeight / 2, config.graphHeight / 2 - 2));
	}

	appearTo(cx) {
		this.shape.x = cx;
		this.shape.y = config.graphHeight / 2;
		this.shape.mask.x = this.shape.x;
		this.shape.mask.y = this.shape.y;
	}

	moveTo(cx) {
		createjs.Tween.get(this.shape, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
		createjs.Tween.get(this.shape.mask, {override: true})
			.to({x: cx}, 250, createjs.Ease.quadOut);
	}
}
