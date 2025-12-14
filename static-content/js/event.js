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
                        if (event.userId === data.user.id) {
                            document.getElementById('join-event-btn').classList.add('d-none');
                            document.getElementById('event-details').classList.add('event-joined-page');
                            document.getElementById("join-event-btn").removeEventListener("click", handleJoinClick);
                            document.getElementById("leave-event-btn").removeEventListener("click", handleLeaveClick);
                        }
                        else if (Array.isArray(event.usersJoined) && event.usersJoined.includes(data.user.id)) {
                            // if user joined event, hide join button
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
                        
                        // view participants
                        const participantsList = document.getElementById("participants-list");
                        participantsList.innerHTML = "";

                        event.usersJoined.forEach(async userId => {
                            const userRes = await fetch(`/user/${userId}`);
                            const userData = await userRes.json();
                            if (userRes.ok && userData.user) {
                                const li = document.createElement("li");
                                li.className = "list-group-item d-flex justify-content-between align-items-center";
                                if (userId === data.user.id) {
                                    li.innerHTML = `
                                    <span>You</span>
                                    `;
                                } else if (userId === event.userId) {
                                    li.innerHTML = `
                                    <span><a href="/account?user=${userData.user.id}">${userData.user.username} (Host)</a></span>
                                    `;
                                }
                                else {
                                    li.innerHTML = `
                                    <span><a href="/account?user=${userData.user.id}">${userData.user.username}</a></span>
                                    `;
                                }
                                
                                participantsList.prepend(li);
                            } else {
                                // idk idk idk
                            }                            
                        });
                        // add the host's +1s if any to the participants list
                        let usersInList = event.usersJoined.length;
                        while (usersInList < event.currentParticipants) {
                            const li = document.createElement("li");
                            li.className = "list-group-item d-flex justify-content-between align-items-center";
                            li.innerHTML = `<span>Host's +1</span>`;
                            participantsList.prepend(li);
                            usersInList++;
                        }

                        // check if event is full
                        if (event.currentParticipants >= event.maxParticipants) {
                            const joinBtn = document.getElementById("join-event-btn");
                            joinBtn.disabled = true;
                            joinBtn.textContent = "Event Full";
                            joinBtn.style.cursor = "not-allowed";
                            joinBtn.removeEventListener("click", handleJoinClick);
                            joinBtn.style.backgroundColor = "lightgray";
                        }
                        
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


document.getElementById("join-event-btn").addEventListener("click", handleJoinClick);

async function handleJoinClick() {
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
};
  

document.getElementById("leave-event-btn").addEventListener("click", handleLeaveClick);
    
    
async function handleLeaveClick() {
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
};


document.getElementById("view-participants-link").addEventListener("click", (e) => {
    e.preventDefault();
    const modal = new bootstrap.Modal(document.getElementById("participantsModal"));
    modal.show();
});



