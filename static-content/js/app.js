import { checkLoginStatus } from './auth.js';

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


/******************************************************************************
 * onload                 FROM csc309/a2/wordlep2/static-content/controller.js
 ******************************************************************************/
$(function(){
	console.log("ready");
  checkLoginStatus()
    .then(data => {
      if (data.loggedIn) {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('signup-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        document.getElementById('myaccount-btn').style.display = 'block';
        document.getElementById('welcome-msg').innerText = `Welcome, ${data.user.username}!`;
      } else {
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('signup-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        document.getElementById('welcome-msg').innerText = '';
      }
    })
    .catch(error => {
      console.log("ERROR from check login: ", error)
    });
});