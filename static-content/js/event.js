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
                            document.getElementById('event-details').classList.add('event-joined-page');
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
                        // fetch creator's name
                        try {
                            const userRes = await fetch(`/user/${event.userId}`);
                            const userData = await userRes.json();
                            if (userRes.ok && userData.user) {
                                document.getElementById('event-creator-name').innerText = userData.user.username;
                                // link to creator's account page
                                document.getElementById('event-creator-name').href = `/account?user=${userData.user.id}`;
                            } else {
                                document.getElementById('event-creator-name').innerText = 'An error occurred';
                            }
                        } catch (err) {
                            document.getElementById('event-creator-name').innerText = 'An error occurred';
                        }
                        document.getElementById('event-title1').innerText = event.title;
                        document.getElementById('event-description1').innerText = event.description;
                        document.getElementById('event-date1').innerText = event.date;
                        document.getElementById('event-time1').innerText = event.time;
                        document.getElementById('event-location1').innerText = event.location;
                        document.getElementById('event-activity1').innerText = event.activity;
                        document.getElementById('event-price1').innerText = event.isFree === true ? 'Free' : `$${parseFloat(event.price).toFixed(2)}`;
                        document.getElementById('event-ageGroup1').innerText = event.ageGroup || '-';
                        document.getElementById('event-level1').innerText = event.level || 'All levels';
                        document.getElementById('event-currentParticipants1').innerText = event.currentParticipants;
                        document.getElementById('event-maxParticipants1').innerText = event.maxParticipants || 'No limit';
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

// const viewParticipantsLink = document.getElementById("view-participants-link");
// const participantsList = document.getElementById("participants-list");
// const participantsCount = document.getElementById("participants-count");

// const params = new URLSearchParams(window.location.search);
// const eventId = params.get("id");

// viewParticipantsLink.addEventListener("click", async (e) => {
//   e.preventDefault();

//   try {
//     const res = await fetch(`/events/${eventId}/participants`);
//     const data = await res.json();

//     participantsList.innerHTML = "";

//     data.participants.forEach(user => {
//       const li = document.createElement("li");
//       li.className = "list-group-item d-flex justify-content-between align-items-center";
//       li.innerHTML = `
//         <span>${user.username}</span>
//       `;
//       participantsList.appendChild(li);
//     });

//     const modal = new bootstrap.Modal(
//       document.getElementById("participantsModal")
//     );
//     modal.show();

//   } catch (err) {
//     console.error("Failed to load participants", err);
//   }
// });
