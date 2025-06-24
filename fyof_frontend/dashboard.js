const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');
const token = localStorage.getItem('token');

// Redirect if not authenticated
if (!token) {
	window.location.href = 'login.html';
}

// Logout functionality
document.querySelector('.logout').addEventListener('click', (e) => {
	e.preventDefault();
	localStorage.removeItem('token');
	localStorage.removeItem('userId');
	localStorage.removeItem('userName');
	window.location.href = 'login.html';
});

// Handle menu clicks
allSideMenu.forEach(item => {
	const li = item.parentElement;

	item.addEventListener('click', function (e) {
		if (item.classList.contains('logout')) return; // Skip for logout button
		
		e.preventDefault();
		allSideMenu.forEach(i => {
			i.parentElement.classList.remove('active');
		});
		li.classList.add('active');
		
		// Handle navigation
		const target = item.querySelector('.text').textContent.toLowerCase();
		switch(target) {
			case 'dashboard':
				loadDashboardData();
				break;
			case 'analytics':
				loadAnalytics();
				break;
			case 'message':
				loadMessages();
				break;
			case 'settings':
				loadSettings();
				break;
		}
	});
});

// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
});

// Search functionality
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
});

// Responsive sidebar
function handleResize() {
	if(window.innerWidth < 768) {
		sidebar.classList.add('hide');
	} else if(window.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
}

window.addEventListener('resize', handleResize);
handleResize(); // Call on initial load

// Dark mode toggle
const switchMode = document.getElementById('switch-mode');
switchMode.addEventListener('change', function () {
	document.body.classList.toggle('dark');
	// Save preference
	localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
	document.body.classList.add('dark');
	switchMode.checked = true;
}

// Outlet Management
async function loadOutlets() {
	try {
		const response = await fetch('http://localhost:5000/api/outlets', {
			headers: {
				'x-auth-token': token
			}
		});
		if (!response.ok) {
			throw new Error('Failed to load outlets');
		}
		const outlets = await response.json();
		displayOutlets(outlets);
		updateDashboardStats(outlets);
	} catch (error) {
		console.error('Error loading outlets:', error);
		showNotification('Error loading outlets', 'error');
	}
}

// Initialize Socket.IO connection
const socket = io('http://localhost:5000');

socket.on('connect', () => {
	console.log('Connected to server');
	showNotification('Connected to real-time updates', 'success');
});

socket.on('outletUpdate', (updatedOutlet) => {
	// Update outlet in the table without full reload
	const outletRow = document.querySelector(`tr[data-outlet-id="${updatedOutlet._id}"]`);
	if (outletRow) {
		updateOutletRow(outletRow, updatedOutlet);
	} else {
		loadOutlets(); // Fallback to full reload if row not found
	}
	updateDashboardStats();
});

socket.on('disconnect', () => {
	console.log('Disconnected from server');
	showNotification('Real-time updates disconnected', 'warning');
});

function displayOutlets(outlets) {
	const tableBody = document.querySelector('.order table tbody');
	tableBody.innerHTML = '';

	outlets.forEach(outlet => {
		const row = document.createElement('tr');
		row.setAttribute('data-outlet-id', outlet._id);
		row.innerHTML = `
			<td>
				<p>${outlet.name}</p>
			</td>
			<td>${outlet.location.address}</td>
			<td>
				<span class="status ${outlet.isOpen ? 'completed' : 'pending'}">
					${outlet.isOpen ? 'Open' : 'Closed'}
				</span>
				<button class="toggle-status" data-id="${outlet._id}" data-status="${outlet.isOpen}">
					${outlet.isOpen ? 'Close' : 'Open'}
				</button>
			</td>
			<td>
				<button class="edit-outlet" data-id="${outlet._id}">
					<i class='bx bx-edit'></i>
				</button>
				<button class="delete-outlet" data-id="${outlet._id}">
					<i class='bx bx-trash'></i>
				</button>
			</td>
		`;
		tableBody.appendChild(row);
	});

	// Add event listeners to new buttons
	document.querySelectorAll('.toggle-status').forEach(btn => {
		btn.addEventListener('click', toggleOutletStatus);
	});
	document.querySelectorAll('.edit-outlet').forEach(btn => {
		btn.addEventListener('click', editOutlet);
	});
	document.querySelectorAll('.delete-outlet').forEach(btn => {
		btn.addEventListener('click', deleteOutlet);
	});
}

function updateOutletRow(row, outlet) {
	row.innerHTML = `
		<td>
			<p>${outlet.name}</p>
		</td>
		<td>${outlet.location.address}</td>
		<td>
			<span class="status ${outlet.isOpen ? 'completed' : 'pending'}">
				${outlet.isOpen ? 'Open' : 'Closed'}
			</span>
			<button class="toggle-status" data-id="${outlet._id}" data-status="${outlet.isOpen}">
				${outlet.isOpen ? 'Close' : 'Open'}
			</button>
		</td>
		<td>
			<button class="edit-outlet" data-id="${outlet._id}">
				<i class='bx bx-edit'></i>
			</button>
			<button class="delete-outlet" data-id="${outlet._id}">
				<i class='bx bx-trash'></i>
			</button>
		</td>
	`;

	// Reattach event listeners
	const toggleBtn = row.querySelector('.toggle-status');
	const editBtn = row.querySelector('.edit-outlet');
	const deleteBtn = row.querySelector('.delete-outlet');

	toggleBtn.addEventListener('click', toggleOutletStatus);
	editBtn.addEventListener('click', editOutlet);
	deleteBtn.addEventListener('click', deleteOutlet);
}

function updateDashboardStats(outlets) {
	const totalOrders = outlets.reduce((sum, outlet) => sum + (outlet.orders?.length || 0), 0);
	const totalVisitors = outlets.reduce((sum, outlet) => sum + (outlet.visitors || 0), 0);
	const totalSales = outlets.reduce((sum, outlet) => sum + (outlet.sales || 0), 0);

	document.querySelector('.box-info li:nth-child(1) h3').textContent = totalOrders;
	document.querySelector('.box-info li:nth-child(2) h3').textContent = totalVisitors;
	document.querySelector('.box-info li:nth-child(3) h3').textContent = `₹${totalSales}`;
}

// Add new outlet form handler
document.getElementById('add-outlet-form')?.addEventListener('submit', async (e) => {
	e.preventDefault();
	const formData = new FormData(e.target);
	
	try {
		const response = await fetch('http://localhost:5000/api/outlets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-auth-token': token
			},
			body: JSON.stringify({
				name: formData.get('name'),
				location: {
					address: formData.get('address'),
					city: formData.get('city')
				},
				cuisine: formData.get('cuisine').split(','),
				description: formData.get('description')
			})
		});

		if (response.ok) {
			showNotification('Outlet added successfully!', 'success');
			loadOutlets();
			e.target.reset();
			document.getElementById('add-outlet-modal').style.display = 'none';
		} else {
			const error = await response.json();
			showNotification(error.msg || 'Failed to add outlet', 'error');
		}
	} catch (error) {
		console.error('Error adding outlet:', error);
		showNotification('Failed to add outlet', 'error');
	}
});

// Notification system
function showNotification(message, type = 'success') {
	const notification = document.createElement('div');
	notification.className = `notification-popup ${type}`;
	notification.textContent = message;
	document.body.appendChild(notification);

	// Trigger reflow for animation
	notification.offsetHeight;
	notification.classList.add('show');

	setTimeout(() => {
		notification.classList.remove('show');
		setTimeout(() => notification.remove(), 300);
	}, 3000);
}

// Load outlets on page load
loadOutlets();

// Add loading states to buttons
document.querySelectorAll('button').forEach(button => {
	button.addEventListener('click', function() {
		if (!this.classList.contains('loading') && !this.classList.contains('no-loading')) {
			const originalContent = this.innerHTML;
			const spinner = document.createElement('span');
			spinner.className = 'loading-spinner';
			this.classList.add('loading');
			this.prepend(spinner);
			
			setTimeout(() => {
				this.classList.remove('loading');
				this.innerHTML = originalContent;
			}, 1000);
		}
	});
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute('href'));
		if (target) {
			target.scrollIntoView({
				behavior: 'smooth'
			});
		}
	});
});

// Enhanced table sorting
document.querySelectorAll('th').forEach(headerCell => {
	headerCell.addEventListener('click', () => {
		const tableBody = headerCell.closest('table').querySelector('tbody');
		const rows = Array.from(tableBody.querySelectorAll('tr'));
		const columnIndex = Array.from(headerCell.parentElement.children).indexOf(headerCell);
		const isNumeric = !isNaN(rows[0].children[columnIndex].textContent.trim());
		
		const direction = headerCell.classList.contains('sorted-asc') ? -1 : 1;
		
		rows.sort((rowA, rowB) => {
			const cellA = rowA.children[columnIndex].textContent.trim();
			const cellB = rowB.children[columnIndex].textContent.trim();
			
			if (isNumeric) {
				return direction * (parseFloat(cellA) - parseFloat(cellB));
			} else {
				return direction * cellA.localeCompare(cellB);
			}
		});
		
		// Update sort indicators
		headerCell.closest('tr').querySelectorAll('th').forEach(th => {
			th.classList.remove('sorted-asc', 'sorted-desc');
		});
		headerCell.classList.toggle('sorted-asc', direction === 1);
		headerCell.classList.toggle('sorted-desc', direction === -1);
		
		// Reorder rows with animation
		rows.forEach((row, index) => {
			row.style.transition = 'transform 0.3s ease';
			row.style.transform = 'translateY(' + (index * row.offsetHeight) + 'px)';
			setTimeout(() => {
				tableBody.appendChild(row);
				row.style.transform = '';
			}, 50);
		});
	});
});

// Enhanced modal functionality
function showModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.style.display = 'block';
	setTimeout(() => modal.classList.add('show'), 10);
	
	// Close on outside click
	modal.addEventListener('click', function(e) {
		if (e.target === this) {
			closeModal(modalId);
		}
	});
}

function closeModal(modalId) {
	const modal = document.getElementById(modalId);
	modal.classList.remove('show');
	setTimeout(() => modal.style.display = 'none', 300);
}

// Form validation with interactive feedback
document.querySelectorAll('form').forEach(form => {
	const inputs = form.querySelectorAll('input, textarea, select');
	
	inputs.forEach(input => {
		input.addEventListener('invalid', function(e) {
			e.preventDefault();
			showInputError(this);
		});
		
		input.addEventListener('input', function() {
			clearInputError(this);
		});
	});
});

function showInputError(input) {
	const errorMessage = input.validationMessage;
	const errorDiv = document.createElement('div');
	errorDiv.className = 'input-error';
	errorDiv.textContent = errorMessage;
	
	clearInputError(input);
	input.classList.add('error');
	input.parentNode.appendChild(errorDiv);
	
	input.addEventListener('focus', () => clearInputError(input), { once: true });
}

function clearInputError(input) {
	input.classList.remove('error');
	const errorDiv = input.parentNode.querySelector('.input-error');
	if (errorDiv) {
		errorDiv.remove();
	}
}

// Enhanced sidebar interaction
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const menuBar = document.querySelector('#content nav .bx.bx-menu');

menuBar.addEventListener('click', () => {
	sidebar.classList.toggle('hide');
	content.classList.toggle('sidebar-hidden');
	
	// Save preference
	localStorage.setItem('sidebarHidden', sidebar.classList.contains('hide'));
});

// Load sidebar preference
if (localStorage.getItem('sidebarHidden') === 'true') {
	sidebar.classList.add('hide');
	content.classList.add('sidebar-hidden');
}

// Add smooth transitions for dark mode
document.getElementById('switch-mode').addEventListener('change', function() {
	document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
	document.body.classList.toggle('dark');
	localStorage.setItem('darkMode', document.body.classList.contains('dark'));
	
	// Remove transition after switch to prevent affecting other changes
	setTimeout(() => {
		document.body.style.transition = '';
	}, 400);
});

// Initialize tooltips
document.querySelectorAll('[data-tooltip]').forEach(element => {
	element.addEventListener('mouseenter', e => {
		const tooltip = document.createElement('div');
		tooltip.className = 'tooltip';
		tooltip.textContent = element.dataset.tooltip;
		document.body.appendChild(tooltip);
		
		const rect = element.getBoundingClientRect();
		tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
		tooltip.style.left = rect.left + (rect.width - tooltip.offsetWidth) / 2 + 'px';
		
		setTimeout(() => tooltip.classList.add('show'), 10);
	});
	
	element.addEventListener('mouseleave', () => {
		const tooltip = document.querySelector('.tooltip');
		if (tooltip) {
			tooltip.classList.remove('show');
			setTimeout(() => tooltip.remove(), 300);
		}
	});
});