document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get("commentsToggle", (data) => {
    const commentsToggle = data.commentsToggle || false;
    document.getElementById("commentsToggle").checked = commentsToggle;
    toggleCommentsPosition(commentsToggle);
  });

  document
    .getElementById("commentsToggle")
    .addEventListener("change", (event) => {
      const commentsToggle = event.target.checked;

      chrome.storage.local.set({ commentsToggle });

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: toggleCommentsPosition,
          args: [commentsToggle],
        });
      });
    });
});

function toggleCommentsPosition(commentsToggle) {
  const commentsSection = document.getElementById("comments");
  const relatedSection = document.getElementById("related");
  const descriptionSection = document.getElementById("above-the-fold");

  if (!commentsSection || !relatedSection || !descriptionSection) {
    console.error("One or more sections are not found.");
    return;
  }

  if (!commentsSection.dataset.originalParent) {
    commentsSection.dataset.originalParent = commentsSection.parentNode.id;
    commentsSection.dataset.originalNextSibling =
      commentsSection.nextElementSibling
        ? commentsSection.nextElementSibling.id
        : "";
    relatedSection.dataset.originalParent = relatedSection.parentNode.id;
    relatedSection.dataset.originalNextSibling =
      relatedSection.nextElementSibling
        ? relatedSection.nextElementSibling.id
        : "";
  }

  console.log("Toggle State:", commentsToggle);

  if (commentsToggle) {
    console.log("Moving comments next to the video.");

    if (commentsSection && relatedSection) {
      if (commentsSection.parentNode !== relatedSection.parentNode) {
        relatedSection.parentNode.insertBefore(commentsSection, relatedSection);
      }
      commentsSection.style.display = "block";

      commentsSection.style.maxHeight = "800px";
      commentsSection.style.width = "100%";
      commentsSection.style.overflowY = "auto";

      if (descriptionSection && relatedSection) {
        descriptionSection.parentNode.insertBefore(
          relatedSection,
          descriptionSection.nextSibling
        );
        console.log("Moved related section under the description.");
      }
    }
  } else {
    console.log("Restoring original positions.");

    const originalCommentsParent = document.getElementById(
      commentsSection.dataset.originalParent
    );
    if (originalCommentsParent) {
      originalCommentsParent.appendChild(commentsSection);
      commentsSection.style.display = "block";
      commentsSection.style.maxHeight = "";
      commentsSection.style.width = "";
      commentsSection.style.overflowY = "";
    }

    const originalRelatedParent = document.getElementById(
      relatedSection.dataset.originalParent
    );
    if (originalRelatedParent) {
      const originalNextSiblingId = relatedSection.dataset.originalNextSibling;
      const originalNextSibling = originalNextSiblingId
        ? document.getElementById(originalNextSiblingId)
        : null;

      if (originalNextSibling) {
        originalRelatedParent.insertBefore(relatedSection, originalNextSibling);
      } else {
        originalRelatedParent.appendChild(relatedSection);
      }
      console.log("Restored related section to its original position.");
    }
  }
}
