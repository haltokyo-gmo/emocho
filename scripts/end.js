import $ from "jquery";

import top from "./top";


const page = document.querySelector("#page-end");

export default function end() {
	fetchImages();

	page.classList.add("active");

	setTimeout(() => {
		page.classList.remove("active");
		top();
	}, 5000);
}

function fetchImages() {
	$.ajax({
		method: "GET",
		url: "http://localhost:8888/emocho/getImages.php"
	})
	.done((data) => {
		console.log(data);
	})
	.fail((err, err2, err3) => {
		console.error(err);
		console.error(err2);
		console.error(err3);
	})
	.catch((err, err2, err3) => {
		console.error(err);
		console.error(err2);
		console.error(err3);
	});
}
