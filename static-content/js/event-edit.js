import { checkLoginStatus, bindLogoutBtn } from './auth.js';

// $(document).ready(function() {  
//     // getEvents();
    
      
// });

document.addEventListener('DOMContentLoaded', async () => {
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

    bindLogoutBtn();

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    console.log("params: ",params, eventId);

    // delete event btn
    const deleteBtn = document.getElementById('delete-event');
    
    if (eventId !== null) {  // load event info
        document.getElementById('form-title').innerText = 'Edit Event';
        // document.getElementById('event-index').value = eventId;

        deleteBtn.style.display = 'inline-block';
        deleteBtn.addEventListener('click', () => handleDeleteEvent(eventId));

        try {
            const res = await fetch('/getEvents');
            const events = await res.json();
    
            const event = events.find(e => e.id === parseInt(eventId));
            if (event) {
            document.getElementById('title').value = event.title;
            document.getElementById('date').value = event.date;
            document.getElementById('sport').value = event.sport;
            document.getElementById('price').value = event.price;
            }
        } catch (err) {
            console.error('Error loading event:', err);
        }
    }
    else {  // we're in create event mode
        deleteBtn.style.display = 'none';
    }
});
  
// Handle form submission
document.getElementById('event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const event = {
        title: document.getElementById('title').value,
        date: document.getElementById('date').value,
        sport: document.getElementById('sport').value,
        price: document.getElementById('price').value,
    };
  
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    try {
        let res;
        if (eventId) {
            res = await fetch(`/update-event/${eventId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            });
        } else {
            res = await fetch('/post-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
            });
        }
  
        const result = await res.json();
        console.log("RES",res);
    
        if (res.ok) {
            showPopup('Event created successfully!', true);
        } else {
            showPopup(result.error || 'Something went wrong', false);
        }
      
    } catch (err) {
        console.error('Error saving event:', err);
        showPopup('An error occurred while saving the event.', false);
    }
});
  

function showPopup(message, isSuccess) {
    const popup = document.getElementById('notification-popup');
    popup.textContent = message;
    popup.style.backgroundColor = isSuccess ? '#28a745' : '#dc3545'; // green or red
    popup.style.display = 'block';
  
    setTimeout(() => {
        popup.style.display = 'none';
    }, 5000);
}


async function handleDeleteEvent(eventId) {
    if (!eventId) return;
  
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        const res = await fetch(`/delete-event/${eventId}`, {
          method: 'DELETE'
        });
  
        const result = await res.json();
  
        if (res.ok) {
          showPopup('Event deleted successfully', true);
          setTimeout(() => {
            window.location.href = '/events';
          }, 1500);
        } else {
          showPopup(result.message || 'Failed to delete event', false);
        }
      } catch (err) {
        console.error('Delete failed:', err);
        showPopup('Error deleting event', false);
      }
    }
  }
  

  