// Load and display booked sessions
function loadSessions() {
  const sessions = JSON.parse(localStorage.getItem('bookedSessions')) || [];
  const container = document.getElementById('sessionsContainer');
  const emptyState = document.getElementById('emptyState');
  
  if (sessions.length === 0) {
    container.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  emptyState.style.display = 'none';
  
  container.innerHTML = sessions.map(session => `
    <div class="session-card">
      <div class="session-header">
        <img src="${session.mentorPhoto}" alt="${session.mentorName}" class="mentor-avatar">
        <div class="session-info">
          <h3>${session.skillName}</h3>
          <p>with ${session.mentorName}</p>
        </div>
        <span class="session-status status-${session.status}">${session.status.toUpperCase()}</span>
      </div>
      
      <div class="session-details">
        <div class="detail-item">
          <div class="detail-label">Date & Time</div>
          <div class="detail-value">${session.date} at ${session.time}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Duration</div>
          <div class="detail-value">1 hour</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Credits</div>
          <div class="detail-value">${session.credits} credits</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">Booked On</div>
          <div class="detail-value">${session.bookedDate}</div>
        </div>
      </div>
      
      <div class="session-actions">
        ${session.status === 'upcoming' ? 
          `<button class="btn join-btn" onclick="joinSession('${session.id}')">Join Session</button>
           <button class="btn cancel-btn" onclick="cancelSession('${session.id}')">Cancel</button>` :
          `<button class="btn" style="background: #f3f4f6; color: #6b7280;">Completed</button>`
        }
      </div>
    </div>
  `).join('');
}

function joinSession(sessionId) {
  alert('Joining session... This would open the video call interface.');
}

function cancelSession(sessionId) {
  if (confirm('Are you sure you want to cancel this session?')) {
    let sessions = JSON.parse(localStorage.getItem('bookedSessions')) || [];
    sessions = sessions.filter(session => session.id !== sessionId);
    localStorage.setItem('bookedSessions', JSON.stringify(sessions));
    loadSessions();
    alert('Session cancelled successfully.');
  }
}

// Load sessions when page loads
document.addEventListener('DOMContentLoaded', loadSessions);