# EMOCHO

EMOCHO(えもっちょ)


## 使い方

`make`参照

```bash
git clone https://github.com/haltokyo-gmo/emocho.git
cd emocho
make deps
make build
make run
```
開発時は`make watch`が便利です。


## 必要なもの

- npm


## ディレクトリ構造

```
emocho
|- public (サーバのルートディレクトリ)
|  |- css (Sassがコンパイルされてここに入る)
|  |- img
|  |- js (Babelがコンパイルされてここに入る)
|  |- index.html
|- scripts (スクリプトファイル)
|  |- *.js
|- styles (Sassファイル)
|  |- *.scss
|- server.js (Expressサーバ)
```
