document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const eventIndex = params.get('index');
  
    if (eventIndex !== null) {
      document.getElementById('form-title').innerText = 'Edit Event';
      document.getElementById('event-index').value = eventIndex;
  
      try {
        const res = await fetch('/getEvents');
        const events = await res.json();
  
        const event = events[eventIndex];
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
  
    const index = document.getElementById('event-index').value;
  
    try {
      let res;
      if (index) {
        res = await fetch(`/update-event/${index}`, {
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
        window.location.href = '/events';
      } else {
        alert(result.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      alert('An error occurred while saving the event.');
    }
  });
  