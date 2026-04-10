const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.chdir(__dirname);

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

try {
  require(standaloneServer);
} catch (error) {
  console.error(
    "Standalone build introuvable. Lancez `npm run build` avant de demarrer l'application sur cPanel.",
  );
  throw error;
}
