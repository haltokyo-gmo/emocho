import game from "./game";

const page = document.querySelector("#page-roulette");

export default function roulette() {
    page.classList.add("active");
    var cnt = 1;
    var cnt_total = 0;
    var rand = Math.floor( Math.random() * 8);
    var stop = parseInt(rand) + 30;
    var slow = stop -8;
    var elHit = document.querySelector(".hit");
    var elStart = document.querySelector(".start");
    var elCircle = document.querySelector(".circle");

    $(function(){
      spin();
    });

    function spin() {
      if (cnt == 8)
      {
        $(".hit").removeClass("hit").addClass("circle");
        $(".start").removeClass("circle").addClass("hit");
        cnt = 1;
      }
      else
      {
        $(".hit").addClass("circle").removeClass("hit").parents("li").next().find(".circle").addClass("hit");
        cnt++;
      }

      if (cnt_total < slow)
      {
        setTimeout(function() {
          spin();
        }, 90);
      }
      else if (cnt_total != stop)
      {
        setTimeout(function() {
          spin();
        }, 300);
      }
      else if (cnt_total == stop)
      {
        $(".hit").css({
          "background" : "rgba(255,0,0,2)",
          "color" : "black",
        });
        var emotion = $(".hit").find(".emotion").val();
        next(emotion);

      }
      cnt_total++;
    }
}

function next(emotion) {
    page.classList.remove("active");
    game(emotion);
}