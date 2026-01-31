const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

function log(msg) {
  console.log(`[AGENT] ${msg}`);
}

// ===== ENV =====
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;

if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
  throw new Error("Missing EMAIL_* environment variables");
}

// ===== CONFIG =====
const START_CODE = 20;                 // CODE20 starts today
const START_DATE = new Date("2026-01-31"); // TODAY (change if needed)

// ===== CALCULATE CODE NUMBER =====
const now = new Date();
const daysPassed = Math.floor(
  (now - START_DATE) / (1000 * 60 * 60 * 24)
);

// 2 posts per day: morning + evening
let codeOffset = daysPassed * 2;

// Evening run adds +1
const hourIST = (now.getUTCHours() + 5.5) % 24;
if (hourIST >= 18) {
  codeOffset += 1;
}

const codeNumber = START_CODE + codeOffset;

if (codeNumber > 25) {
  log("All codes completed. No email sent.");
  process.exit(0);
}

const codeFolder = `CODE${String(codeNumber).padStart(2, "0")}`;
log(`Sending reminder for ${codeFolder}`);

// ===== READ CAPTION =====
const captionPath = path.join(
  __dirname,
  "content",
  codeFolder,
  `${codeFolder}.txt`
);
const captionText = fs.readFileSync(captionPath, "utf8");

// ===== READ IMAGES =====
const imageDir = path.join(__dirname, "content", codeFolder);
const images = fs
  .readdirSync(imageDir)
  .filter(f => f.startsWith("PAGE") && f.endsWith(".jpeg"));

// ===== EMAIL =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const emailBody = `
Reminder: LinkedIn Post Time ✅

POST: ${codeFolder}

CAPTION:
--------------------------------
${captionText}
--------------------------------

IMAGES:
${images.join("\n")}

Time to post on LinkedIn 🚀
`;

async function sendEmail() {
  await transporter.sendMail({
    from: EMAIL_USER,
    to: EMAIL_TO,
    subject: `LinkedIn Reminder – ${codeFolder}`,
    text: emailBody
  });
}

sendEmail()
  .then(() => log("Reminder email sent successfully"))
  .catch(err => {
    console.error("EMAIL ERROR:", err.message);
    process.exit(1);
  });
