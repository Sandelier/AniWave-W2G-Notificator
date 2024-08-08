

const target = document.querySelector('.scroll');
let isFullscreen = false;

// Detects the messages.
new MutationObserver(mutations => {
	for (const mutation of mutations) {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach(node => {
				if (node.classList && node.classList.contains('message')) {
					const text = node.querySelector('.msg-body .text').textContent.trim();
					const user = node.querySelector('.msg-body .user').textContent.trim();



					// Video player gets replaced dynamically by the site when you switch to an new episode so we always need to check if it has been removed.
					if (!document.body.contains(videoPlayer)) {
						waitForVideoPlayer();


						notificationDivs.forEach((div, index) => {
							div.parentNode.removeChild(div);
						});
						notificationDivs = [];

						if (notificationTimer) {
							clearInterval(notificationTimer);
							notificationTimer = null;
						}

					}

					isFullscreen = videoPlayer.offsetWidth === window.innerWidth && videoPlayer.offsetHeight === window.innerHeight;

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


function getUsername() {
	const container = document.querySelector('#body > .container');
	const dataUserAttr = container.getAttribute('data-user');
	const dataUser = JSON.parse(dataUserAttr);

	return dataUser.name
}

async function addNotificationIcon(text, user) {

	if (getUsername() === user) {
		return;
	}

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
		}, 10000);
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
		}, 10000);
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


// We cant put videoplayer immediately since it wont be on the page onload
let videoPlayer;


function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForVideoPlayer() {
	while (!document.body.contains(videoPlayer)) {
		videoPlayer = document.querySelector('video');
		await wait(500);
	}

	let messageInput = document.getElementById('notification-messageInput');

	if (!messageInput) {
		createMessageField();
	}
}

waitForVideoPlayer();



// Messaging

function createMessageField() {
	const container = document.createElement('form');
	container.id = 'notification-messageInputContainer';
    const messageField = document.createElement('input');
	const sendBtn = document.createElement('button');
	sendBtn.type = "submit";

    messageField.id = 'notification-messageInput';
    
    messageField.type = 'text';
    messageField.placeholder = 'Type your message...';

	// Dispatching events so the video controls dont go unvisible while writing
	messageField.addEventListener('input', function(event) {
		const videoControls = document.querySelector('.jw-controls-backdrop');
		const mousemoveEvent = new MouseEvent('mousemove', {
			bubbles: true,
			cancelable: true,
			view: window
		});
		videoControls.dispatchEvent(mousemoveEvent);
	});
    
	sendBtn.textContent = 'Send';
	sendBtn.classList.add("btn");
	sendBtn.classList.add("btn-primary");
	sendBtn.id = "messageSendBtn";

	sendBtn.addEventListener('click', function(event) {
		if (messageField.value.trim() !== '') {
		    const chatInput = document.getElementById('chat-input');
		    const chatSendButton = document.getElementById('chat-send');
		
		    chatInput.value = messageField.value;
		
		    chatSendButton.click();
		
		    messageField.value = '';
			chatInput.value = '';
		}
	});

	container.id = "messageFieldContainer";
    container.appendChild(messageField);
	container.appendChild(sendBtn);

	container.addEventListener('submit', function(event) {
		// Have to prevent form default behaviour
        event.preventDefault();
    });

	// We can't put it to videoplayers parentelement since otherwise whenever we click the field the video will be paused.
	videoPlayer.parentElement.parentElement.appendChild(container);
}




// Hides the message input field whenever controls opacity changes

function checkControlsStatus() {
	const videoControls = document.querySelector('.jw-controls-backdrop');
	const style = window.getComputedStyle(videoControls);

	const visible = parseFloat(style.opacity) >= 1;

	let messageInput = document.getElementById('notification-messageInput');
	let sendBtn = document.getElementById('messageSendBtn');

	messageInput.style.opacity = visible ? '1' : '0';
	sendBtn.style.opacity = visible ? '1' : '0';
}

setInterval(checkControlsStatus, 300);








