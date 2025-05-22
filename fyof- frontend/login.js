const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Toggle forms
registerBtn.addEventListener('click', () => {
  container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
  container.classList.remove("active");
});

// Handle registration
document.querySelector('.sign-up form').onsubmit = async (e) => {
  e.preventDefault();
  const name = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;

  // Basic frontend validation
  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  if (!email.includes('@')) {
    alert('Please enter a valid email address');
    return;
  }

  console.log('Attempting registration with:', { name, email });

  try {
    console.log('Sending registration request...');
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    console.log('Registration response status:', res.status);
    const data = await res.json();
    console.log('Registration response data:', data);
    
    if (data.token) {
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name);
      alert('Registered successfully! Welcome to FYOF.');
      window.location.href = 'index.html';
    } else if (data.errors) {
      // Show validation errors
      const errorMessages = data.errors.map(error => error.msg).join('\n');
      alert('Registration failed:\n' + errorMessages);
    } else if (data.error) {
      // Show specific error message
      alert('Registration failed: ' + data.error);
    } else {
      alert('Registration failed. Please try again.');
    }
  } catch (error) {
    console.error('Registration error:', error);
    if (!navigator.onLine) {
      alert('Registration failed: Please check your internet connection');
    } else {
      alert('Registration failed: ' + (error.message || 'Server error. Please try again.'));
    }
  }
};

// Handle login
document.querySelector('.sign-in form').onsubmit = async (e) => {
  e.preventDefault();
  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('userName', data.name);
      
      // Redirect based on user role
      if (data.role === 'vendor') {
        window.location.href = 'dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    } else if (data.errors) {
      // Show validation errors
      const errorMessages = data.errors.map(error => error.msg).join('\n');
      alert(errorMessages);
    } else {
      alert(data.error || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  }
};

// Check auth status on page load
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Redirect if already logged in
    window.location.href = 'index.html';
  }
});
