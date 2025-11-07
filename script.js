let username = '';

function joinRoom() {
  const room = roomInput.value.trim();
  if (!room) return;
  if (!username) {
    const custom = document.getElementById('customName').value.trim();
    username = custom || 'Guest';
  }
  socket.emit('join_room', { room, username });
}

// normal join button
joinBtn.addEventListener('click', joinRoom);

// google sign-in
window.onload = function () {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID', // replace with your OAuth client ID
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('gSignInBtn'),
    { theme: 'outline', size: 'large', text: 'signin_with' }
  );
};

function handleCredentialResponse(response) {
  const jwt = response.credential;
  const payload = parseJwt(jwt);
  username = payload.given_name || payload.name || 'Guest';
  joinRoom();
}

// simple jwt decode for GIS response
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}
