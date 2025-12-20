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
          getPastEventsByUser(user.id);
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
            
            const rateSection = document.getElementById('rate-user-section');
            initRatingSection();
            rateSection.classList.remove('d-none');

            console.log("viewing user id: ", userId);
            getUser(userId)
            .done(function(data, textStatus, jqXHR) {
                const user = data.user;
                const allowedFields = ['username', 'favoriteSports', 'about', 'averageRating', 'ratings'];
                Object.keys(user).forEach(key => {
                  const element = document.getElementById(key);
                  if (allowedFields.includes(key)) {
                    if (element) {
                      if (key === 'averageRating') {
                        element.innerHTML = user[key] ? user[key].toFixed(2) : 'N/A';
                      }
                      else if (key === 'ratings') {
                        // get length of ratings object
                        const ratingsCount = Object.keys(user[key]).length;
                        element.innerHTML = ratingsCount;
                      }
                      else {
                        element.value = user[key];
                        element.disabled = true; // disable the input field
                      }
                    }
                    } else if (key === 'id' || key === 'eventsCreated' || key === 'eventsJoined' || key === 'ratings') {
                      // do nothing
                    } else {
                      // hide the element
                      console.log("hiding element for key: ", element, key);
                      element.parentElement.classList.add('d-none');
                    }
                });
                // Hide signup and save buttons
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
                  else if (key === 'averageRating') {
                    const ratingElement = document.getElementById('averageRating');
                    ratingElement.innerHTML = user[key] ? user[key].toFixed(2) : 'N/A';
                  }
                  else if (key === 'ratings') {
                    const ratingElement = document.getElementById('ratings');
                    // get length of ratings object
                    const ratingsCount = Object.keys(user[key]).length;
                    ratingElement.innerHTML = ratingsCount;
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
            }
            else if (field === 'favoriteSports') {
              // get all divs inside selectedActivities
              const selectedDivs = document.getElementById('selectedActivities').children;
              const selectedSports = [];
              for (const div of selectedDivs) {
                // get the text content without the 'x' character
                selectedSports.push(div.textContent.slice(0, -1).trim());
              }
              newValue = selectedSports
            }
            else {
              newValue = document.getElementById(field).value.trim();
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
              showPopup(errMsg, false);
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


function getPastEventsByUser(userId) {
  // get past events
  $.ajax({
    method: "GET",
    url: `/pastevents/user/${userId}`,
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
  .done(function(data, textStatus, jqXHR) {
    // populate past events section
    let pastEventsContainer = document.getElementById('past-events-created-container');
    if (data.pastEvents.length === 0) {
      pastEventsContainer.innerHTML = '<p>You have not created any events yet.</p>';
    }
    data.pastEvents.forEach(event => {
      const card = document.createElement('div');

      card.innerHTML = `
            <div class="container">
              <div class="row">
                <div class="col-2 event-card-img placeholder mb-2"></div>

                <div class="col event-card shadow-sm p-3 mb-3 rounded-end d-flex justify-content-between align-items-center h-100">
                  <div class="d-flex flex-column align-items-start">
                    <h4 class="text-teal mb-2">${event.title}</h4>
                    <p class="mb-1 text-muted">
                      <strong>${event.date}</strong> • ${event.time || ''}
                    </p>
                    <p class="mb-1">
                      <i class="bi bi-geo-alt-fill text-teal"></i> <strong>${event.location || 'Location TBD'}</strong>
                    </p>
                    <p class="mb-1">
                      <i class="bi bi-dribbble text-teal"></i> ${event.activity}
                    </p>
                  </div>

                  <div class="text-end">
                    <div class="event-capacity fw-semibold mb-1 fs-5">
                      <i class="bi bi-people-fill text-teal"></i> ${event.currentParticipants || 0}/${event.maxParticipants || 10}
                    </div>
                    <div class="event-price mb-2">
                      <span class="badge bg-teal text-white fs-6">
                        ${event.isFree === true ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>  
          `;
      pastEventsContainer.appendChild(card);
    });
  })
  .fail(function(err) {
    console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
  });
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


// RATINGS
let selectedRating = 0;

function initRatingSection() {
  const stars = document.querySelectorAll('.star');
  const ratingText = document.getElementById('rating-text');
  const submitBtn = document.getElementById('submit-rating-btn');
  const successMsg = document.getElementById('rating-success');
  // Hover behavior
  stars.forEach(star => {
    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      highlightStarsToggle(value, stars);
      ratingText.textContent = `${value} out of 5`;
    });

    star.addEventListener('mouseleave', () => {
      highlightStarsToggle(selectedRating, stars);
      ratingText.textContent = selectedRating
        ? `${selectedRating} out of 5`
        : '';
    });

    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      submitBtn.disabled = false;
      highlightStarsToggle(selectedRating, stars);
      ratingText.textContent = `${selectedRating} out of 5`;
    });
  });


  // Submit rating (backend call later)
  submitBtn.addEventListener('click', async () => {
    if (!selectedRating) return;

    // collect data
    const urlParams = new URLSearchParams(window.location.search);
    const ratedUserId = urlParams.get('user');
    const ratingJson = { hostId: ratedUserId, rating: selectedRating };

    // 🔜 Later: POST to backend
    // await fetch('/rate-user', {...})
    $.ajax({
      method: "PUT",
      url: '/rate-host',
      processData: false,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      data: JSON.stringify(ratingJson)
    })
    .done(function(data, textStatus, jqXHR) {
      console.log("Server Response: " + JSON.stringify(data));
      showPopup(data.message || 'Profile updated.', data.success);
    })
    .fail(function(err) {
      console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
      const errMsg = err.responseJSON?.message || 'Failed to update profile.';
      showPopup(errMsg, false);
    });

    submitBtn.disabled = true;
    successMsg.classList.remove('d-none');
    setTimeout(() => {
      successMsg.classList.add('d-none');
    }, 3000);
  });
};


function highlightStarsToggle(value, stars) {
  stars.forEach(star => {
    star.classList.toggle('active', parseInt(star.dataset.value) <= value);
  });
}
