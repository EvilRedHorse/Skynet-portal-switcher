var browser = browser || chrome;

// Use this portal
let defaultPortal = 'scp.techandsupply.ca';

// Initialize the list of portal hosts
let portalList = [
	"scp.techandsupply.ca",
	"scprime.hashpool.eu",
	"scp://",
	"web-scp://"
];

// Set the default list on installation.
browser.runtime.onInstalled.addListener(details => {
	browser.storage.local.set({
		defaultPortal: defaultPortal
	});
});

// Get the stored list
browser.storage.local.get(data => {
	if (data.portalList) {
		defaultPortal = data.defaultPortal;
	}
});

// Listen for changes in the portal list
browser.storage.onChanged.addListener(changeData => {
	defaultPortal = changeData.defaultPortal.newValue;
});

// Search engines must use q=____ query string
let searchEngines = [
	"www.google.com",
	"www.ecosia.org",
	"duckduckgo.com",
	"www.bing.com",
	"search.yahoo.com",
	"search.aol.com"
]

// Listen for a request to open a webpage
browser.webRequest.onBeforeRequest.addListener(handleRequest, {urls: ["<all_urls>"]}, ["blocking"]);

// On the request to open a webpage
function handleRequest(requestInfo) {

	// Read the web address of the page to be visited
	const url = new URL(requestInfo.url);

	// Determine whether the domain in the web address is on the portals list
	if (portalList.indexOf(url.hostname) != -1 && url.hostname != defaultPortal) {
		console.log(`Redirecting to: ${url.hostname}`);
		return {
			redirectUrl: "https://" + defaultPortal + url.pathname
		};
	} else if (defaultPortal.indexOf(url.hostname) != -1 && url.pathname.startsWith("/web%2Bscp%3A%2F%2F")) {
		skylink = url.pathname.replace('web%2Bscp%3A%2F%2F', '');
		console.log(`Removing web+scp:// from path ->` + publink);
		return {
			redirectUrl: "https://" + defaultPortal + publink
		}; 
	} else if (searchEngines.indexOf(url.hostname) != -1) {
		console.log('Checking search (q=...) query string');

		const searchString = url.searchParams.get("q");
		console.log(searchString)
		if (searchString.startsWith('web-scp://') || searchString.startsWith('scp://')) {
			publink = searchString.replace('web-scp://', '');
			publink = publink.replace('scp://', '');
			console.log(publink)

			return {
				redirectUrl: "https://" + defaultPortal + '/' + publink
			}; 
		}
	}

	// No redirect needed for other urls
	return {};
}
