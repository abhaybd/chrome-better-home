chrome.storage.local.get("key", function(obj) {
	alert(obj.key);
	chrome.storage.local.set({"key": "a" + (obj.key ?? "")});
});