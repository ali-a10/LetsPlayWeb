import { checkLoginStatus, bindLogoutBtn } from './auth.js';

$(document).ready(function() {  
    // getEvents();
    checkLoginStatus()
      .then(data => {
        if (data.loggedIn) {
          // document.getElementById('login-btn').style.display = 'none';
          // document.getElementById('signup-btn').style.display = 'none';
          document.getElementById('logout-btn').classList.remove('d-none');
          document.getElementById('myaccount-btn').classList.remove('d-none');
          document.getElementById('my-event-list').style.display = 'block';
          document.getElementById('joined-events-list').style.display = 'block';
          document.getElementById('events-list').style.display = 'block';
          document.getElementById('events-hero-btn').addEventListener('click', () => {
            window.location.href = '/event-edit';
          });

          loadEvents(data.user)
            .then((events) => {
              let publicEvents = events.filter(event => event.userId != data.user.id &&
                (!Array.isArray(event.usersJoined) || !event.usersJoined.includes(data.user.id))
              );
              handleFilterUI(publicEvents);
            });

        } else {
            // User is not logged in, display login/signup options
            document.getElementById('login-btn').classList.remove('d-none');
            document.getElementById('signup-btn').classList.remove('d-none');
            // document.getElementById('logout-btn').style.display = 'none';
            document.getElementById('events-hero-btn').addEventListener('click', () => {
              window.location.href = '/login';
            });
        }
      })
      .catch(error => {
        console.log("ERROR from check login: ", error)
      });
});


document.addEventListener('DOMContentLoaded', () => {
  bindLogoutBtn();
  // loadPublicEvents();
});


function loadEvents(loggedInUser) {
  return fetch('/getEvents')
    .then(res => res.json())
    .then(events => {
      const myEventsContainer = document.getElementById('events-container');
      myEventsContainer.innerHTML = '';
      const joinedEventsContainer = document.getElementById('joined-events-container');
      joinedEventsContainer.innerHTML = '';
      const publicEventsContainer = document.getElementById('public-events-container');
      publicEventsContainer.innerHTML = '';
      

      const myEvents = events.filter(event => event.userId == loggedInUser.id);
      // events the user has NOT joined and did not create
      const publicEvents = events.filter(event => event.userId != loggedInUser.id &&
        (!Array.isArray(event.usersJoined) || !event.usersJoined.includes(loggedInUser.id))
      );
      const joinedEvents = events.filter(event => Array.isArray(event.usersJoined) && event.usersJoined.includes(loggedInUser.id));
      if (myEvents.length === 0) {
        myEventsContainer.innerHTML = '<p>You have not created any events yet.</p>';
      }
      else {
        // load my events
        myEvents.forEach((event, index) => {
          const card = document.createElement('div');
          // card.className = 'event-card';

          card.innerHTML = `
            <div class="container">
              <div class="row">
                <div class="col-2 event-card-img placeholder mb-2"></div>

                <div class="col event-card shadow-sm p-3 mb-3 rounded-end d-flex justify-content-between align-items-center h-100">
                  <div class="d-flex flex-column align-items-start">
                    <h4 class="text-teal mb-2">${event.title}</h4>
                    <p class="mb-1 text-muted">
                      <strong>${formatDate(event.date)}</strong> • ${event.time || ''}
                    </p>
                    <p class="mb-1">
                      <i class="bi bi-geo-alt-fill text-teal"></i> <strong>${event.location || 'Location TBD'}</strong>
                    </p>
                    <p class="mb-1">
                      <i class="bi bi-dribbble text-teal"></i> ${event.activity}
                    </p>
                  </div>

                  <div class="text-end">
                    <div class="event-capacity fw-semibold mb-1 fs-5">
                      <i class="bi bi-people-fill text-teal"></i> ${event.currentParticipants || 0}/${event.maxParticipants || 10}
                    </div>
                    <div class="event-price mb-2">
                      <span class="badge bg-teal text-white fs-6">
                        ${event.isFree === true ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`}
                      </span>
                    </div>
                    <button class="btn-outline-teal fs-5"
                      onclick="window.location.href='/event-edit?id=${event.id}'">
                      Edit
                    </button>
                  </div>
                </div>
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

      if (joinedEvents.length === 0) {
        joinedEventsContainer.innerHTML = '<p>You have not joined any events yet.</p>';
      }
      else {
        // load public events
        joinedEvents.forEach(event => {
          const card = document.createElement('div');
          // card.className = 'event-card';
          card.innerHTML = `
              <div class="container">
                <div class="row">
                  <div class="col-2 event-card-img placeholder mb-2"></div>

                  <div class="col event-card joined-right-border shadow-sm p-3 mb-3 rounded-end d-flex justify-content-between align-items-center h-100">
                    <div class="d-flex flex-column align-items-start">
                      <h4 class="text-teal mb-2">${event.title}</h4>
                      <p class="mb-1 text-muted">
                        <strong>${formatDate(event.date)}</strong> • ${event.time || ''}
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-geo-alt-fill text-teal"></i> <strong>${event.location || 'Location TBD'}</strong>
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-dribbble text-teal"></i> ${event.activity}
                      </p>
                    </div>

                    <div class="text-end">
                      <div class="event-joined mb-2">
                        <span class="badge bg-green text-white fs-5">
                          Joined
                        </span>
                      </div>
                      <div class="event-capacity fw-semibold mb-2 fs-5">
                        <i class="bi bi-people-fill text-teal"></i> ${event.currentParticipants || 0}/${event.maxParticipants || 10}
                      </div>
                      <button class="btn-view-event fs-5"
                        onclick="window.location.href='/event?id=${event.id}'">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>  
          `;

          joinedEventsContainer.appendChild(card);
        });
      }


      if (publicEvents.length === 0) {
        publicEventsContainer.innerHTML = '<p>No public events available at the moment.</p>';
      }
      else {
        // load public events
        publicEvents.forEach(event => {
          const card = document.createElement('div');
          // card.className = 'event-card';
          card.innerHTML = `
              <div class="container">
                <div class="row">
                  <div class="col-2 event-card-img placeholder mb-2"></div>

                  <div class="col event-card shadow-sm p-3 mb-3 rounded-end d-flex justify-content-between align-items-center h-100">
                    <div class="d-flex flex-column align-items-start">
                      <h4 class="text-teal mb-2">${event.title}</h4>
                      <p class="mb-1 text-muted">
                        <strong>${formatDate(event.date)}</strong> • ${event.time || ''}
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-geo-alt-fill text-teal"></i> <strong>${event.location || 'Location TBD'}</strong>
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-dribbble text-teal"></i> ${event.activity}
                      </p>
                    </div>

                    <div class="text-end">
                      <div class="event-capacity fw-semibold mb-1 fs-5">
                        <i class="bi bi-people-fill text-teal"></i> ${event.currentParticipants || 0}/${event.maxParticipants || 10}
                      </div>
                      <div class="event-price mb-2">
                        <span class="badge bg-teal text-white fs-6">
                          ${event.isFree === true ? "Free" : `$${parseFloat(event.price).toFixed(2)}`}
                        </span>
                      </div>
                      <button class="btn-view-event fs-5"
                        onclick="window.location.href='/event?id=${event.id}'">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>  
          `;

          publicEventsContainer.appendChild(card);
        });
      }
      return events;
    })
    .catch(err => {
      console.error('Failed to load events:', err);
    });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}


function renderFilteredEvents(events) {
  const container = document.getElementById('public-events-container');
  container.innerHTML = '';
  if (events.length === 0) {
    container.innerHTML = '<p class="text-muted mt-3">No events match your filters.</p>';
    return;
  }
  events.forEach(event => {
    const card = document.createElement('div');
    card.innerHTML = `
              <div class="container">
                <div class="row">
                  <div class="col-2 event-card-img placeholder mb-2"></div>

                  <div class="col event-card shadow-sm p-3 mb-3 rounded-end d-flex justify-content-between align-items-center h-100">
                    <div class="d-flex flex-column align-items-start">
                      <h4 class="text-teal mb-2">${event.title}</h4>
                      <p class="mb-1 text-muted">
                        <strong>${formatDate(event.date)}</strong> • ${event.time || ''}
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-geo-alt-fill text-teal"></i> <strong>${event.location || 'Location TBD'}</strong>
                      </p>
                      <p class="mb-1">
                        <i class="bi bi-dribbble text-teal"></i> ${event.activity}
                      </p>
                    </div>

                    <div class="text-end">
                      <div class="event-capacity fw-semibold mb-1 fs-5">
                        <i class="bi bi-people-fill text-teal"></i> ${event.currentParticipants || 0}/${event.maxParticipants || 10}
                      </div>
                      <div class="event-price mb-2">
                        <span class="badge bg-teal text-white fs-6">
                          ${event.isFree === true ? "Free" : `$${parseFloat(event.price).toFixed(2)}`}
                        </span>
                      </div>
                      <button class="btn-view-event fs-5"
                        onclick="window.location.href='/event?id=${event.id}'">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>  
          `;
    container.appendChild(card);
  });
}


function handleFilterUI(publicEvents) {
  const activityInput = document.getElementById('filter-activity');
  const suggestionsList = document.getElementById('activity-suggestions');
  const applyBtn = document.getElementById('apply-filters-btn');
  const clearBtn = document.getElementById('clear-filters-btn');

  // #region code for activity autocomplete
  const activityOptions = ["Soccer", "Basketball", "Volleyball", "Tennis", "Hockey", "Baseball", "Running", "Pickleball"];

  activityInput.addEventListener('input', () => {
    const inputValue = activityInput.value.toLowerCase();
    suggestionsList.innerHTML = ''; // Clear old suggestions

    if (inputValue.length === 0) return;

    suggestionsList.classList.remove('d-none');
    const filteredActivities = activityOptions.filter(a => a.toLowerCase().includes(inputValue));

    filteredActivities.forEach(activity => {
      const li = document.createElement('li');
      li.textContent = activity;
      li.classList.add('list-group-item', 'list-group-item-action');
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        activityInput.value = activity;
        suggestionsList.innerHTML = '';
      });
      suggestionsList.appendChild(li);
    });
  });

  // #endregion
  
  // #region Apply filters
  applyBtn.addEventListener('click', () => {
    const filters = {
      activity: activityInput.value.trim().toLowerCase(),
      level: document.getElementById('filter-level').value,
      minPrice: parseFloat(document.getElementById('filter-price-min').value) || 0,
      maxPrice: parseFloat(document.getElementById('filter-price-max').value) || Infinity,
      minSpots: parseInt(document.getElementById('filter-spots').value) || 0,
      sortBy: document.querySelector('input[name="sortOption"]:checked')?.value
    };

    const filtered = publicEvents
      .filter(e => (!filters.activity || e.activity.toLowerCase().includes(filters.activity)))
      .filter(e => (!filters.level || e.level === filters.level))
      .filter(e => (e.price >= filters.minPrice && e.price <= filters.maxPrice))
      .filter(e => ((e.maxParticipants - (e.currentParticipants || 0)) >= filters.minSpots));

    if (filters.sortBy === 'date') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filters.sortBy === 'price') {
      filtered.sort((a, b) => a.price - b.price);
    }
    renderFilteredEvents(filtered);
  });

  // #endregion

  // #region Clear filters
  clearBtn.addEventListener('click', () => {
    activityInput.value = '';
    document.getElementById('filter-level').value = '';
    document.getElementById('filter-price-min').value = '';
    document.getElementById('filter-price-max').value = '';
    document.getElementById('filter-spots').value = '';
    document.querySelectorAll('input[name="sortOption"]').forEach(radio => radio.checked = false);
    renderFilteredEvents(publicEvents);
  });
  // #endregion
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