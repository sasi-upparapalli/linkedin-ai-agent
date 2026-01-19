const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const nodemailer = require("nodemailer");

function log(msg) {
  console.log(`[AGENT] ${msg}`);
}

// ===== ENV VARIABLES (from GitHub Secrets) =====
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
  throw new Error("Missing EMAIL_* environment variables");
}

// ===== STEP 1: Read state.json =====
const statePath = path.join(__dirname, "state.json");
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

const codeNumber = state.current_code;
const codeFolder = `CODE${String(codeNumber).padStart(2, "0")}`;

log(`Selected folder: ${codeFolder}`);

// ===== STEP 2: Read caption =====
const captionPath = path.join(
  __dirname,
  "content",
  codeFolder,
  `${codeFolder}.txt`
);
const captionText = fs.readFileSync(captionPath, "utf8");

// ===== STEP 3: Collect images =====
const imageDir = path.join(__dirname, "content", codeFolder);
const images = fs
  .readdirSync(imageDir)
  .filter(f => f.startsWith("PAGE") && f.endsWith(".jpeg"));

log(`Images found: ${images.join(", ")}`);

// ===== STEP 4: Send Email =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const emailBody = `
LinkedIn Post Ready ✅

CODE: ${codeFolder}

CAPTION:
--------------------------------
${captionText}
--------------------------------

IMAGES TO UPLOAD:
${images.join("\n")}

(Upload images + paste caption + post)
`;

async function sendEmail() {
  await transporter.sendMail({
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `LinkedIn Post Ready – ${codeFolder}`,
    text: emailBody
  });
}

sendEmail()
  .then(() => {
    log("Email sent successfully");

    // ===== STEP 5: Update state =====
    state.current_code = codeNumber + 1;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

    execSync("git config user.name 'github-actions[bot]'");
    execSync("git config user.email 'github-actions[bot]@users.noreply.github.com'");
    execSync("git add state.json");
    execSync(`git commit -m "Agent advanced to CODE${String(state.current_code).padStart(2, "0")}"`);
    execSync("git push");

    log("State updated and committed");
  })
  .catch(err => {
    console.error("EMAIL ERROR:", err.message);
    process.exit(1);
  });
