// Get the current URL of the page
var url = window.location.href.toString();
var DOM = document.body; // Reference to the DOM body element
var highlights, note; // Variables to store highlights and notes

// Function to search for highlights in storage
function searchForHighlights() {
  chrome.storage.local.get("highlights", results => {
    if (objDoesNotExist(results)) {
      createHighlightObj(); // Create a new highlight object if none exists
    } else {
      if (doHighlightsForThisURLExist(results)) {
        return; // Exit if highlights already exist for this URL
      } else {
        applyHighlights(results.highlights[url]); // Apply existing highlights
        addPromptToTargets(); // Add prompt for double-clicked highlights
      }
    }
  });
}

// Function to check if the highlights object does not exist
function objDoesNotExist(results) {
  if (
    results === "undefined" ||
    (Object.entries(results).length === 0 && results.constructor === Object)
  ) {
    return true;
  }
}

// Function to create a new highlight object
function createHighlightObj() {
  highlights = {}; // Initialize an empty highlights object
  chrome.storage.local.set({ highlights }, () => {}); // Save it to local storage
  return;
}

// Function to check if highlights exist for the current URL
function doHighlightsForThisURLExist(results) {
  if (!results.highlights[url]) {
    return true; // Return true if no highlights exist for this URL
  }
}

// Function to apply highlights from storage to the page
function applyHighlights(pageHighlights) {
  console.log("Highlights Found For This URL");
  for (key in pageHighlights) {
    if (!(pageHighlights[key].toString().charAt(0) === "#")) {
      var nodeList = document.body.querySelectorAll(pageHighlights[key][0]);
      for (let i = 0; i < nodeList.length; i++) {
        if (
          pageHighlights[key][1] === nodeList[i].innerText.indexOf(key) ||
          pageHighlights[key][2] === nodeList[i].innerText.indexOf(key)
        ) {
          grabNoteIfExists(pageHighlights);
          nodeList[i].innerHTML = nodeList[i].innerHTML.replace(
            key,
            `<span style="background-color: ${pageHighlights["color"] ||
              "#CFFFDF"};" class="el" title="${note}">` +
              key +
              "</span>"
          );
        }
      }
    }
  }
}

// Function to get the note if it exists
function grabNoteIfExists(phls) {
  if (phls[key][3] != undefined) {
    note = phls[key][3].toString();
  } else {
    note = "";
  }
}

// Search for highlights on page load
searchForHighlights();

// Function to add prompt to highlighted elements
function addPromptToTargets() {
  var nodes = document.getElementsByClassName("el");
  for (let i = 0; i < nodes.length; i++) {
    // Remove existing event listener to avoid duplicate prompts
    nodes[i].ondblclick = null;

    nodes[i].ondblclick = () => {
      note = prompt("Add a comment for this highlight: ", nodes[i].title);
      if (note != null) {
        chrome.storage.local.get("highlights", results => {
          highlights = results.highlights;
          highlight = highlights[url][nodes[i].innerHTML];
          highlight[3] = note;
          nodes[i].title = note;
          chrome.storage.local.set({ highlights }, () => {});
        });
      }
    };
  }
}
