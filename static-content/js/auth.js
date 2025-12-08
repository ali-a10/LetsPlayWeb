if (window.location.pathname.includes('/signup')) {
  document.getElementById('account-form').addEventListener('submit', signup);
  document.getElementById('page-title').innerText = 'Create an Account';
}
else if (window.location.pathname.includes('/login')) {
  document.getElementById('login-form').addEventListener('submit', login);
}


// Call the login check API on page load
export function checkLoginStatus() {
  console.log("checking login status...");
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "GET",
      url: '/auth/status',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: "json"
    })
    .done(function(data, textStatus, jqXHR) {
      // console.log(jqXHR.status + " " + textStatus); 
      console.log("Server Response: " + JSON.stringify(data));
      resolve(data);
    })
    .fail(function(err) {
      console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
      reject(data);
    });
  });
  // fetch('/auth/status')     /////////////////////// convert to ajax??
  //   .then(response => response.json())
  //   .then(data => {
  //     if (data.loggedIn) {
  //       // User is logged in, display user-specific elements
  //       document.getElementById('login-btn').style.display = 'none';
  //       document.getElementById('signup-btn').style.display = 'none';
  //       document.getElementById('logout-btn').style.display = 'block';
  //       document.getElementById('welcome-msg').innerText = `Welcome, ${data.user.username}!`;
  //     } else {
  //       // User is not logged in, display login/signup options
  //       document.getElementById('login-btn').style.display = 'block';
  //       document.getElementById('signup-btn').style.display = 'block';
  //       document.getElementById('logout-btn').style.display = 'none';
  //       document.getElementById('welcome-msg').innerText = '';
  //     }
  //   })
  //   .catch(error => console.error('Error checking login status:', error));
}


export function bindLogoutBtn() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout()
        .done(function(data, textStatus, jqXHR) {
          console.log(jqXHR.status + " " + textStatus); 
          console.log("Server Response: " + JSON.stringify(data));
          window.location.href = '/'; // Redirect to home page after logout
        })
        .fail(function(err) {
          console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
        });
    });
  }
}


function logout() {
  $.ajax({
    method: "GET",
    url: '/logout',
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
}

// using addEventListener not onclick to keep the JS and HTML separate
document.getElementById('logout-btn').addEventListener('click', () => {
  $.ajax({
    method: "GET",
    url: '/logout',
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
  .done(function(data, textStatus, jqXHR) {
    console.log(jqXHR.status + " " + textStatus); 
    console.log("Server Response: " + JSON.stringify(data));
    window.location.href = '/'; // Redirect to home page after logout
  })
  .fail(function(err) {
    console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
  });
  
  // fetch('/logout')
  //   .then(() => {
  //     window.location.href = '/'; // Redirect to home page after logout
  //   })
  //   .catch(error => console.error('Error logging out:', error));
});


// Sign up function
async function signup(event) {
  event.preventDefault(); // Prevent page reload

  // Collect form fields
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value.trim();
  const dob = document.getElementById('dob').value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value || '';

  // Collect multiple select (Favorite Sports)
  const favoriteSports = Array.from(document.getElementById('favoriteSports').selectedOptions)
                              .map(option => option.value);

  const about = document.getElementById('about').value.trim();
  // const profilePicInput = document.getElementById('profilePic');
  // const profilePic = profilePicInput.files[0] ? profilePicInput.files[0].name : ''; 
  // // For now just use filename — once multer is added we’ll upload the actual file

  // Create a user object matching your User class
  const newUser = {
    username,
    email,
    password,
    phone,
    gender,
    favoriteSports,
    about,
    dob
    // profilePic
  };

  try {
    const response = await fetch('/submitSignup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    const data = await response.json();

    const messageBox = document.getElementById('accountErrorMessage');
    messageBox.style.display = 'block';

    if (data.success) {
      messageBox.textContent = 'Account created successfully! Redirecting...';
      messageBox.style.color = 'green';
      setTimeout(() => (window.location.href = '/'), 1500);
    } else {
      messageBox.textContent = data.message || 'Sign up failed. Please try again.';
      messageBox.style.color = 'red';
    }
  } catch (err) {
    console.error('Error:', err);
    const messageBox = document.getElementById('accountErrorMessage');
    messageBox.textContent = 'An unexpected error occurred.';
    messageBox.style.color = 'red';
    messageBox.style.display = 'block';
  }
}


// Log in function
function login(event) {
  console.log("LOGGING IN");
  event.preventDefault();  // Prevent page from refreshing/navigating

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  // Clear any previous error message
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  fetch('/submitLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = '/';
    } else {
      errorMessage.style.display = 'block';
      errorMessage.textContent = data.message;
    }
  })
  .catch(err => {
      console.error('Error during login:', err);
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'An error occurred during login.';
  });
}


function getUser(id) {
  return $.ajax({
    method: "GET",
    url: '/user/' + id,
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
}

// helper for popup when account info is updated (or failed to update)
export function showPopup(message, isSuccess) {
  const popup = document.getElementById('notification-popup');
  popup.innerHTML = "<p class='text-center fs-5 m-0 p-3 text-light'>" + message + "</p>";
  popup.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // Green or red
  popup.style.display = 'block';

  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}


// code for the autocomplete multiple select for activities/sports
const activityInput = document.getElementById("favoriteSports");
const suggestionsList = document.getElementById("activitySuggestions");
const selectedContainer = document.getElementById("selectedActivities");

const activityOptions = [
  "Soccer", "Basketball", "Volleyball", "Tennis",
  "Hockey", "Baseball", "Running", "Pickleball"
];

// Will store chosen activities
let selectedActivities = [];

// AUTOCOMPLETE
if (activityInput) {
  activityInput.addEventListener("input", () => {
    const inputValue = activityInput.value.toLowerCase();
    suggestionsList.innerHTML = "";
  
    if (!inputValue) return;
  
    const filtered = activityOptions.filter(sport =>
      sport.toLowerCase().includes(inputValue) &&
      !selectedActivities.includes(sport) // don’t show ones already selected
    );
  
    filtered.forEach(activity => {
      const li = document.createElement("li");
      li.textContent = activity;
      li.classList.add("list-group-item", "list-group-item-action");
      li.style.cursor = "pointer";
  
      li.addEventListener("click", () => {
        addActivity(activity);
        activityInput.value = "";
        suggestionsList.innerHTML = "";
      });
  
      suggestionsList.appendChild(li);
    });
  });  
}

// ADD CHIP
function addActivity(activity) {
  selectedActivities.push(activity);

  // Create the chip
  const chip = document.createElement("div");
  chip.classList.add("badge", "bg-white", "text-dark", "border", "fs-6");
  chip.style.padding = "0.5rem 0.75rem";
  chip.style.display = "flex";
  chip.style.alignItems = "center";
  chip.style.gap = "0.5rem";

  chip.textContent = activity;

  // Add small X button
  const removeBtn = document.createElement("span");
  removeBtn.textContent = "×";
  removeBtn.style.cursor = "pointer";
  removeBtn.style.fontWeight = "bold";

  removeBtn.addEventListener("click", () => {
    removeActivity(activity, chip);
  });

  chip.appendChild(removeBtn);
  selectedContainer.appendChild(chip);
}

// REMOVE CHIP
function removeActivity(activity, chipElement) {
  selectedActivities = selectedActivities.filter(a => a !== activity);
  chipElement.remove();
}
