export default function share(img, video, videoURL) {
	document.querySelector("#page-share").classList.add("active");

	const imageDOM = document.querySelector("#share-img");
	const videoDOM = document.querySelector("#share-video");

	imageDOM.src = img;
	videoDOM.src = videoURL;

	videoDOM.play();
}
