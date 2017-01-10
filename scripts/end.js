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
		const imgs = document.querySelectorAll("#end-photos img");

		for(const i in data) {
			if(i >= 16) {
				break;
			}
			imgs.item(i).src = data[i];
		}
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
