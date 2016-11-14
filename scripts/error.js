export default function error(message) {
	document.querySelectorAll('section').forEach((page) => {
		if(page instanceof HTMLElement) {
			page.classList.remove('active');
		}
	})

	var el = document.querySelector('#page-error');
	el.innerText = message;
	el.classList.add('active');
}
