import $ from "jquery";

import end from "./end";


const page = document.querySelector("#page-share");

const imageDOM = document.querySelector("#share-img");
const videoDOM = document.querySelector("#share-video");

const btnYes = document.querySelector("#share-btn-yes");
const btnNo = document.querySelector("#share-btn-no");

var handler = null;

export default function share(img, video, videoURL) {
	page.classList.add("active");

	imageDOM.src = img;
	videoDOM.src = videoURL;

	videoDOM.play();

	handler = uploadHandler(img, video);

	btnYes.addEventListener("click", handler);
	btnNo.addEventListener("click", seeyou);
}

function uploadHandler(img, video) {
	var byteString = atob(img.split(',')[1]);
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  var imgBlob = new Blob([ab], {type: 'image/jpeg'});

	return (e) => {
		$.ajax({
			cache: false,
			// contentType: "application/json",
			data: {
				"image": imgBlob,
				"video": video
			},
			dataType: "json",
			method: "POST",
			processData: false,
			url: "http://localhost:5555/upload"
		})
		.done((data) => {
			console.log(data);
		})
		.fail((err) => {
			console.error(err);
		})
	};
}

function seeyou() {
	page.classList.remove("active");

	btnYes.removeEventListener("click", handler);
	btnNo.removeEventListener("click", seeyou);

	imageDOM.src = "";
	videoDOM.src = "";

	handler = null;
}
