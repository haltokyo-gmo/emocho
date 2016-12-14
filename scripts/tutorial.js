import roulette from "./roulette";


const page = document.querySelector("#page-tutorial");


export default function tutorial() {
	page.classList.add("active");
	next();
}

function next() {
	page.classList.remove("active");
	roulette();
}
