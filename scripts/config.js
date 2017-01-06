// canvasの解像度 (画面解像度に合わせる 16:9にする)
export const width = 1280;
export const height = 720;

// APIに投げる画像の解像度
export const imgWidth = 960;
export const imgHeight = 540;

// 録画の品質
export const recordWidth = 640;
export const recordHeight = 360;
export const recordFPS = 24;

// API叩く間隔ミリ秒
export const interval = 1000 / 2;

// トップ画面で計測開始するしきい値(回数)
// この回数だけ顔認識したら「笑顔でスタート」が表示される
export const threshold = 5;

// ゲームのスコア表示のグラフの縦サイズ
export const graphHeight = 100;

// 顔認識するサイズのしきい値
export const minFaceSize = 150;
