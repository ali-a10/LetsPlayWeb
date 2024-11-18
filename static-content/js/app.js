// JavaScript to handle form submission
// document.getElementById('contact-form').addEventListener('submit', function (event) {
//     event.preventDefault(); // Prevents form from submitting the traditional way
  
//     const name = document.getElementById('name').value;
//     testF();
//     // const message = document.getElementById('message').value;
  
//     // Basic form validation
//     // if (name) {
//     //   alert('Message sent! Thank you, ' + name + '.');
//     // } else {
//     //   alert('Please fill in both fields.');
//     // }
//   });
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


function clicked(){
  console.log("button clicked!");
  // testF();
  posttest();
}

function CreateEventClicked(){
  
}

function testF(){
  $.ajax({
    method: "GET",
    url: '/testing',
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
  .done(function(data, textStatus, jqXHR) {
    console.log(jqXHR.status + " " + textStatus); 
    console.log("Server Response: " + JSON.stringify(data));
  })
  .fail(function(err) {
    console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
  });
}

function posttest(){
  $.ajax({
    method: "POST",
    url: '/submit',
    data: JSON.stringify({name: "Ali", age: "21"}),
    processData: false,
    contentType: "application/json; charset=utf-8",
    dataType: "json"
  })
  .done(function(data, textStatus, jqXHR) {
    console.log(jqXHR.status + " " + textStatus); 
    console.log("Server Response: " + JSON.stringify(data));
  })
  .fail(function(err) {
    console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
  });
}


/******************************************************************************
 * onload                 FROM csc309/a2/wordlep2/static-content/controller.js
 ******************************************************************************/
$(function(){
	console.log("ready");
  checkLoginStatus()
    .catch(error => {
      console.log("ERROR from check login: ", error)
    });
});