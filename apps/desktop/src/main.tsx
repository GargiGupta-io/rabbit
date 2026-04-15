const root = document.getElementById('root');

if (root) {
  const status = document.createElement('p');
  status.textContent = 'Desktop shell loaded. Next step: bind this to React + Tauri bridge commands.';
  root.appendChild(status);
}
