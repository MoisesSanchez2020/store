const forge = require("node-forge");
const ed25519 = forge.pki.ed25519;
const bs58 = require("bs58");
const axios = require("axios");
var sleep = require("system-sleep");
// if using node:
// npm install bs58
// npm install node-forge
// npm install axios
// npm install system-sleep
/*
There are multiple steps to match search values to their identity.
First a list of values that match the hashed values in the database
Next to determine which document they belong to
Then match those documents to the identity

This is currently handled as separate API calls
the calls are
findValueHashes
searchsalteddocs
and 
searchleafinit

Details are below near each call
*/

//var APIURL = "http://localhost:3030";
var APIURL = "https://identity-dev.leafglobal.tech";

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
// adding search values.
// this is longer than it needs to be codewise,
// but it is here to be obvious about what it is doing

let firstname = "Leaf";
let lastname = "Testing";
let street = "KK 302";
let city = "Addis Ababa";
let country = "Ethiopia";
let idnumber = "250786563033";
let idtype = "Refugee ID";

// this is an array of the search values
// This is your entry point

// ############################################################################
// build array and send it to IdentitySearch function
// ############################################################################
let value = [];
//value[0] = "92894957ee50ec7243769645dd7b79aa0adcf3e21f5b6d10a374f5170160e7d6";
value[0] = firstname;
value[1] = lastname;
value[2] = street;
value[3] = city;
value[4] = country;
value[5] = idnumber;
value[6] = idtype;
//value[0] = "asd";
//value[0] = "fe9405a70d146b331615f5611683c5543586234fdee2755f57019b088d585b57";

// ############################################################################
// Sending the above array as input, it returns
// ############################################################################
//let responseDocument = IdentitySearch(value);
//console.log(responseDocument);
//os.Exit(0);
// ############################################################################
// This is what is used to add a qr code or other electronic 'document' to an id
// ############################################################################
let responseid = IdentityUpdate(
  "did:leaf:e60da46839cca10dc2625b559c1387b071a76341bc4ebc480bbcb7d0c6b6d081",
  "sdcxshsss",
  "RefugeeIdentification",
  "UnitedNations",
  "10/31/2022"
);
// not important, but verifying the value I just put in is searchable
let checkarray = [];
checkarray[0] = responseid;
console.log("Update Search Value:");
console.log(responseid);
sleep(1000); // make sure any inserts have cleared
let verifycheck = IdentitySearch(checkarray);
console.log(verifycheck);
//console.log(responseDocument);
// ############################################################################
// {"first_name":"Leaf","last_name":"Testing","phone":"+250786563033","id_number":"250786563033","id_type":"Refugee ID","dob":"2000-01-08T00:00:00.000Z","country":"Ethiopia","city":"Addis Ababa","street":"KK 302"}
// ############################################################################

function IdentitySearch(values) {
  reqdoc = {};
  reqdoc.searchvalue = JSON.stringify(values);

  // this value is used throughout to watch for a successful (completed) resposne from postRequest

  asyncresponses = "";
  var resp = postRequest(
    APIURL + "/findValueHashes",
    reqdoc,
    reqdoc.searchvalue
  );
  while (asyncresponses == "") {
    sleep(100);
  }
  hashlist = asyncresponses;

  let idlist = [];
  let saltids = [];

  for (let i = 0; i < hashlist.length; i++) {
    reqdoc = {};
    reqdoc.searchvalue = hashlist[i].hash;
    asyncresponses = "";
    // search for the document associated with each search value hash

    var resp = postRequest(
      APIURL + "/searchsalteddocs",
      reqdoc,
      hashlist[i].hash
    );
    while (asyncresponses == "") {
      sleep(100);
    }

    // odd formatting leaves document characters in response
    // will fix at some time.  Shouldn't be a breaking fix
    // may be the stringify I am calling on the next line
    saltdoc = JSON.stringify(asyncresponses);

    saltdoc = saltdoc.replace("[", "");
    saltdoc = saltdoc.replace("]", "");
    saltdoc = saltdoc.replace('"', "");
    saltdoc = saltdoc.replace('"', "");

    // see if we have already seen document
    // if so, just add to its weight
    let foundflag = false;
    for (let j = 0; j < saltids.length; j++) {
      if (saltids[j].docid === saltdoc) {
        foundflag = true;
        saltids[j].weight = saltids[j].weight + hashlist[i].weight;
      }
    }
    // if it wasn't found, add a new document to the list
    if (foundflag === false) {
      newdoc = {};
      newdoc.docid = saltdoc;
      newdoc.weight = hashlist[i].weight;
      newdoc.uid = saltdoc; //placeholder to build correct array length
      saltids.push(newdoc);
    }
  }

  // now we have deduped and weighted document hashes.
  // now get DID attached to those documents

  for (let i = 0; i < saltids.length; i++) {
    reqdoc = {};
    reqdoc.searchvalue = saltids[i].docid;
    asyncresponses = "";
    var resp = postRequest(
      APIURL + "/searchDocuments",
      reqdoc,
      saltids[i].docid
    );
    while (asyncresponses == "") {
      sleep(100);
    }
    did = JSON.stringify(asyncresponses);
    saltids[i].docid = asyncresponses[0];
    saltids[i].uid = asyncresponses[1]; // sharing this isn't really secure. needed for verifiable credential
  }

  // here is the list of identities and weights
  //grabbing user info for the top weighted identity.
  // this should be a selection or next step
  if (saltids.length > 0) {
    let uid = "";
    if (saltids[0].uid == null) {
      reqdoc = {};
      reqdoc.searchvalue = saltids[0].docid;
      asyncresponses = "";

      var resp = postRequest(APIURL + "/getUserID", reqdoc, reqdoc.searchvalue);
      while (asyncresponses == "") {
        sleep(100);
      }
      uid = asyncresponses;
    } else {
      uid = saltids[0].uid;
    }
    reqdoc = {};
    reqdoc.searchvalue = uid;

    asyncresponses = "";
    var resp = postRequest(APIURL + "/getUserData", reqdoc, reqdoc.searchvalue);
    while (asyncresponses == "") {
      sleep(100);
    }
    let ident = asyncresponses;
    return JSON.stringify(ident);
  } else {
    return {};
  }
}

// ####################################################################################
// document upload.
// ####################################################################################
function IdentityUpdate(
  did,
  qrCode,
  documentType,
  documentIssuer,
  issuanceDate
) {
  let payload = {};
  payload.context = [];
  payload.context[0] = "https://www.w3.org/2018/credentials/v1";
  payload.context[1] = "https://www.w3.org/2018/credentials/examples/v1";
  payload.id = "http://example.gov/credentials/3732";
  payload.type = documentType;
  payload.issuer = documentIssuer;
  payload.issuanceDate = issuanceDate;
  let claim = {};
  claim.id = did;
  // claim value is sha256(documentType + documentIssuert + qrCode)
  var md = forge.md.sha256.create();
  md.update(documentType + documentIssuer + qrCode);
  var shaval = md.digest().toHex();
  claim.value = shaval;
  payload.claim = claim;
  let proof = {};
  proof.type = "Ed25519VerificationKey2018";
  let d = Date(Date.now());
  proof.created = d.toString();
  proof.proofPurpose = "assertionMethod";
  proof.publicKeyBase58 = publickey58;

  var signature = forge.util.bytesToHex(
    forge.ed25519.sign({
      message: shaval,
      encoding: "utf8",
      privateKey: idpair.privateKey,
    })
  );

  proof.signature = signature;
  proof.payload = shaval;

  reqdoc = {};
  reqdoc.type = "verifiableCredential";
  reqdoc.document = payload;

  var resp = postRequest(APIURL + "/updateidentity", reqdoc, shaval);
  return shaval;
}

// ####################################################################################
// supporting functions
// ####################################################################################
function postRequest(url, reqdoc, hashValue) {
  var signature = forge.util.bytesToHex(
    forge.ed25519.sign({
      message: hashValue,
      encoding: "utf8",
      privateKey: idpair.privateKey,
    })
  );

  reqdoc.authentication = {};
  reqdoc.authentication.created = Date().toLocaleString();
  reqdoc.authentication.type = "Ed25519VerificationKey2018";
  reqdoc.authentication.requesthash = hashValue;
  reqdoc.authentication.publicKeyBase58 = publickey58;
  reqdoc.authentication.signature = signature;

  // POST request using fetch with set headers
  axios.defaults.headers.post["Content-Type"] = "application/json";
  axios.post(url, reqdoc).then(
    (response) => {
      if (JSON.stringify(response.data) == "[]") {
        asyncresponses = "{}";
      } else {
        asyncresponses = response.data;
      }
    },
    (error) => {
      console.log(error);
    }
  );
}