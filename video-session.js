// WebRTC Configuration
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

let localStream;
let remoteStream;
let peerConnection;
let isMuted = false;
let isVideoOff = false;
let sessionId;
let isInitiator = false;

// Initialize video session
async function initializeSession() {
  try {
    // Get session ID from URL or generate one
    const urlParams = new URLSearchParams(window.location.search);
    sessionId = urlParams.get('session') || 'session-' + Date.now();
    
    // Check if we're the first to join (initiator)
    const existingSession = localStorage.getItem(`session-${sessionId}`);
    isInitiator = !existingSession;
    
    if (isInitiator) {
      localStorage.setItem(`session-${sessionId}`, JSON.stringify({ status: 'waiting' }));
    }
    
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true
    });
    
    document.getElementById('localVideo').srcObject = localStream;
    
    // Create peer connection
    peerConnection = new RTCPeerConnection(configuration);
    
    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      remoteStream = event.streams[0];
      document.getElementById('remoteVideo').srcObject = remoteStream;
    };
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        saveSignalingData('candidate', event.candidate);
      }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        showStatus('Connected');
      }
    };
    
    // Start signaling process
    if (isInitiator) {
      createOffer();
    } else {
      checkForOffer();
    }
    
    // Listen for signaling data
    startSignalingListener();
    
  } catch (error) {
    console.error('Error accessing media devices:', error);
    alert('Could not access camera/microphone. Please check permissions.');
  }
}

// Toggle mute/unmute
function toggleMute() {
  const audioTrack = localStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    isMuted = !isMuted;
    
    const muteBtn = document.getElementById('muteBtn');
    muteBtn.textContent = isMuted ? '🔇' : '🎤';
    muteBtn.classList.toggle('active', isMuted);
  }
}

// Toggle video on/off
function toggleVideo() {
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    isVideoOff = !isVideoOff;
    
    const videoBtn = document.getElementById('videoBtn');
    videoBtn.textContent = isVideoOff ? '📹' : '📷';
    videoBtn.classList.toggle('active', isVideoOff);
  }
}

// Share screen
async function shareScreen() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    
    // Replace video track with screen share
    const videoTrack = screenStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => 
      s.track && s.track.kind === 'video'
    );
    
    if (sender) {
      await sender.replaceTrack(videoTrack);
    }
    
    // Stop screen share when user stops sharing
    videoTrack.onended = () => {
      // Switch back to camera
      const cameraTrack = localStream.getVideoTracks()[0];
      if (sender && cameraTrack) {
        sender.replaceTrack(cameraTrack);
      }
    };
    
  } catch (error) {
    console.error('Error sharing screen:', error);
  }
}

// Toggle chat panel
function toggleChat() {
  const chatPanel = document.getElementById('chatPanel');
  chatPanel.style.display = chatPanel.style.display === 'none' ? 'flex' : 'none';
}

// Send chat message
function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (message) {
    // Add message to chat
    addMessageToChat('You', message);
    input.value = '';
    
    // Send via data channel (would need to implement)
    console.log('Sending message:', message);
  }
}

// Add message to chat display
function addMessageToChat(sender, message) {
  const chatMessages = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  messageDiv.style.marginBottom = '10px';
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// End call
function endCall() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }
  
  if (peerConnection) {
    peerConnection.close();
  }
  
  // Redirect back to sessions
  window.location.href = 'my-sessions.html';
}

// Signaling functions using localStorage
function saveSignalingData(type, data) {
  const key = `signal-${sessionId}-${type}-${Date.now()}`;
  localStorage.setItem(key, JSON.stringify({ type, data, from: isInitiator ? 'initiator' : 'joiner' }));
}

function startSignalingListener() {
  setInterval(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(`signal-${sessionId}`));
    keys.forEach(async key => {
      const signal = JSON.parse(localStorage.getItem(key));
      const isFromOther = (isInitiator && signal.from === 'joiner') || (!isInitiator && signal.from === 'initiator');
      
      if (isFromOther) {
        await handleSignalingData(signal.type, signal.data);
        localStorage.removeItem(key);
      }
    });
  }, 1000);
}

async function handleSignalingData(type, data) {
  try {
    if (type === 'offer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      saveSignalingData('answer', answer);
    } else if (type === 'answer') {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    } else if (type === 'candidate') {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data));
    }
  } catch (error) {
    console.error('Error handling signaling data:', error);
  }
}

async function createOffer() {
  try {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    saveSignalingData('offer', offer);
    showStatus('Waiting for peer to join...');
  } catch (error) {
    console.error('Error creating offer:', error);
  }
}

function checkForOffer() {
  showStatus('Connecting to peer...');
}

function showStatus(message) {
  const header = document.querySelector('.video-header h2');
  header.textContent = message;
}

// Handle enter key in chat
document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.getElementById('messageInput');
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
  
  // Initialize session
  initializeSession();
});