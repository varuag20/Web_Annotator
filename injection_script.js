// Attach the grabText function to the mouseup event of the body element
document.getElementsByTagName("body")[0].onmouseup = grabText();

var highlights = {}; // Initialize an empty object to store highlights
var url = window.location.href.toString(); // Get the current page URL as a string
var text, range, hTag, savedText, key, querySelector, hex; // Declare variables

// Function to convert RGB color to HEX format
function rgbToHex(r, g, b) {
  var rgb = b | (g << 8) | (r << 16); // Combine RGB values into a single number
  return (
    "#" +
    (0x1000000 | rgb)
      .toString(16)
      .substring(1)
      .toUpperCase()
  );
}

// Function to get the block element for the query selector
function getBlockElementForQS() {
  if (
    hTag.tagName == "A" ||
    hTag.tagName == "CODE" ||
    hTag.tagName == "EM" ||
    hTag.tagName == "STRONG" ||
    hTag.tagName == "SPAN"
  ) {
    hTag = hTag.parentElement; // Move up to the parent element
    getBlockElementForQS(); // Recursively call the function until a block element is found
  }
}

// Function to grab the selected text
function grabSelectedText() {
  text = window.getSelection(); // Get the selected text
  range = window.getSelection().getRangeAt(0); // Get the range of the selected text
  hTag = text.anchorNode.parentElement; // Get the parent element of the selected text
  savedText = text; // Save the selected text
  text.removeAllRanges(); // Remove all ranges
  text.addRange(range); // Add the range back
}

// Function to assign a query selector
function assignQuerySelector() {
  if (!hTag.className) {
    querySelector = hTag.tagName.toLowerCase(); // Use the tag name if there is no class
  } else {
    querySelector =
      hTag.tagName.toLowerCase() + "." + hTag.className.split(" ").join("."); // Combine tag name and class
  }
}

// Function to update highlights and attach event listeners
function updateHighlightsAndAttachListeners() {
  chrome.storage.local.get("highlights", results => {
    applyHighlights(results.highlights[url]); // Apply highlights from storage
    addPromptToTargets(); // Add event listeners
  });
}

// Function to save a highlight
function saveHighlight() {
  chrome.storage.local.get("highlights", results => {
    highlights = results.highlights; // Get highlights from storage

    if (!results.highlights[url]) {
      highlights[url] = {}; // Initialize if not already present
    }
    assignQuerySelector(); // Assign query selector
    highlights[url][savedText.anchorNode.parentElement.innerHTML] = [
      querySelector,
      hTag.innerText.indexOf(savedText.toString().trim()),
      hTag.innerHTML.indexOf(savedText.toString().trim())
    ]; // Save highlight data
    chrome.storage.local.set({ highlights }, () => {
      updateHighlightsAndAttachListeners(); // Update highlights and attach event listeners
    });
  });
}

// Function to remove a highlight
function removeHighlight() {
  window.getSelection().anchorNode.parentElement.style.backgroundColor =
    "transparent"; // Reset background color
  chrome.storage.local.get("highlights", results => {
    highlights = results.highlights; // Get highlights from storage
    delete highlights[url][savedText.anchorNode.parentElement.innerHTML]; // Delete the highlight
    chrome.storage.local.set({ highlights }, () => {}); // Save the updated highlights
  });
}

// Function to execute the highlight command
function executeHighlight(c) {
  document.execCommand("HiliteColor", false, c); // Highlight the selected text
}

// Function to add a class to the selected text
function addClassToSelectedText() {
  savedText.anchorNode.parentElement.className = "el"; // Add class 'el' to the selected text
}

// Function to activate the extension
function activateExtension() {
  document.designMode = "on"; // Enable design mode
  chrome.storage.local.get("highlights", results => {
    if (
      results.highlights != undefined &&
      results.highlights[url] != undefined &&
      results.highlights[url]["color"] != undefined
    ) {
      highlights = results.highlights; // Get highlights from storage
      storedColor = highlights[url]["color"].toUpperCase() || "#CFFFDF"; // Get the stored color
    } else {
      storedColor = "#CFFFDF"; // Default color
    }
    grabSelectedText(); // Grab the selected text
    getBlockElementForQS(); // Get block element for query selector
    if (window.getSelection().anchorNode.parentElement.style.backgroundColor) {
      var n = window
        .getSelection()
        .anchorNode.parentElement.style.backgroundColor.replace(/^\D+/g, ""); // Get RGB values
      var c = n.split(")");
      var q = c[0];
      var rgbColor = q.split(",");
      hex = rgbToHex(...rgbColor); // Convert RGB to HEX
      if (hex == storedColor.toUpperCase()) {
        removeHighlight(); // Remove highlight if colors match
      } else {
        executeHighlight(storedColor.toUpperCase()); // Highlight with stored color
        addClassToSelectedText(); // Add class to selected text
        saveHighlight(); // Save the highlight
      }
    } else {
      executeHighlight(storedColor.toUpperCase()); // Highlight with stored color
      addClassToSelectedText(); // Add class to selected text
      saveHighlight(); // Save the highlight
    }
    document.designMode = "off"; // Disable design mode
  });
}

// Function to grab text
function grabText() {
  var sel = window.getSelection(), // Get the selected text
    range = sel.getRangeAt(0), // Get the range of the selected text
    sc = range.startContainer, // Get the start container
    ec = range.endContainer, // Get the end container
    s,
    e;

  // Function to get the start node
  function getStartNode(r) {
    if (
      r.parentElement.tagName != "SPAN" &&
      r.parentElement.tagName != "A" &&
      r.parentElement.tagName != "CODE" &&
      r.parentElement.tagName != "STRONG" &&
      r.parentElement.tagName != "EM" &&
      r.parentElement.tagName != "I"
    ) {
      s = r.parentElement; // Set the start node
      console.log(`pE start: ${r.parentElement.tagName}`);
      console.log(`s: ${s}`);
    } else {
      s = r.parentElement; // Move up to the parent element
      getStartNode(s); // Recursively call the function
    }
  }

  // Function to get the end node
  function getEndNode(r) {
    if (
      r.parentElement.tagName != "SPAN" &&
      r.parentElement.tagName != "A" &&
      r.parentElement.tagName != "CODE" &&
      r.parentElement.tagName != "STRONG" &&
      r.parentElement.tagName != "EM" &&
      r.parentElement.tagName != "I"
    ) {
      e = r.parentElement; // Set the end node
    } else {
      e = r.parentElement; // Move up to the parent element
      getEndNode(e); // Recursively call the function
    }
  }

  getStartNode(sc); // Get the start node
  getEndNode(ec); // Get the end node
  if (s.isSameNode(e) || s.isSameNode(ec.previousElementSibling)) {
    activateExtension(); // Activate the extension if start and end nodes are the same
  }
}
