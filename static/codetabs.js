/* Code Tabs Persistence and Switching */
document.addEventListener("DOMContentLoaded", () => {
	const storageKey = "preferred-code-lang";
	const savedLang = localStorage.getItem(storageKey) || "python";

	function switchTabs(lang) {
		document.querySelectorAll(".code-tab-btn").forEach((btn) => {
			if (btn.getAttribute("data-lang") === lang) {
				btn.classList.add("active");
			} else {
				btn.classList.remove("active");
			}
		});

		document.querySelectorAll(".code-tab-content").forEach((content) => {
			if (content.getAttribute("data-lang") === lang) {
				content.classList.add("active");
			} else {
				content.classList.remove("active");
			}
		});

		localStorage.setItem(storageKey, lang);
	}

	document.querySelectorAll(".code-tab-btn").forEach((btn) => {
		btn.addEventListener("click", () => {
			const lang = btn.getAttribute("data-lang");
			switchTabs(lang);
		});
	});

	// Initialize with saved preference
	switchTabs(savedLang);
});
