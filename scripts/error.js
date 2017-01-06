import * as config from "./config";

export function displayError(message) {
	const el = document.querySelector("#error-text");
	el.innerText = message;
}

export function pageError(message) {
	var pages = document.querySelectorAll("section");
	for(var i=0; i<pages.length; i++) {
		pages.item(i).classList.remove("active");
	}

	var el = document.querySelector("#page-error");
	el.innerText = message;
	el.classList.add("active");
}
