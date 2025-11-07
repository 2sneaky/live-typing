const socket = io();

const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('room');
const app = document.getElementById('app');
const join = document.getElementById('join');
const input = document.getElementById('input');
const streams = document.getElementById('streams');
const clearBtn = document.getElementById('clearBtn');
const roomName = document.getElementById('roomName');
const ownerPw = document.getElementById('ownerPw');

let myId = null;
let joined = false;
let owner = false;

joinBtn.addEventListener('click', () => {
  const room = roomInput.value.trim();
  if (!room) return;
  socket.emit('join_room', room);
});

socket.on('room_joined', (data) => {
  myId = data.id;
  joined = true;
  roomName.textContent = data.room;
  join.hidden = true;
  app.hidden = false;
  input.focus();
  ensureStream(myId);
});

input.addEventListener('input', () => {
  if (!joined) return;
  socket.emit('typing', input.value);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  if (joined) socket.emit('clear');
});

function ensureStream(id) {
  let el = document.querySelector(`[data-id="${id}"]`);
  if (!el) {
    el = document.createElement('div');
    el.className = 'stream';
    el.dataset.id = id;
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = id === myId ? 'you' : `user ${id.slice(0,6)}`;
    const content = document.createElement('pre');
    content.className = 'content';
    content.textContent = '';
    el.appendChild(title);
    el.appendChild(content);
    streams.appendChild(el);
  }
  return el;
}

socket.on('update', (data) => {
  const el = ensureStream(data.id);
  el.querySelector('.content').textContent = data.content;
});

socket.on('clear', (data) => {
  const el = document.querySelector(`[data-id="${data.id}"]`);
  if (el) el.querySelector('.content').textContent = '';
});

socket.on('user_left', (id) => {
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.remove();
});

socket.on('clear_all', () => {
  streams.innerHTML = '';
});

ownerPw.addEventListener('change', () => {
  socket.emit('owner_auth', ownerPw.value);
});

socket.on('owner_ok', () => {
  owner = true;
  const existing = document.getElementById('ownerClear');
  if (!existing) {
    const btn = document.createElement('button');
    btn.textContent = 'clear all';
    btn.id = 'ownerClear';
    btn.onclick = () => socket.emit('owner_clear_all');
    document.getElementById('container').appendChild(btn);
  }
});

socket.on('owner_fail', () => {
  ownerPw.value = '';
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err);
});
