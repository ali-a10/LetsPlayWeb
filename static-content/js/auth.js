// Show Sign-up Form and hide Login Form
document.getElementById('show-signup').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent link from navigating
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-link').style.display = 'block';
    document.getElementById('show-signup').parentNode.style.display = 'none'; // Hide "Don't have an account" link
  });
  
  // Show Login Form and hide Sign-up Form
  document.getElementById('show-login').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent link from navigating
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('show-signup').parentNode.style.display = 'block'; // Show "Don't have an account" link
  });
  
  // Sign up function
  function signup(event) {
    event.preventDefault();
  
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
    event.preventDefault();
  
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
  