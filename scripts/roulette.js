import game from "./game";


const page = document.querySelector("#page-roulette");


export default function roulette() {
	page.classList.add("active");
	next();
}

function next() {
	page.classList.remove("active");
	game("happiness");
}
