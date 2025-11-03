import { checkLoginStatus, bindLogoutBtn, showPopup } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    checkLoginStatus()
        .then(async data => {
            if (data.loggedIn) {
                document.getElementById('logout-btn').classList.remove('d-none');
                document.getElementById('myaccount-btn').classList.remove('d-none');                
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
            
                        // if user joined event, hide join button
                        if (Array.isArray(event.usersJoined) && event.usersJoined.includes(data.user.id)) {
                            document.getElementById('join-event-btn').classList.add('d-none');
                            document.getElementById('leave-event-btn').classList.remove('d-none');
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
            } else {
                // User is not logged in, display login/signup options
                document.getElementById('login-btn').classList.remove('d-none');
                document.getElementById('signup-btn').classList.remove('d-none');
            }
        })
        .catch(error => {
            console.log("ERROR from check login: ", error)
        });
});


document.getElementById("join-event-btn").addEventListener("click", async () => {
    try {
        checkLoginStatus()
        .then(async data => {
            if (data.loggedIn) {
                document.getElementById('logout-btn').classList.remove('d-none');
                document.getElementById('myaccount-btn').classList.remove('d-none');
                const params = new URLSearchParams(window.location.search);
                const eventId = params.get('id');
                const userId = data.user.id;
            
                const response = await fetch("/join", {
                    method: "PUT",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ eventId, userId })
                });
        
                const data2 = await response.json();
            
                if (response.ok && data2.success) {
                    showPopup("Successfully joined the event!", true);
                    setTimeout(() => (window.location.href = '/events'), 2000);
                } else {
                    showPopup(data2.message || "Unable to join event.", false);
                }
            } else {
                // User is not logged in, display login/signup options
                document.getElementById('login-btn').classList.remove('d-none');
                document.getElementById('signup-btn').classList.remove('d-none');
                alert("You must be logged in to join an event.");
                return;
            }
        })
        .catch(error => {
            console.log("ERROR from check login: ", error)
        });
    
    } catch (err) {
        console.error("Error joining event:", err);
        showPopup("Something went wrong. Please try again later.", false);
    }
});
  

document.getElementById("leave-event-btn").addEventListener("click", async () => {
    try {
        checkLoginStatus()
        .then(async data => {
            if (data.loggedIn) {
                document.getElementById('logout-btn').classList.remove('d-none');
                document.getElementById('myaccount-btn').classList.remove('d-none');
                const params = new URLSearchParams(window.location.search);
                const eventId = params.get('id');
                const userId = data.user.id;
            
                const response = await fetch("/leave", {
                    method: "PUT",
                    headers: {
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ eventId, userId })
                });
        
                const data2 = await response.json();
            
                if (response.ok && data2.success) {
                    showPopup("Successfully left the event!", false);
                    setTimeout(() => (window.location.href = '/events'), 1500);
                } else {
                    showPopup(data2.message || "Unable to leave event.", false);
                }
            } else {
                // User is not logged in, display login/signup options
                document.getElementById('login-btn').classList.remove('d-none');
                document.getElementById('signup-btn').classList.remove('d-none');
                alert("You must be logged in to leave the event.");
                return;
            }
        })
        .catch(error => {
            console.log("ERROR from check login: ", error)
        });
    
    } catch (err) {
        console.error("Error leaving event:", err);
        showPopup("Something went wrong. Please try again later.", false);
    }
});
  