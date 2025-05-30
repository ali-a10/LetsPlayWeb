import { checkLoginStatus, bindLogoutBtn } from './auth.js';

$(document).ready(function() {  
    // getEvents();
    checkLoginStatus()
      .then(data => {
        if (data.loggedIn) {
          document.getElementById('login-btn').style.display = 'none';
          document.getElementById('signup-btn').style.display = 'none';
          document.getElementById('logout-btn').style.display = 'block';
          document.getElementById('myaccount-btn').style.display = 'block';
          document.getElementById('my-event-list').style.display = 'block';
          document.getElementById('events-list').style.display = 'block';
          loadPublicEvents(data.user);
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
});

function getEvents() {
  fetch('/getEvents')
    .then(response => response.json())
    .then(events => {
      const eventsContainer = document.getElementById('events-container');
      eventsContainer.innerHTML = ''; // Clear previous events

      events.forEach((event, index) => {
        const eventBox = document.createElement('div');
        eventBox.className = 'event-box';

        eventBox.innerHTML = `
          <h3>${event.title}</h3>
          <p><strong>Date:</strong> ${event.date}</p>
          <p><strong>Sport:</strong> ${event.sport}</p>
          <p><strong>Price:</strong> ${event.price}</p>
          <button class="btn btn-secondary edit-event-btn" data-index="${index}">Edit</button>
        `;

        eventsContainer.appendChild(eventBox);
      });

      // Add click handlers for edit buttons
      document.querySelectorAll('.edit-event-btn').forEach(button => {
        button.addEventListener('click', function () {
          const eventIndex = this.getAttribute('data-index');
          window.location.href = `/event-edit?id=${eventIndex}`;
        });
      });
    })
    .catch(error => console.error('Error fetching events:', error));
}


document.addEventListener('DOMContentLoaded', () => {
  bindLogoutBtn();
  // loadPublicEvents();
});


function loadPublicEvents(loggedInUser) {
  fetch('/getEvents')
    .then(res => res.json())
    .then(events => {
      const publicEventsContainer = document.getElementById('public-events-container');
      publicEventsContainer.innerHTML = '';
      const myEventsContainer = document.getElementById('events-container');
      myEventsContainer.innerHTML = '';

      const myEvents = events.filter(event => event.createdBy == loggedInUser.id);
      console.log("LENGTHHH ", myEvents.length, events.length);
      if (myEvents.length === 0) {
        myEventsContainer.innerHTML = '<p>You have not created any events yet.</p>';
      }
      else {
        // load my events
        myEvents.forEach((event, index) => {
          const card = document.createElement('div');
          card.className = 'event-card';

          card.innerHTML = `
            <div class="event-card-title">${event.title}</div>
            <div class="event-card-body">
              <div>
                <p><strong>${formatDate(event.date)}</strong> ${event.time || ''}</p>
                <div class="event-icon"><span>[icon]</span> ${event.sport}</div>
                <p><strong>Location</strong></p>
              </div>
              <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
                <div class="event-capacity">${event.currentParticipants || 0}/${event.maxParticipants || 10}</div>
                <div class="event-price">${parseFloat(event.price) === 0 ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}</div>
                <button class="btn btn-secondary edit-event-btn" onclick="window.location.href='/event-edit?id=${event.id}'">Edit</button>
              </div>
            </div>
          `;

          myEventsContainer.appendChild(card);
        });
      }
      // Add click handlers for edit buttons
      // document.querySelectorAll('.edit-event-btn').forEach(button => {
      //   button.addEventListener('click', function () {
      //     const eventId = this.getAttribute('data-index');
      //     window.location.href = `/event-edit?id=${eventId}`;
      //   });
      // });

      // load public events
      events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';

        card.innerHTML = `
          <div class="event-card-title">${event.title}</div>
          <div class="event-card-body">
            <div>
              <p><strong>${formatDate(event.date)}</strong> ${event.time || ''}</p>
              <div class="event-icon">
                <span>[icon]</span> ${event.sport}
              </div>
              <p><strong>Location</strong></p>
              <div class="profile-host">
                <div class="circle"></div>
                <span>${event.createdBy || 'Host'}</span>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
              <div class="event-capacity">${event.currentParticipants || 0}/${event.maxParticipants || 10}</div>
              <div class="event-price">${parseFloat(event.price) === 0 ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}</div>
            </div>
          </div>
        `;

        publicEventsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Failed to load events:', err);
    });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}


// document.getElementById('create-event-btn').addEventListener('click', function () {
//   window.location.href = '/create';
// });



// ///////////////// this is for the submit btn of the visible/invisible form (not used rn)
// document.getElementById('event-form').addEventListener('submit', function(e) {
//     e.preventDefault();  // Prevent page from refreshing/navigating
  
//     // Gather form data
//     const formData = {
//       title: document.getElementById('title').value,
//     //   time: document.getElementById('time').value,
//       date: document.getElementById('date').value,
//       sport: document.getElementById('sport').value,
//     //   location: document.getElementById('location').value,
//       price: document.getElementById('price').value,
//     //   maxParticipants: document.getElementById('max-participants').value,
//     //   currentParticipants: document.getElementById('current-participants').value,
//     //   notes: document.getElementById('notes').value
//     };

  
//     // Send form data to the server using AJAX (Fetch API)
//     // fetch('/create-event', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //   },
//     //   body: JSON.stringify(formData)
//     // })
//     // .then(response => response.json())
//     // .then(data => {
//     //   alert('Event created successfully!');
//     //   console.log('Server response:', data);
//     // })
//     // .catch((error) => {
//     //   console.error('Error:', error);
//     // });

//     $.ajax({
//         method: "POST",
//         url: '/create-event',
//         data: JSON.stringify(formData),
//         contentType: "application/json; charset=utf-8",
//         dataType: "json"
//       })
//       .done(function(data, textStatus, jqXHR) {
//         console.log(jqXHR.status + " " + textStatus); 
//         console.log("Server Response: " + JSON.stringify(data));
//         getEvents();
//       })
//       .fail(function(err) {
//         console.log("Request failed. Status: " + err.status + ", Response: " + JSON.stringify(err.responseJSON));
//       });
//   });
  
/////////////////////////////// the form that was in events.html:
// <div class="container my-5">
//       <form id="event-form" style="display: none;">
//         <!-- Title -->
//         <div class="mb-3">
//           <label for="title" class="form-label">Title</label>
//           <input type="text" class="form-control" id="title" name="title" placeholder="Event Title" required>
//         </div>

//         <!-- Time -->
//         <div class="mb-3">
//           <label for="time" class="form-label">Time</label>
//           <input type="time" class="form-control" id="time" name="time" required>
//         </div>

//         <!-- Date -->
//         <div class="mb-3">
//           <label for="date" class="form-label">Date</label>
//           <input type="date" class="form-control" id="date" name="date" required>
//         </div>

//         <!-- Sport Dropdown -->
//         <div class="mb-3">
//           <label for="sport" class="form-label">Sport</label>
//           <select class="form-select" id="sport" name="sport" required>
//             <option value="">Select a sport</option>
//             <option value="soccer">Soccer</option>
//             <option value="basketball">Basketball</option>
//             <option value="volleyball">Volleyball</option>
//           </select>
//         </div>

//         <!-- Location -->
//         <div class="mb-3">
//           <label for="location" class="form-label">Location</label>
//           <input type="text" class="form-control" id="location" name="location" placeholder="Event Location" required>
//         </div>

//         <!-- Price -->
//         <div class="mb-3">
//           <label for="price" class="form-label">Price</label>
//           <input type="text" class="form-control" id="price" name="price" placeholder="Event Price" required>
//         </div>

//         <!-- Max Number of Participants -->
//         <div class="mb-3">
//           <label for="max-participants" class="form-label">Max Number of Participants</label>
//           <input type="number" class="form-control" id="max-participants" name="maxParticipants" placeholder="Max Participants" min="1" required>
//         </div>

//         <!-- Current Number of Participants -->
//         <div class="mb-3">
//           <label for="current-participants" class="form-label">Current Number of Participants</label>
//           <input type="number" class="form-control" id="current-participants" name="currentParticipants" placeholder="Current Participants" min="0" required>
//         </div>

//         <!-- Notes -->
//         <div class="mb-3">
//           <label for="notes" class="form-label">Notes</label>
//           <textarea class="form-control" id="notes" name="notes" rows="3" placeholder="Any additional notes"></textarea>
//         </div>

//         <!-- Submit Button -->
//         <button type="submit" class="btn btn-primary w-100">Create Event</button>
//       </form>
//     </div>