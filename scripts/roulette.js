import $ from "jquery";
import game from "./game";

const page = document.querySelector("#page-roulette");
const emotions = ["fear", "happiness", "neutral", "sadness"];
const face_name = ["怖がってる顔", "幸せな顔", "真顔", '悲しい顔'];
var rand_num = 0;

export default function roulette() {
	page.classList.add("active");
    var i = 0;
    var shuffle_emotion = () => {
        rand_num = Math.floor(Math.random() * emotions.length);
        $('.emotion_icon img').attr("src",'img/roulette_icon/'+emotions[rand_num]+'.svg');
        $('#page-roulette p').text(face_name[rand_num]);
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
