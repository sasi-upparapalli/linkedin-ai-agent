const fs = require("fs");
const path = require("path");

function log(msg) {
  console.log(`[AGENT] ${msg}`);
}

// STEP 1: Read state.json
const statePath = path.join(__dirname, "state.json");
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

const codeNumber = state.current_code;
const codeFolder = `CODE${String(codeNumber).padStart(2, "0")}`;

log(`Current code number: ${codeNumber}`);
log(`Selected folder: ${codeFolder}`);

// STEP 2: Read caption text
const captionPath = path.join(
  __dirname,
  "content",
  codeFolder,
  `${codeFolder}.txt`
);

const captionText = fs.readFileSync(captionPath, "utf8");

log("Caption text loaded successfully");
log("Caption preview:");
log(captionText.substring(0, 120));

log("Agent run completed (no posting yet)");
