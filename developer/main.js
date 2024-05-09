const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const readline = require('readline');

async function main() {
	const url = 'https://aniwave.to/watch2gether/room/1415088';
	const outputFile = 'output.html';

	puppeteer.use(StealthPlugin());

	const browser = await puppeteer.launch({ headless: false });

	const page = await browser.newPage();

	await page.goto(url);


	await page.waitForSelector('.message');


	//await page.on('console', (msg) => {
	//    if (msg.type().substr(0, 3).toUpperCase() == "LOG") {
	//        console.log(...msg.args().map(v => v.toString().substr(9)));
	//    }
	//  });


	const isFullscreen = false;
	const videoPlayer = null;

	// Assinging the variables as global so that we can console log them later on with the command line. 
	await page.evaluate((isFullscreen, videoPlayer) => {
		window.isFullscreen = isFullscreen;
		window.videoPlayer = videoPlayer;
	}, isFullscreen, videoPlayer);


	await page.evaluate(() => {
		const target = document.querySelector('.scroll');
		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				if (mutation.type === 'childList') {
					mutation.addedNodes.forEach(node => {
						if (node.classList && node.classList.contains('message')) {
							const text = node.querySelector('.msg-body .text').textContent.trim();
							const user = node.querySelector('.msg-body .user').textContent.trim();



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
		});



		observer.observe(target, {
			childList: true
		});

		// Notification element stuff.
		var notificationDivs = [];
		var notificationTimer;
		var notificationHeight = 90;

		function addNotificationIcon(text, user) {
			const notificationDiv = document.createElement("div");

			notificationDiv.style.fontFamily = 'Nunito, Archivo, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
			notificationDiv.style.fontWeight = 600;
			notificationDiv.style.fontSize = "1rem";

			notificationDiv.style.width = "300px";
			notificationDiv.style.height = "80px";


			notificationDiv.style.background = "rgba(0, 0, 0, 0.5)";


			notificationDiv.style.borderRadius = "10px";
			notificationDiv.style.border = "2px solid rgba(255, 255, 255, 0.8)";

			notificationDiv.style.padding = "0px 10px 0px 10px";


			notificationDiv.style.display = "flex";
			notificationDiv.style.flexDirection = "column";
			notificationDiv.style.justifyContent = "center";

			notificationDiv.style.color = "white";

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

			usermessage.style.overflow = "hidden";
			usermessage.style.whiteSpace = "nowrap";
			usermessage.style.textOverflow = "ellipsis";



			username.style.margin = "0px";
			usermessage.style.margin = "0px";

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
			}, { once: true });
		}


		function wait(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}

		async function waitForVideoPlayer() {
			while (!document.body.contains(videoPlayer)) {
				videoPlayer = document.querySelector('video');
				await wait(500);
			}
		}



		waitForVideoPlayer();
	});


	// command line stuff.

	page.on('console', msg => {
		if (msg.text().includes('Allowed:')) {
			console.log(msg.text());
		}
	});


	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	rl.on('line', async (input) => {
		if (input.trim() === 'dump') {
			const htmlContent = await page.content();

			fs.writeFile(outputFile, htmlContent, (err) => {
				if (err) {
					console.error('Error writing to file:', err);
				} else {
					console.log('HTML content written to', outputFile);
				}
			});
		} else {
			await page.evaluate((variableName) => {
				if (window[variableName] instanceof HTMLElement) {
					console.log(`Allowed: ${variableName}, ${document.body.contains(window[variableName])}`);
				} else {
					console.log(`Allowed: ${variableName}, ${window[variableName]}`);
				}
			}, input.trim());
		}
	});

}

main();