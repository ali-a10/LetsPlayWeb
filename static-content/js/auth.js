if (window.location.pathname.includes('/account')) {
  $(document).ready(function () {
    let user = null;
    checkLoginStatus()
      .then(data => {
        console.log("DATA ON LINE 7: ", data);
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
        const isSignUpMode = path.includes('create');  // Check if URL contains 'create'
        // Update page elements based on the mode
        
        if (isSignUpMode) {
          // document.getElementById('signup-btns');
          // document.getElementById('save-btns').classList;
          document.getElementById('account-form').addEventListener('submit', signup);
        } 
        else {
          document.getElementById('signup-btns').classList.add('d-none');
          document.getElementById('save-btns').classList.remove('d-none');
          document.getElementById('email').value = user.email;
          document.getElementById('username').value = user.username;
          document.getElementById('password').value = user.password;
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
      console.log(jqXHR.status + " " + textStatus); 
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
    const response = await fetch('/signup', {
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

function editProfile(event) {
  event.preventDefault();  // Prevent page from refreshing/navigating
  
  // somehow check if textboxes have changed

  // if so:
  let currUserInfo = null;
  checkLoginStatus()
    .then(data => {
      if (data.loggedIn) {
        currUserId = data.user.id;
        $.ajax({
          method: "GET",
          url: '/user/' + data.user.id,
          processData: false,
          contentType: "application/json; charset=utf-8",
          dataType: "json"
        })
        .done(function(data, textStatus, jqXHR) {
          // Collect form fields
          const username = document.getElementById('username').value.trim() == data.user ? null : document.getElementById('username').value.trim();
          const email = document.getElementById('email').value.trim() == data.user.email ? null : document.getElementById('email').value.trim();
          const password = document.getElementById('password').value == data.user.password ? null : document.getElementById('password').value;
          const phone = document.getElementById('phone').value.trim() == data.user.phone ? null : document.getElementById('phone').value.trim();
          const dob = document.getElementById('dob').value == data.user.dob ? null : document.getElementById('dob').value;
          const gender = document.querySelector('input[name="gender"]:checked')?.value == data.user.gender ? null : document.querySelector('input[name="gender"]:checked')?.value;

          // // Collect multiple select (Favorite Sports)
          // const favoriteSports = Array.from(document.getElementById('favoriteSports').selectedOptions)
          //                             .map(option => option.value);

          const about = document.getElementById('about').value.trim() == data.user.about ? null : document.getElementById('about').value.trim();
          
          if (!username && !email && !password && !phone && !dob && !gender && !about) {
            // UPDATE
            $.ajax({
              method: "PUT",
              url: '/editProfile/' + data.user.id,
              processData: false,
              contentType: "application/json; charset=utf-8",
              dataType: "json",
              data: JSON.stringify({ newEmail, newUsername })
            })
            .done(function(data, textStatus, jqXHR) {
              console.log(jqXHR.status + " " + textStatus); 
              console.log("Server Response: " + JSON.stringify(data));
              showPopup(data.message || 'Profile updated.', data.success);
            })
            .fail(function(err) {
              console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
              const errMsg = err.responseJSON?.message || 'Failed to update profile.';
              showPopup(errMsg, data.success);
            });
          }
          else {
            showPopup('No changes detected.', false);
          }

          console.log(jqXHR.status + " " + textStatus); 
          console.log("Server Response: " + JSON.stringify(data));
          showPopup(data.message || 'Profile updated.', data.success);
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

// helper for popup when account info is updated (or failed to update)
function showPopup(message, isSuccess) {
  const popup = document.getElementById('notification-popup');
  popup.textContent = message;
  popup.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // Green or red
  popup.style.display = 'block';

  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}
