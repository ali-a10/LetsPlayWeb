// JavaScript to handle form submission
document.getElementById('contact-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevents form from submitting the traditional way
  
    const name = document.getElementById('name').value;
    const message = document.getElementById('message').value;
  
    // Basic form validation
    if (name && message) {
      alert('Message sent! Thank you, ' + name + '.');
    } else {
      alert('Please fill in both fields.');
    }
  });
  