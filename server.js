const forge = require("node-forge");
const ed25519 = forge.pki.ed25519;
const bs58 = require("bs58");
const axios = require("axios");
var sleep = require("system-sleep");

// setup public/private keys
var keySeed = "devdb"; // this is the hardcoded identity for the development work.
var md = forge.md.sha256.create();
md.update(keySeed);
var seed = md.digest();
var seedbuffer = forge.util.ByteBuffer(keySeed, "utf8");
let idpair = ed25519.generateKeyPair({ seed: seed.data });
const PublicAddress = forge.util.bytesToHex(idpair.publicKey);
const PrivateAddress = forge.util.bytesToHex(idpair.privateKey);
var publickey58 = bs58.encode(idpair.publicKey);
let asyncresponses = "";

const express = require("express");
const path = require("path");

const MongoClient = require("mongodb").MongoClient;
const rateLimit = require("express-rate-limit");

const uri =
  "mongodb+srv://moises:Jr2UsGGYaXvnMeIk@leaf-dev-db-cluster.14hzyrt.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db; // This will hold the database connection

client.connect((err) => {
  if (err) throw err;
  console.log("Connected to MongoDB");
  db = client.db("identityDB"); // Adjust the database name accordingly
});
const app = express();
const PORT = 3000;

const APIURL = "https://identity-dev.leafglobal.tech";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

app.use("/api/", apiLimiter);
app.get("/findValueHashes", async (req, res) => {
  try {
    const response = await axios.get(APIURL + "/updateidentity");
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error fetching data from the external API" });
  }
});

app.get("/getUserData", async (req, res) => {
  try {
    const response = await axios.get(APIURL + "/getUserData");
    console.log("External API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  console.log(`Request for ${req.url}`);
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/getUserData", async (req, res) => {
  try {
    const response = await axios.get(APIURL + "/getUserData");
    console.log("External API Response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error fetching data from the external API" });
  }
});
