const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

// STEP 3: Update state for next run
const nextCode = codeNumber + 1;

state.current_code = nextCode;
fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

log(`State updated: next code will be ${nextCode}`);

// STEP 4: Commit updated state.json back to GitHub
execSync("git config user.name 'github-actions[bot]'");
execSync("git config user.email 'github-actions[bot]@users.noreply.github.com'");
execSync("git add state.json");
execSync(`git commit -m "Agent update: move to CODE${String(nextCode).padStart(2, "0")}"`);
execSync("git push");

log("State committed to GitHub successfully");
log("Agent run completed (state updated, no posting yet)");
