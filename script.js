// Search button click event handler
/*document.getElementById("search-button").addEventListener("click", function() {
    // Get values from the form
    var name = document.getElementById("search-name").value;
    var lastName = document.getElementById("search-lastname").value;
    var address = document.getElementById("search-address").value;
    var country = document.getElementById("search-country").value;
    var phone = document.getElementById("search-phone").value;
  
    // Create the JSON object with the form values
    var json = {
      "id": "1a3f4c",
      "name": name,
      "last_name": lastName,
      "address": address,
      "country": country,
      "phone_number": phone,
      "avatar": "https://www.gannett-cdn.com/media/USATODAY/None/2014/10/09/635484412619522719-D06-John-Lennon-older-07.jpg?width=390&format=pjpg&auto=webp&quality=70",
      "date_of_birth": "1990-01-01",
      "driver_license": "A123456789",
      "social_media": "john_doe"
    };
  
    // Update the ID card with the JSON data
    document.querySelector(".id-card .name").textContent = json.name + " " + json.last_name;
    document.querySelector(".id-card .desi").textContent = json.country;
    document.querySelector(".id-card .no#card-id").textContent = "ID " + json.id;
    document.querySelector(".id-card .address").textContent = json.address;
  
    document.getElementById("card-avatar").src = json.avatar;
    document.getElementById("card-date-of-birth").textContent = json.date_of_birth;
    document.getElementById("card-phone-number").textContent = json.phone_number;
    document.getElementById("card-office-address").textContent = json.address;
    document.getElementById("card-driver-license").textContent = json.driver_license;
    document.getElementById("card-social-media").textContent = json.social_media;
  
  // Hide other elements
var elementsToHide = document.querySelectorAll("header, nav, .container, footer, .main-page-content, .jumbotron, .scanner-content, .section");
elementsToHide.forEach(function(element) {
  element.style.display = "none";
});




    // Show the ID card and the 'back' div
    document.querySelector(".id-card").style.display = "block";
    document.getElementById("back").style.display = "block";
  
    // Change the background color to white
    document.body.style.backgroundColor = "white";
  
    // Set a timer to hide the ID card, the 'back' div, and reset the background color after 10 seconds
    setTimeout(function() {
      // Show other elements
      elementsToHide.forEach(function(element) {
        element.style.display = "block";
      });
  
      // Hide the ID card and the 'back' div
      document.querySelector(".id-card").style.display = "none";
      document.getElementById("back").style.display = "none";
  
      // Reset the background color
      document.body.style.backgroundColor = "";
    }, 5000); // 5 seconds in milliseconds
  
    // Clear the form values
    document.getElementById("search-name").value = "";
    document.getElementById("search-lastname").value = "";
    document.getElementById("search-address").value = "";
    document.getElementById("search-country").value = "";
    document.getElementById("search-phone").value = "";
  });*/

// new code call from API

// Get a reference to the search button and other input fields
const searchButton = document.getElementById("search-button");
const searchNameInput = document.getElementById("search-name");
const searchLastnameInput = document.getElementById("search-lastname");
const searchAddressInput = document.getElementById("search-address");
const searchCountryInput = document.getElementById("search-country");
const searchPhoneInput = document.getElementById("search-phone");

// Add an event listener to the search button
searchButton.addEventListener("click", () => {
  // Get the search values from the input fields
  const firstname = searchNameInput.value;
  const lastname = searchLastnameInput.value;
  const street = searchAddressInput.value;
  const country = searchCountryInput.value;
  const phone = searchPhoneInput.value;

  // Prepare the request data as an object
  const requestData = {
    firstname: firstname,
    lastname: lastname,
    street: street,
    country: country,
    phone: phone,
  };

  // Replace "YOUR_API_ENDPOINT_URL_HERE" with the actual API endpoint URL
  const APIURL = "https://identity-dev.leafglobal.tech";
  const apiEndpointFindValueHashes =
    "https://identity-dev.leafglobal.tech/findValueHashes";
  const apiEndpointSearchSaltedDocs =
    "https://identity-dev.leafglobal.tech/searchsalteddocs";
  const apiEndpointSearchLeafInit =
    "https://identity-dev.leafglobal.tech/searchleafinit";
  const apiEndpointVerifiableCredentialService =
    "https://identity-dev.leafglobal.tech/verifiableCredentialService";

  axios
    .post(apiEndpointFindValueHashes, requestData)
    .then((response) => {
      // Handle the API response data here
      // For example, update the ID card details with the response data
      updateIDCard(response.data);
    })
    .catch((error) => {
      console.error("Error fetching data from findValueHashes:", error);
    });
});

function updateIDCard(data) {
  // Update the ID card details with the response data
  // For example, you can update the elements with the retrieved data
  document.querySelector(".name").textContent = data.name;
  document.querySelector(".desi").textContent = data.designation;
  document.querySelector("#card-id").textContent = data.id;
  document.querySelector(".address").textContent = data.address;
  // ... Add more lines to update other details ...
}

// QR CODE READER
/*
const scanner = new Html5QrcodeScanner("reader", {
  qrbox: {
    width: 150,
    height: 150,
  },
  fps: 20,
});

scanner.render(success, error);

function success(result) {
  document.getElementById("result").innerHTML = `
       <h2>Success!</h2>
       <p><a href="${result}">${result}</a></p>
    `;
  scanner.clear();
  document.getElementById("reader").remove();
}

function error(err) {
  console.error(err);
}*/

// QR CODE END

// QR CODE READER

const scanner = new Html5QrcodeScanner("reader", {
  qrbox: {
    width: 150,
    height: 150,
  },
  fps: 20,
});

scanner.render(success, error);

function success(result) {
  // Set the URL of the iframe to the scanned URL
  const iframe = document.getElementById("qrContent");
  iframe.src = result;
  iframe.style.display = "block";

  // Hide other main content elements on the page, if necessary
  // For example: document.getElementById("mainContent").style.display = "none";

  // After 5 seconds, hide the iframe and show the main content
  setTimeout(() => {
    iframe.style.display = "none";
    // Show the main content elements again
    // For example: document.getElementById("mainContent").style.display = "block";
  }, 6000);
}

function error(err) {
  console.error(err);
}

// QR CODE END
