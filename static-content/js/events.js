$(document).ready(function() {  
    // Call fetchEvents on page load
    getEvents();
});

// Fetch events from the server
function getEvents() {
    fetch('/events')
      .then(response => response.json())
      .then(events => {
        const eventsContainer = document.getElementById('events-container');
        eventsContainer.innerHTML = ''; // Clear previous events

        // Loop through the events and create an event box for each one
        events.forEach(event => {
          const eventBox = document.createElement('div');
          eventBox.className = 'event-box';

          eventBox.innerHTML = `
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${event.date}</p>
            <p><strong>Sport:</strong> ${event.sport}</p>
            <p><strong>Price:</strong> ${event.price}</p>
          `;

          // Append the event box to the container
          eventsContainer.appendChild(eventBox);
        });
      })
      .catch(error => console.error('Error fetching events:', error));
  }
  

// Show/hide the event form when the button is clicked
$('#show-form-btn').on('click', function() {
    $('#event-form').toggle(); // Toggle visibility of the form
});



document.getElementById('event-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the default form submission
  
    // Gather form data
    const formData = {
      title: document.getElementById('title').value,
    //   time: document.getElementById('time').value,
      date: document.getElementById('date').value,
      sport: document.getElementById('sport').value,
    //   location: document.getElementById('location').value,
      price: document.getElementById('price').value,
    //   maxParticipants: document.getElementById('max-participants').value,
    //   currentParticipants: document.getElementById('current-participants').value,
    //   notes: document.getElementById('notes').value
    };

  
    // Send form data to the server using AJAX (Fetch API)
    // fetch('/create-event', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   alert('Event created successfully!');
    //   console.log('Server response:', data);
    // })
    // .catch((error) => {
    //   console.error('Error:', error);
    // });

    $.ajax({
        method: "POST",
        url: '/create-event',
        data: JSON.stringify(formData),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
      })
      .done(function(data, textStatus, jqXHR) {
        console.log(jqXHR.status + " " + textStatus); 
        console.log("Server Response: " + JSON.stringify(data));
        getEvents();
      })
      .fail(function(err) {
        console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
      });
  });
  