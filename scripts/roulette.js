import $ from "jquery";
import game from "./game";


const page = document.querySelector("#page-roulette");
const emotions = ["anger", "contempt", "disgust", "fear", "hapiness", "neutral", "sadness", "surprise"];
var rand_num = 0;

export default function roulette() {
	page.classList.add("active");
    var i = 0;
    var shuffle_emotion = () => {
        rand_num = Math.floor(Math.random() * emotions.length);
        $('.emotion_icon img').attr("src",'img/roulette_icon/'+emotions[rand_num]+'.svg');
        i++;
        if(i < 30) {
            setTimeout(shuffle_emotion, 100);
        }
    };
    setTimeout(shuffle_emotion, 100);
    setTimeout(function(){
        next(emotions[rand_num]);
    },5000);
}

function next(emotion) {
    page.classList.remove("active");
	game(emotion);
}
