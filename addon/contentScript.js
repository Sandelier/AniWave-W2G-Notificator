const target = document.querySelector('.scroll');

// Detects the messages.
new MutationObserver(mutations => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.classList && node.classList.contains('message')) {
                    const text = node.querySelector('.msg-body .text').textContent.trim();
                    const user = node.querySelector('.msg-body .user').textContent.trim();

                    if (isFullscreen == true) {
                        addNotificationIcon(text, user);
                    }

                }
            });
        }
    }
}).observe(target, {
    childList: true
});

// Notification element stuff.
let notificationDivs = [];
let notificationTimer;
let notificationHeight = 90;

async function addNotificationIcon(text, user) {
	const notificationDiv = document.createElement("div");
	notificationDiv.classList.add("notification");


	// For slide in animation.
	notificationDiv.style.position = "absolute";
	notificationDiv.style.top = `${10 + notificationDivs.length * notificationHeight}px`;
	notificationDiv.style.right = "-400px";

	// text

	let currentTime = new Date();
	let hours = currentTime.getHours();
	let minutes = currentTime.getMinutes();


	if (minutes < 10) {
		minutes = '0' + minutes;
	}

	const username = document.createElement("p");
	username.innerText = `${user} ${hours}:${minutes}`;

	const usermessage = document.createElement("p");
	usermessage.innerText = text;
	

	notificationDiv.appendChild(username);
	notificationDiv.appendChild(usermessage);



	videoPlayer.parentElement.appendChild(notificationDiv);

	// Slide in 
	setTimeout(() => {
		notificationDiv.style.transition = "right 0.5s ease";
		notificationDiv.style.right = "10px";
	}, 100);

	// Removing the div.

	notificationDivs.push(notificationDiv);

	if (notificationDivs.length > 3) {
		removeNotificationDiv(notificationDivs.shift());
	}


	if (!notificationTimer && notificationDivs.length > 0) {
		notificationTimer = setInterval(() => {
			if (notificationDivs.length > 0) {
				removeNotificationDiv(notificationDivs.shift());
			} else {
				clearInterval(notificationTimer);
				notificationTimer = null;
			}
		}, 5000);
	}

}


function removeNotificationDiv(notifDiv) {

	if (notificationTimer) {
		clearInterval(notificationTimer);
		notificationTimer = setInterval(() => {
			if (notificationDivs.length > 0) {
				removeNotificationDiv(notificationDivs.shift());
			} else {
				clearInterval(notificationTimer);
				notificationTimer = null;
			}
		}, 5000);
	}

	notifDiv.style.transition = "right 0.5s ease, opacity 0.5s ease";
	notifDiv.style.right = "-400px";
	notifDiv.style.opacity = 0;

	notifDiv.addEventListener("transitionend", function() {
		notifDiv.parentNode.removeChild(notifDiv);

		// Gotta adjust the height for other divs since we are using absolute positioning :/
		notificationDivs.forEach((div, index) => {
			div.style.top = `${10 + index * notificationHeight}px`;
		});
	}, {
		once: true
	});
}


let isFullscreen = false;

// Video player detection stuff.
function handleFullscreenChange() {
	isFullscreen = videoPlayer.offsetWidth === window.innerWidth && videoPlayer.offsetHeight === window.innerHeight;

	if (!isFullscreen) {
		notificationDivs.forEach((div, index) => {
			div.parentNode.removeChild(div);
		});
		notificationDivs = [];

		if (notificationTimer) {
			clearInterval(notificationTimer);
			notificationTimer = null;
		}
	}
}


// We cant put videoplayer immediately since it wont be on the page onload
let videoPlayer;

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);



function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForVideoPlayer() {
	// honestly i dont have any idea why i need to have infinite loop on this.
	// I tried everything that came to mind to not use any infintie loops but nope even if i set the videoplayer on each message it dosent work it will still break when switching episodes.
	// And its an ass to debug it since aniwave uses the disable-devtools library :/
	while (true) {
		videoPlayer = document.querySelector('video');

		await wait(500);
	}
}

waitForVideoPlayer();