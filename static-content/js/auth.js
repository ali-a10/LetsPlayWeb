if (window.location.pathname.includes('/account')) {
  $(document).ready(function () {
    checkLoginStatus()
      .then(data => {
        if (data.loggedIn) {
          document.getElementById('login-btn').style.display = 'none';
          document.getElementById('signup-btn').style.display = 'none';
          document.getElementById('logout-btn').style.display = 'block';
          document.getElementById('myaccount-btn').style.display = 'block';
        } else {
          // User is not logged in, display login/signup options
          document.getElementById('login-btn').style.display = 'block';
          document.getElementById('signup-btn').style.display = 'block';
          document.getElementById('logout-btn').style.display = 'none';
        }
      })
      .catch(error => {
        console.log("ERROR from check login: ", error)
      });


    // Check if we're in "create" or "edit" mode based on the current page URL
    const path = window.location.pathname;
    const isSignUpMode = path.includes('create');  // Check if URL contains 'create'
    console.log("IN AUUTH.JS");
    // Update page elements based on the mode
    if (isSignUpMode) {
      document.getElementById('login-link').style.display = "block";
      document.getElementById('save-button').style.display = "none";
    } else {
      document.getElementById('login-link').style.display = "none";
      document.getElementById('save-button').style.display = "block";
    }
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
      if (data.loggedIn) {
        // User is logged in, display user-specific elements
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('signup-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('myaccount-btn').style.display = 'block';
      } else {
        // User is not logged in, display login/signup options
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('signup-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('myaccount-btn').style.display = 'none';
      }
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
function signup(event) {
  event.preventDefault();  // Prevent page from refreshing/navigating

  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  fetch('/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password })
  })
  .then(response => response.json())
  .then(data => {
    alert('Sign up successful!');
  })
  .catch(err => {
    console.error('Error:', err);
  });
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

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      window.location.href = 'index.html';
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
