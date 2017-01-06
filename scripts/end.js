import top from "./top";

const page = document.querySelector("#page-end");

export default function end() {
	page.classList.add("active");

	setTimeout(() => {
		page.classList.remove("active");
		top();
	}, 5000);
}
