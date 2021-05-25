var links = document.querySelectorAll(".ripplelink");

for (var i = 0, len = links.length; i < len; i++) {
	links[i].addEventListener(
		"click",
		function (e) {
         
			var targetEl = e.target;
			var inkEl = targetEl.querySelector(".ink");

			if (inkEl) {
				inkEl.classList.remove("animate");
			} else {
				inkEl = document.createElement("span");
				inkEl.classList.add("ink");
				inkEl.style.width = inkEl.style.height =
					Math.max(targetEl.offsetWidth, targetEl.offsetHeight) + "px";
				targetEl.appendChild(inkEl);
			}

			inkEl.style.left = e.offsetX - inkEl.offsetWidth / 2 + "px";
			inkEl.style.top = e.offsetY - inkEl.offsetHeight / 2 + "px";
			inkEl.classList.add("animate");
		},
		false
	);
}
