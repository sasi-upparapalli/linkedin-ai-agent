const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

function log(msg) {
  console.log(`[AGENT] ${msg}`);
}

// ===== ENV VARIABLES =====
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const CODE_NUMBER = process.env.CODE_NUMBER || "20";

if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
  throw new Error("Missing EMAIL_* environment variables");
}

// ===== SELECT CODE FOLDER =====
const codeFolder = `CODE${String(CODE_NUMBER).padStart(2, "0")}`;
log(`Using folder: ${codeFolder}`);

// ===== READ CAPTION =====
const captionPath = path.join(
  __dirname,
  "content",
  codeFolder,
  `${codeFolder}.txt`
);

const captionText = fs.readFileSync(captionPath, "utf8");

// ===== COLLECT IMAGES =====
const imageDir = path.join(__dirname, "content", codeFolder);
const images = fs
  .readdirSync(imageDir)
  .filter(f => f.startsWith("PAGE") && f.endsWith(".jpeg"));

// ===== EMAIL SETUP =====
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

IMAGES:
${images.join("\n")}

(Upload images + paste caption)
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
  })
  .catch(err => {
    console.error("EMAIL ERROR:", err.message);
    process.exit(1);
  });
