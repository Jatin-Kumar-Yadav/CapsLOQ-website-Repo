document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const res = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  
  if (data.token) {
    localStorage.setItem('token', data.token);
    window.location.href = '/';  // ← CLEAN URL
  } else {
    alert(data.error);
  }
};