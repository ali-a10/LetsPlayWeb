import { checkLoginStatus, bindLogoutBtn, showPopup } from './auth.js';


$(document).ready(function () {
  let user = null;
  checkLoginStatus()
    .then(data => {
      if (data.loggedIn) {
          document.getElementById('login-btn').style.display = 'none';
          document.getElementById('signup-btn').style.display = 'none';
          document.getElementById('logout-btn').style.display = 'block';
          document.getElementById('myaccount-btn').style.display = 'block';
          user = data.user;
      } else {
          // User is not logged in, display login/signup options
          document.getElementById('login-btn').style.display = 'block';
          document.getElementById('signup-btn').style.display = 'block';
          document.getElementById('logout-btn').style.display = 'none';
      }
      
        // Check if we're in "create" or "edit" mode based on the current page URL
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('user');
        const isViewMode = userId !== null;

        console.log(path, isViewMode, urlParams, urlParams.get('user'));
        // Update page elements based on the mode
        
        if (isViewMode) {
            // Viewing another user's profile
            document.getElementById('page-title').innerText = 'User Profile';
            console.log("viewing user id: ", userId);
            getUser(userId)
            .done(function(data, textStatus, jqXHR) {
                const user = data.user;
                const allowedFields = ['username', 'favoriteSports', 'about']
                Object.keys(user).forEach(key => {
                const inputElement = document.getElementById(key); 
                if (inputElement) {
                    if (allowedFields.includes(key)) {
                    if (inputElement) {
                        inputElement.value = user[key];
                        inputElement.disabled = true; // disable the input field
                    }
                    } else {
                    // hide the element
                    console.log("hiding element for key: ", inputElement, key);
                    inputElement.parentElement.classList.add('d-none');
                    }

                }
                
                });
                // Hide signup and save buttons
                document.getElementById('signup-btns').classList.add('d-none');
                document.getElementById('save-btns').classList.add('d-none');
            })
            .fail(function(err) {
                console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
            });

            
        }
        else {
            // Editing own profile
            document.getElementById('page-title').innerText = 'My Account';

            getUser(data.user.id)
            .done(function(data, textStatus, jqXHR) {
                const user = data.user;
                Object.keys(user).forEach(key => {
                if (key == "gender") {
                    const genderInputs = document.getElementsByName("gender");
                    genderInputs.forEach(input => {
                        if (input.value === user[key]) {
                            input.checked = true;
                        }
                    });
                }
                else if (key === 'favoriteSports') {
                    // set multiple select options
                    const favoriteSports = document.getElementById('activitySuggestions');
                    console.log(favoriteSports);

                    // iterate through the user's favorite sports
                    user[key].forEach(sport => {
                        addActivity(sport);  // add chip
                    });
                }
                else {
                    const element = document.getElementById(key);
                    if (element) {
                        element.value = user[key];
                    }
                }
                });
            });
            document.getElementById('save-button').addEventListener('click', (event) => {
                editProfile(event);  // when we get into this page, this is set once
                // i.e it doesn't change until we refresh the page
                // so we might have to get the current user every time save-button is clicked
                // that means we might have to call editProfile(event) and get the user inseide
                // this function
            });
        }
    })
    .catch(error => {
        console.log("ERROR from check login: ", error)
    });
});


function editProfile(event) {
  event.preventDefault();  // Prevent page from refreshing/navigating
  
  // somehow check if textboxes have changed

  // if so:
  checkLoginStatus()
    .then(data => {
      if (data.loggedIn) {
        $.ajax({
          method: "GET",
          url: '/user/' + data.user.id,
          processData: false,
          contentType: "application/json; charset=utf-8",
          dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
          // Collect form fields
          const fields = ['email', 'username', 'password', 'phone', 'dob', 'gender', 'favoriteSports', 'about'];
          const fieldsToUpdate = {};
          let updateNeeded = false;

          for (const field of fields) {
            let newValue = null;  // this i used to check if there are new updates made to the user fields upon clicking asve
            if (field === 'gender') {
              newValue = document.querySelector('input[name="gender"]:checked')?.value || '';
              console.log(`Type of ${field}:`, typeof document.querySelector('input[name="gender"]:checked')?.value);
            }
            else if (field === 'favoriteSports') {
              // get all divs inside selectedActivities
              const selectedDivs = document.getElementById('selectedActivities').children;
              const selectedSports = [];
              for (const div of selectedDivs) {
                // get the text content without the 'x' character
                selectedSports.push(div.textContent.slice(0, -1).trim());
              }
              console.log("selected sports: ", selectedSports, data.user[field]);
              newValue = selectedSports
            }
            else {
              newValue = document.getElementById(field).value.trim();
              console.log(`Type of ${field}:`, typeof document.getElementById(field).value);

            }
            if (newValue !== data.user[field]) {
              fieldsToUpdate[field] = newValue;
              updateNeeded = true;
            }
          }

          // const emailTxtValue = document.getElementById('email').value.trim();
          // const emailNew = null;
          // if (emailTxtValue === data.user.email) {
          // } else {
          //   fieldsToUpdate.email = emailTxtValue;
          //   emailNew = emailTxtValue;
          // }
          // // const emailNew = document.getElementById('email').value.trim() == data.user.email ? null : document.getElementById('email').value.trim();
          // const usernameNew = document.getElementById('username').value.trim() == data.user ? null : document.getElementById('username').value.trim();
          // const passwordNew = document.getElementById('password').value == data.user.password ? null : document.getElementById('password').value;
          // const phoneNew = document.getElementById('phone').value.trim() == data.user.phone ? null : document.getElementById('phone').value.trim();
          // const dobNew = document.getElementById('dob').value == data.user.dob ? null : document.getElementById('dob').value;
          // const genderNew = document.querySelector('input[name="gender"]:checked')?.value == data.user.gender ? null : document.querySelector('input[name="gender"]:checked')?.value;

          // // Collect multiple select (Favorite Sports)
          // const favoriteSports = Array.from(document.getElementById('favoriteSports').selectedOptions)
          //                             .map(option => option.value);

          // const aboutNew = document.getElementById('about').value.trim() == data.user.about ? null : document.getElementById('about').value.trim();
          
          // check if any fields are empty / changed
          if (updateNeeded == false) {
            showPopup('No changes detected.', false);
            return;
          }
          else {
            console.log(fieldsToUpdate);
            // UPDATE
            // Add fields that aren't null to fieldsToUpdate list
            $.ajax({
              method: "PUT",
              url: '/editProfile/' + data.user.id,
              processData: false,
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              data: JSON.stringify(fieldsToUpdate)
            })
            .done(function(data, textStatus, jqXHR) {
              console.log("Server Response: " + JSON.stringify(data));
              showPopup(data.message || 'Profile updated.', data.success);
            })
            .fail(function(err) {
              console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
              const errMsg = err.responseJSON?.message || 'Failed to update profile.';
              showPopup(errMsg, data.success);
            });
          }
        })
        .fail(function(err) {
          console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
          const errMsg = err.responseJSON?.message || 'Failed to update profile.';
          showPopup(errMsg, data.success);
        });
      }
      else {
        window.location.href = '/'; // Redirect to home page after logout
        // do we want to do anything else here?
        // i dont think we'll ever get this cuz editProfile is only accessible if logged in
        // but maybe still have something in case
      }
    })
    .catch(error => {
      console.log("ERROR from check login: ", error);
      // what do we want to do here
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
