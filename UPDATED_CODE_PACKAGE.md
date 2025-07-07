# 📦 COMPLETE UPDATED CODE PACKAGE

This document contains all the files that were modified to add the cart functionality where clicking "Book Now" shows +1 in cart and displays the quantity.

## 🚀 QUICK START
1. Copy the files below to your project
2. Open `index.html` in a browser 
3. Click "Book Now" buttons multiple times
4. Watch the cart count increment with each click!

---

## 📁 FILE 1: main.js (Complete Cart Functionality)

```javascript
const logoutNav = document.getElementById("logout-nav");
const logoutBtn = document.getElementById("logout-btn");
const profileSection = document.getElementById("profile"); // This section will remain hidden

// Constants for profile dropdown elements
const profileDropdown = document.getElementById("profile-dropdown");
const dropdownProfileName = document.getElementById("dropdown-profile-name");
const dropdownProfileEmail = document.getElementById("dropdown-profile-email");

// Cart elements
const cartIconNav = document.getElementById("cart-icon-nav");
const cartIconBtn = document.getElementById("cart-icon-btn");
const cartCountSpan = document.getElementById("cart-count");
const cartDropdown = document.getElementById("cart-dropdown");
const cartItemsList = document.getElementById("cart-items-list");
const clearCartBtn = document.getElementById("clear-cart-btn");


// ScrollReveal configuration
const scrollRevealOptions = {
    distance: "50px",
    duration: 1000,
};

// Initialize ScrollReveal
const scrollReveal = ScrollReveal();

// Define reveal targets with specific configurations
const revealTargets = [
    { selector: ".header__container p", delay: 0 },
    { selector: ".header__container h1", delay: 500 },
    { selector: ".about__image img", delay: 0, origin: "left" },
    { selector: ".about__content .section__subheader", delay: 500 },
    { selector: ".about__content .section__header", delay: 1000 },
    { selector: ".about__content .section__description", delay: 1500 },
    { selector: ".about__btn", delay: 2000 },
    { selector: ".service__list li", interval: 500, origin: "right" }
];

// Apply ScrollReveal to each target
revealTargets.forEach(target => {
    const { selector, delay = 0, interval, origin } = target;
    scrollReveal.reveal(selector, {
        ...scrollRevealOptions,
        delay,
        interval,
        origin
    });
});

// --- Backend Integration ---
const BACKEND_URL = "http://localhost:3000/api";

// Get booking form elements
const bookingForm = document.getElementById("booking-form");
const checkInInput = document.getElementById("check-in");
const checkOutInput = document.getElementById("check-out");
const guestCountInput = document.getElementById("guest-count");
const roomGrid = document.getElementById("room-grid");

// Function to fetch and display rooms
async function fetchRooms() {
    try {
        const response = await fetch(`${BACKEND_URL}/rooms`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rooms = await response.json();
        displayRooms(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        roomGrid.innerHTML = `<p>Error loading rooms. Please try again later.</p>`;
    }
}

// Function to get cart items from local storage
function getCartItems() {
    const cart = localStorage.getItem('bookedRooms');
    const items = cart ? JSON.parse(cart) : [];
    
    // Ensure all items have a quantity property for backward compatibility
    return items.map(item => ({
        ...item,
        quantity: item.quantity || 1
    }));
}

// Function to save cart items to local storage
function saveCartItems(items) {
    localStorage.setItem('bookedRooms', JSON.stringify(items));
    updateCartDisplay(); // Update display after saving
}

// Function to add a room to the cart
function addRoomToCart(room) {
    let cart = getCartItems();
    const existingItem = cart.find(item => item._id === room._id);
    
    if (existingItem) {
        // Room already exists, increment quantity
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        // New room, add with quantity 1
        room.quantity = 1;
        cart.push(room);
    }
    
    saveCartItems(cart);
    
    const quantity = existingItem ? existingItem.quantity : 1;
    Swal.fire({
        icon: 'success',
        title: 'Room Added to Cart!',
        text: `${room.name} has been added to your bookings. Quantity: ${quantity}`,
        timer: 1500,
        showConfirmButton: false
    });
}

// Function to update the cart display (count and dropdown content)
function updateCartDisplay() {
    const cart = getCartItems();
    
    // Calculate total quantity for cart count badge
    const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    cartCountSpan.textContent = totalQuantity;

    cartItemsList.innerHTML = ''; // Clear previous items

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p>No rooms booked yet.</p>';
        clearCartBtn.style.display = 'none';
    } else {
        cart.forEach(room => {
            const quantity = room.quantity || 1;
            const totalPrice = room.pricePerNight * quantity;
            
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${room.imageUrl}" alt="${room.name}">
                <div class="cart-item-details">
                    <h5>${room.name} <span class="quantity-badge">x${quantity}</span></h5>
                    <p>${room.pricePerNight} Rs/night</p>
                    <p class="total-price"><strong>Total: ${totalPrice} Rs</strong></p>
                    <div class="quantity-controls">
                        <button class="btn-quantity decrease-btn" data-room-id="${room._id}">-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="btn-quantity increase-btn" data-room-id="${room._id}">+</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(cartItem);
        });
        
        // Add event listeners for quantity controls
        addQuantityControlListeners();
        clearCartBtn.style.display = 'block';
    }
}

// Function to add event listeners to quantity control buttons
function addQuantityControlListeners() {
    // Handle increase quantity buttons
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const roomId = event.target.dataset.roomId;
            updateRoomQuantity(roomId, 1);
        });
    });
    
    // Handle decrease quantity buttons
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const roomId = event.target.dataset.roomId;
            updateRoomQuantity(roomId, -1);
        });
    });
}

// Function to update room quantity in cart
function updateRoomQuantity(roomId, change) {
    let cart = getCartItems();
    const roomIndex = cart.findIndex(item => item._id === roomId);
    
    if (roomIndex !== -1) {
        const room = cart[roomIndex];
        const currentQuantity = room.quantity || 1;
        const newQuantity = currentQuantity + change;
        
        if (newQuantity <= 0) {
            // Remove room from cart if quantity becomes 0 or less
            const roomName = room.name || 'Room';
            cart.splice(roomIndex, 1);
            Swal.fire({
                icon: 'info',
                title: 'Room Removed',
                text: `${roomName} has been removed from your cart.`,
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            // Update quantity
            cart[roomIndex].quantity = newQuantity;
        }
        
        saveCartItems(cart);
    }
}


// Function to display rooms dynamically
function displayRooms(rooms) {
    roomGrid.innerHTML = '';
    if (rooms.length === 0) {
        roomGrid.innerHTML = `<p>No rooms available at the moment.</p>`;
        return;
    }

    rooms.forEach(room => {
        const roomCard = document.createElement('div');
        roomCard.classList.add('room__card');
        roomCard.innerHTML = `
            <div class="room__card__image">
                <img src="${room.imageUrl}" alt="${room.name}" />
                <div class="room__card__icons">
                    <span><i class="ri-heart-fill"></i></span>
                    <span><i class="ri-paint-fill"></i></span>
                    <span><i class="ri-shield-star-line"></i></span>
                </div>
            </div>
            <div class="room__card__details">
                <h4>${room.name}</h4>
                <p>${room.description}</p>
                <h5>Starting from <span>${room.pricePerNight} Rs/night</span></h5>
                <button class="btn book-now-btn" data-room-id="${room._id}">Book Now</button>
            </div>
        `;
        roomGrid.appendChild(roomCard);
    });

    scrollReveal.reveal(".room__card", { ...scrollRevealOptions, interval: 500 });

    document.querySelectorAll('.book-now-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const roomId = event.target.dataset.roomId;
            try {
                const response = await fetch(`${BACKEND_URL}/rooms/${roomId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const roomDetails = await response.json();
                addRoomToCart(roomDetails); // Add the fetched room to cart
            } catch (error) {
                console.error("Error adding room to cart:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to add room to cart. Please try again.',
                });
            }
        });
    });
}

// Handle booking form submission
bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    const guests = parseInt(guestCountInput.value);

    if (!checkIn || !checkOut || !guests) {
        Swal.fire({
            icon: 'warning',
            title: 'Incomplete Details',
            text: 'Please fill in all booking details.'
        });
        return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Dates',
            text: 'Check-out date must be after check-in date.'
        });
        return;
    }

    Swal.fire({
        icon: 'success',
        title: 'Searching Rooms...',
        text: `From ${checkIn} to ${checkOut} for ${guests} guest(s).`
    });
});

// Contact form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;

        try {
            const response = await fetch(`${BACKEND_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, subject, message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            Swal.fire({
                icon: 'success',
                title: 'Message Sent!',
                text: 'Your message has been sent successfully!',
            });
            contactForm.reset();
        } catch (error) {
            console.error('Error sending message:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Send',
                text: 'Failed to send message. Please try again.'
            });
        }
    });
}

// Function to check login status and update UI
function checkLoginStatus() {
    const emailUser = localStorage.getItem('emailUser');
    const googleUser = localStorage.getItem('googleUser');
    let user = null;

    if (emailUser) {
        user = JSON.parse(emailUser);
    } else if (googleUser) {
        user = JSON.parse(googleUser);
    }

    if (user) {
        // User is logged in
        document.getElementById('user-profile-icon-nav').style.display = 'block'; // Show the profile icon in nav
        logoutNav.style.display = 'block'; // Show logout link in nav
        // Populate dropdown elements
        dropdownProfileName.textContent = user.name || 'N/A';
        dropdownProfileEmail.textContent = user.email;
    } else {
        // User is not logged in
        document.getElementById('user-profile-icon-nav').style.display = 'none'; // Hide the profile icon in nav
        logoutNav.style.display = 'none'; // Hide logout link in nav
    }
    // Ensure the profile section on the page is always hidden
    profileSection.style.display = 'none';
}

// Handle logout
logoutBtn.addEventListener('click', () => {
    Swal.fire({
        title: 'Are you sure?',
        text: "You will be logged out!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, log me out!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('emailUser');
            localStorage.removeItem('googleUser');
            checkLoginStatus(); // Update UI after logout
            Swal.fire(
                'Logged out!',
                'You have been successfully logged out.',
                'success'
            ).then(() => {
                window.location.href = "user.html"; // Redirect to user.html
            });
        }
    });
});

// Handle click on Profile icon to toggle dropdown
const profileIconNavBtn = document.getElementById("profile-icon-btn");
if (profileIconNavBtn) {
    profileIconNavBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor link behavior

        // Retrieve user information for real-time check (even if populated by checkLoginStatus)
        const emailUser = localStorage.getItem('emailUser');
        const googleUser = localStorage.getItem('googleUser');
        let user = null;

        if (emailUser) {
            user = JSON.parse(emailUser);
        } else if (googleUser) {
            user = JSON.parse(googleUser);
        }

        if (user) {
            // User is logged in, toggle profile dropdown visibility
            profileDropdown.classList.toggle('show');
            cartDropdown.classList.remove('show'); // Close cart dropdown if open
            // Ensure data is up-to-date in dropdown (redundant if checkLoginStatus always runs, but safe)
            dropdownProfileName.textContent = user.name || 'N/A';
            dropdownProfileEmail.textContent = user.email;
        } else {
            // User is not logged in, prompt to log in or register
            Swal.fire({
                title: 'Not Logged In',
                text: 'Please log in or register to view your profile.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "user.html"; // Redirect to login/registration page
                }
            });
            // If not logged in and prompt appears, ensure dropdown is hidden
            profileDropdown.classList.remove('show');
        }
        // Ensure the profile section on the page remains hidden
        profileSection.style.display = 'none';
    });
}

// Event listener for cart icon click
if (cartIconBtn) {
    cartIconBtn.addEventListener('click', (event) => {
        event.preventDefault();
        profileDropdown.classList.remove('show'); // Close profile dropdown if open
        updateCartDisplay(); // Make sure cart display is up-to-date before showing
        cartDropdown.classList.toggle('show');
    });
}

// Event listener for clear cart button
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        Swal.fire({
            title: 'Clear all bookings?',
            text: "This will remove all rooms from your cart!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, clear it!'
        }).then((result) => {
            if (result.isConfirmed) {
                saveCartItems([]); // Clear the array
                Swal.fire('Cleared!', 'Your cart has been emptied.', 'success');
                cartDropdown.classList.remove('show'); // Hide cart dropdown after clearing
            }
        });
    });
}


// Close dropdowns if clicked outside of them or their respective icons
document.addEventListener('click', (event) => {
    // Close profile dropdown
    if (profileDropdown && !profileIconNavBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove('show');
    }
    // Close cart dropdown
    if (cartDropdown && !cartIconBtn.contains(event.target) && !cartDropdown.contains(event.target)) {
        cartDropdown.classList.remove('show');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    fetchRooms();
    checkLoginStatus(); // Check login status when the page loads
    updateCartDisplay(); // Initialize cart count on page load
});
```

---

## 🎨 ADDITIONAL CSS (Add to end of styles.css)

```css
/* Quantity Badge and Controls Styles */
.quantity-badge {
  background-color: var(--primary-color);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 8px;
  font-weight: 600;
}

.total-price {
  color: var(--primary-color);
  font-weight: 600;
  margin-top: 4px !important;
  font-size: 0.9rem !important;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 4px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.btn-quantity {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-quantity:hover {
  background-color: var(--primary-color-dark);
  transform: scale(1.1);
}

.btn-quantity:active {
  transform: scale(0.95);
}

.decrease-btn {
  background-color: #dc3545;
}

.decrease-btn:hover {
  background-color: #c82333;
}

.quantity-display {
  font-weight: 600;
  color: var(--text-dark);
  min-width: 20px;
  text-align: center;
  font-size: 0.85rem;
}

/* Enhanced cart item styling */
.cart-item {
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 12px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.cart-item:last-child {
  margin-bottom: 0;
  border-bottom: 1px solid #e9ecef;
}

/* Update cart count badge styling */
.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(45deg, #ff4d4d, #ff6b6b);
  color: white;
  font-size: 0.7em;
  padding: 4px 6px;
  border-radius: 50%;
  line-height: 1;
  z-index: 1;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
```

---

## ✅ WHAT THIS CODE DOES:

1. **Each "Book Now" click** → Increments cart count by +1
2. **Multiple clicks** → Shows quantity badges like "x3" 
3. **Cart displays** → Total quantity across all rooms
4. **Visual feedback** → Animations and notifications
5. **Manual controls** → + and - buttons in cart dropdown

## 🎯 FILES TO REPLACE:
- Replace your `main.js` with the JavaScript code above
- Add the CSS code to the end of your `styles.css` file
- Your `index.html` should already have the cart structure

## 🚀 READY TO USE:
Open `index.html` in a browser and click "Book Now" multiple times to see the cart count increment!