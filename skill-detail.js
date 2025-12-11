let selectedSlot = null;

function selectSlot(slotElement) {
  // Remove previous selection
  document.querySelectorAll('.timeslot').forEach(slot => {
    slot.classList.remove('selected');
  });
  
  // Select current slot
  slotElement.classList.add('selected');
  selectedSlot = {
    date: slotElement.querySelector('.date').textContent,
    time: slotElement.querySelector('.time').textContent,
    cost: slotElement.querySelector('.cost').textContent
  };
  
  // Enable book button
  document.getElementById('bookBtn').disabled = false;
}

function startChat() {
  alert('Chat feature coming soon! You can message Alex Johnson directly.');
}

function bookSession() {
  if (!selectedSlot) {
    alert('Please select a time slot first.');
    return;
  }
  
  const confirmation = confirm(
    `Book session for ${selectedSlot.date} at ${selectedSlot.time}?\n` +
    `Cost: ${selectedSlot.cost}\n\n` +
    `This will be deducted from your credits.`
  );
  
  if (confirmation) {
    alert(`Session booked successfully!\n\nDetails:\n${selectedSlot.date}\n${selectedSlot.time}\n\nYou'll receive a confirmation email shortly.`);
    // Here you would typically send the booking data to your backend
  }
}