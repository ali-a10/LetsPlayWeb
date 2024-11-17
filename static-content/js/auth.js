$(document).ready(function () {
  // Check if we're in "create" or "edit" mode based on the current page URL
  const path = window.location.pathname;
  const isSignUpMode = path.includes('create');  // Check if URL contains 'create'

  // Update page elements based on the mode
  if (isSignUpMode) {
    document.getElementById('login-link').style.display = "block";
    document.getElementById('save-button').style.display = "none";
  } else {
    document.getElementById('login-link').style.display = "none";
    document.getElementById('save-button').style.display = "block";
  }
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
