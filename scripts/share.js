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

	var fd = new FormData();
	fd.append("image", imgBlob);
	fd.append("video", video);

	return (e) => {
		if(btnYes.classList.contains("animate")) {
			return;
		}
		btnAnimateOn();

		$.ajax({
			cache: false,
			contentType: false,
			data: fd,
			// dataType: "json",
			method: "POST",
			processData: false,
			url: "http://localhost:8888/emocho/upload.php"
		})
		.done((data) => {
			console.log(data);
			btnAnimateOff("シェアしました");
			btnYes.removeEventListener("click", handler);
		})
		.fail((err, err2, err3) => {
			console.error(err);
			console.error(err2);
			console.error(err3);
			btnAnimateOff("アップロードに失敗しました");
		})
		.catch((err, err2, err3) => {
			console.error(err);
			console.error(err2);
			console.error(err3);
			btnAnimateOff("アップロードに失敗しました");
		});
	};
}

function btnAnimateOn() {
	btnYes.classList.add("animate");
	btnYes.innerText = "アップロード中";
}

function btnAnimateOff(text) {
	btnYes.classList.remove("animate");
	btnYes.innerText = text;
}

function seeyou() {
	page.classList.remove("active");

	btnYes.removeEventListener("click", handler);
	btnNo.removeEventListener("click", seeyou);

	imageDOM.src = "";
	videoDOM.src = "";

	handler = null;

	end();
}
