/*
	UILoginController.js

	Copyright (c) 2014-2022 dangered wolf, et al
	Released under the MIT License
*/

import { enableStylesheetExtension, disableStylesheetExtension } from "./StylesheetExtensions";
import { I18n } from "./I18n";
import { openSettings } from "./UISettings";
import { loginPage } from "./DataMustaches";

const { mtdBaseURL, html } = window;
let { loginIntervalTick, loginInterval, signinSheetPings } = window

let ugltStarted = false;
window.loginIntervalTick = 0;

// Updates the "Good morning" / "Good afternoon" / "Good evening"
// text on the login screen every once in a while (10s, ish)

function startUpdateGoodLoginText() {

	// Don't run if we already started
	if (ugltStarted) {
		return;
	}

	ugltStarted = true;


	// we've gotta update the image URL
	// we can't do this in the new login mustache because when it's initialised,
	// MTDURLExchange hasn't completed yet

	$(".startflow-background").attr("style",`background-image:url(${mtdBaseURL}assets/img/bg1.webp)`)

	if (window?.desktopConfig?.customLoginImage) {
		if (window.desktopConfig.customLoginImage.match(/https:\/\//gm) !== null) {
			$(".startflow-background").attr("style",`background-image:url(${window.desktopConfig.customLoginImage})`)
		} else {
			$(".startflow-background").attr("style",`background-image:url(moderndeck://background)`)
		}
	}

	setInterval(() => {
		let text;
		const newDate = new Date();

		if (newDate.getHours() < 12) {
			text = I18n("Good morning");
		} else if (newDate.getHours() < 18) {
			text = I18n("Good afternoon");
		} else {
			text = I18n("Good evening");
		}

		$(".form-login h2").html(text);
	},10000);
}

/*
	Checks if the signin form is available.

	If so, it activates the login page stylesheet extension
*/

export function checkIfSigninFormIsPresent() {

	if ($(".app-signin-form").length > 0 || $("body>.js-app-loading.login-container:not([style])").length > 0) {
		html.addClass("signin-sheet-now-present");

		loginIntervalTick++;
		enableStylesheetExtension("loginpage");

		if (loginIntervalTick > 5) {
			clearInterval(loginInterval);
		}
	} else {
		if (typeof signinSheetPings === "undefined") {
			signinSheetPings = 0;
		}

		signinSheetPings++;

		if (signinSheetPings > 6) {
			console.log("I am no longer asking");
			clearInterval(loginInterval);
		}
		console.log("Not on signin sheet anymore");
		disableStylesheetExtension("loginpage");
		html.removeClass("signin-sheet-now-present");
	}

}
// replaces login page with moderndeck one

export function loginTextReplacer() {
	if ($(".mtd-signin-form").length <= 0) {
		console.info("oh no, we're too late!");

		$(".app-signin-wrap:not(.mtd-signin-wrap)").remove();
		$(".login-container .startflow").html(loginPage);
		startUpdateGoodLoginText();

		$(".mtd-login-info-button").on('click', () => openSettings(undefined, true))
	}
}
