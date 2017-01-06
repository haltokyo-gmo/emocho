import * as config from "./config";
import initVideo from "./video";
import top from "./top";


var sendImage = document.querySelector("#canvas-video");
sendImage.width = config.imgWidth;
sendImage.height = config.imgHeight;

initVideo();
top();
