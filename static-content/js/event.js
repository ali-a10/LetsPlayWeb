import { checkLoginStatus, bindLogoutBtn } from './auth.js';

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
    
    if (eventId !== null) {  // load event info
        try {
            const res = await fetch('/getEvents');
            const events = await res.json();
    
            const event = events.find(e => e.id === parseInt(eventId));
            const detailsDiv = document.getElementById('event-details');
            if (!event) {
                // handle this better
                detailsDiv.innerHTML = '<p class="text-danger">Event not found.</p>';
                return;
            }

            detailsDiv.innerHTML = `
                <h2>${event.title}</h2>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Sport:</strong> ${event.sport}</p>
                <p><strong>Location:</strong> ${event.location || 'Not specified'}</p>
                <p><strong>Price:</strong> ${event.price}</p>
                <p><strong>Max Participants:</strong> ${event.maxParticipants || 'N/A'}</p>
                <p><strong>Current Participants:</strong> ${event.currentParticipants || 0}</p>
                <p><strong>Notes:</strong> ${event.notes || 'None'}</p>
            `;
        } catch (err) {
            console.error('Error loading event:', err);
        }
    }
});

