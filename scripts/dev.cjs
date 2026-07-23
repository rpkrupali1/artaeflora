// Dev-server launcher. Ensures NODE_EXTRA_CA_CERTS points at the corporate
// TLS-inspection CA when it exists on this machine — some spawn environments
// (IDE preview panes) don't inherit user-level environment variables, and
// without the CA, HTTPS calls to Neon fail with SELF_SIGNED_CERT_IN_CHAIN.
// On machines without the file this is a no-op.
const { spawn } = require("node:child_process");
const fs = require("node:fs");

const path = require("node:path");

const env = { ...process.env };
const candidates = [
  path.join(__dirname, "..", "certs", "corp-ca.crt"),
  "C:\\software\\cert\\Quicken_Loans_SubCA.crt",
];
const ca = candidates.find((p) => {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
});
if (ca) env.NODE_EXTRA_CA_CERTS = ca;

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
