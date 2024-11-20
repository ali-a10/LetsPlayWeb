import { checkLoginStatus, bindLogoutBtn } from './auth.js';

// event listener that waits for the DOM to fully load before running the callback function bindLogoutBtn
document.addEventListener('DOMContentLoaded', () => {
  bindLogoutBtn();
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
        // there's no welcome-msg in about.html, so this will cause an error in the browser console
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