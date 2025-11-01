import { checkLoginStatus, bindLogoutBtn } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    checkLoginStatus()
        .then(data => {
            if (data.loggedIn) {
                document.getElementById('logout-btn').classList.remove('d-none');
                document.getElementById('myaccount-btn').classList.remove('d-none');                
            } else {
                // User is not logged in, display login/signup options
                document.getElementById('login-btn').classList.remove('d-none');
                document.getElementById('signup-btn').classList.remove('d-none');
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

            if (!event) {
                document.getElementById('error-div').classList.remove('d-none');
                return;
            }

            document.getElementById('event-title').innerText = event.title;
            document.getElementById('event-description').innerText = event.description;
            document.getElementById('event-date').innerText = event.date;
            document.getElementById('event-time').innerText = event.time;
            document.getElementById('event-location').innerText = event.location;
            document.getElementById('event-activity').innerText = event.activity;
            document.getElementById('event-price').innerText = event.isFree === true ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`;
            document.getElementById('event-ageGroup').innerText = event.ageGroup || '-';
            document.getElementById('event-level').innerText = event.level || 'All levels';
            document.getElementById('event-currentParticipants').innerText = event.currentParticipants;
            document.getElementById('event-maxParticipants').innerText = event.maxParticipants || 'No limit';
        } catch (err) {
            console.log('Error loading event:', err);
        }
    }
});

