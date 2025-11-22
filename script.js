// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    function initApp() {
        setupEventListeners();
        setupFakeData();
        loadUserBookings();
        setDefaultDates();
    }
    
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Navigation
    function setupEventListeners() {
        // Navigation links
        document.querySelectorAll('.nav-link, .footer-section a[data-section]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
                
                // Close mobile menu
                if (window.innerWidth <= 768) {
                    mobileMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
            });
        });
        
        // Trip type toggle
        document.querySelectorAll('.trip-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.trip-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const tripType = this.getAttribute('data-trip');
                const returnField = document.querySelector('.return-field');
                
                if (tripType === 'one-way') {
                    returnField.style.display = 'none';
                    document.getElementById('return').required = false;
                } else {
                    returnField.style.display = 'block';
                    document.getElementById('return').required = true;
                }
            });
        });
        
        // Swap airports
        document.getElementById('swap-airports').addEventListener('click', function() {
            const fromInput = document.getElementById('from');
            const toInput = document.getElementById('to');
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
        });
        
        // Passenger counters
        document.querySelectorAll('.passenger-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const type = this.getAttribute('data-type');
                const countElement = document.getElementById(`${type}-count`);
                let count = parseInt(countElement.textContent);
                
                if (this.textContent === '+') {
                    count++;
                    if (type === 'adults' && count > 8) count = 8;
                    if (type === 'children' && count > 6) count = 6;
                } else {
                    count--;
                    if (type === 'adults' && count < 1) count = 1;
                    if (type === 'children' && count < 0) count = 0;
                }
                
                countElement.textContent = count;
            });
        });
        
        // Search flights
        document.getElementById('search-flights').addEventListener('click', function() {
            performFlightSearch();
        });
        
        // Track flight
        document.getElementById('track-flight-btn').addEventListener('click', function() {
            trackFlight();
        });
        
        // Booking form submission
        document.getElementById('booking-form').addEventListener('submit', function(e) {
            e.preventDefault();
            processBooking();
        });
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
                this.classList.add('active');
                
                const methodType = this.getAttribute('data-method');
                document.getElementById('card-details').style.display = methodType === 'card' ? 'block' : 'none';
            });
        });
        
        // Confirmation actions
        document.getElementById('print-ticket').addEventListener('click', function() {
            window.print();
        });
        
        document.getElementById('track-flight').addEventListener('click', function() {
            const bookingRef = document.getElementById('booking-ref').textContent;
            document.getElementById('tracking-number').value = bookingRef;
            showSection('tracking');
            trackFlight();
        });
        
        document.getElementById('new-booking').addEventListener('click', function() {
            showSection('search');
        });
        
        // FAQ toggle
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', function() {
                const faqItem = this.parentElement;
                faqItem.classList.toggle('active');
            });
        });
        
        // Sort and filter changes
        document.getElementById('sort').addEventListener('change', function() {
            if (currentSearchResults) {
                displayFlights(sortFlights([...currentSearchResults], this.value));
            }
        });
        
        document.getElementById('stops').addEventListener('change', function() {
            if (currentSearchResults) {
                const filtered = filterFlights([...currentSearchResults], this.value);
                displayFlights(sortFlights(filtered, document.getElementById('sort').value));
            }
        });
    }
    
    // Fake data storage
    function setupFakeData() {
        if (!localStorage.getItem('skywings_bookings')) {
            localStorage.setItem('skywings_bookings', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('skywings_flights')) {
            // Generate sample flight data
            const sampleFlights = generateSampleFlights();
            localStorage.setItem('skywings_flights', JSON.stringify(sampleFlights));
        }
    }
    
    // Sample flight data generator
    function generateSampleFlights() {
        const airlines = [
            { code: 'SKW', name: 'SkyWings' },
            { code: 'GLA', name: 'Global Airways' },
            { code: 'OCN', name: 'Oceanic Airlines' },
            { code: 'STW', name: 'Star Wings' },
            { code: 'AIR', name: 'Air Connect' }
        ];
        
        const routes = [
            { from: 'New York (JFK)', to: 'London (LHR)', duration: '7h 15m', basePrice: 600 },
            { from: 'New York (JFK)', to: 'Paris (CDG)', duration: '7h 30m', basePrice: 650 },
            { from: 'New York (JFK)', to: 'Tokyo (NRT)', duration: '13h 45m', basePrice: 950 },
            { from: 'London (LHR)', to: 'New York (JFK)', duration: '8h 0m', basePrice: 620 },
            { from: 'London (LHR)', to: 'Dubai (DXB)', duration: '6h 45m', basePrice: 550 },
            { from: 'Paris (CDG)', to: 'New York (JFK)', duration: '8h 15m', basePrice: 670 },
            { from: 'Tokyo (NRT)', to: 'Sydney (SYD)', duration: '9h 30m', basePrice: 720 },
            { from: 'Dubai (DXB)', to: 'Singapore (SIN)', duration: '7h 15m', basePrice: 480 },
            { from: 'Singapore (SIN)', to: 'Sydney (SYD)', duration: '7h 45m', basePrice: 520 }
        ];
        
        const flights = [];
        let id = 1;
        
        // Generate flights for next 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            routes.forEach(route => {
                // Generate 2-4 flights per route per day
                const flightCount = 2 + Math.floor(Math.random() * 3);
                
                for (let j = 0; j < flightCount; j++) {
                    const airline = airlines[Math.floor(Math.random() * airlines.length)];
                    const stops = Math.random() > 0.7 ? 1 : 0;
                    
                    // Generate departure time (6:00 AM to 10:00 PM)
                    const hour = 6 + Math.floor(Math.random() * 16);
                    const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
                    const departureTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    
                    // Calculate arrival time based on duration
                    const [hours, mins] = route.duration.split('h ').map(part => parseInt(part));
                    const departureDate = new Date(`${dateStr}T${departureTime}`);
                    const arrivalDate = new Date(departureDate.getTime() + (hours * 60 + mins) * 60000);
                    const arrivalTime = arrivalDate.toTimeString().substring(0, 5);
                    
                    // Calculate price with variations
                    const priceVariation = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
                    const basePrice = route.basePrice * priceVariation;
                    
                    flights.push({
                        id: id++,
                        airline: airline.name,
                        airlineCode: airline.code,
                        flightNumber: `${airline.code} ${100 + Math.floor(Math.random() * 900)}`,
                        from: route.from,
                        to: route.to,
                        date: dateStr,
                        departure: { time: departureTime, city: route.from },
                        arrival: { time: arrivalTime, city: route.to },
                        duration: route.duration,
                        stops: stops,
                        price: Math.round(basePrice),
                        seatsAvailable: Math.floor(Math.random() * 50) + 10
                    });
                }
            });
        }
        
        return flights;
    }
    
    // Section management
    function showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(sectionId).classList.add('active');
        
        // Special handling for certain sections
        if (sectionId === 'manage') {
            loadUserBookings();
        }
    }
    
    // Set default dates
    function setDefaultDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        document.getElementById('departure').value = today.toISOString().split('T')[0];
        document.getElementById('departure').min = today.toISOString().split('T')[0];
        document.getElementById('return').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('return').min = tomorrow.toISOString().split('T')[0];
    }
    
    // Flight search
    let currentSearchResults = null;
    let currentSearchCriteria = null;
    
    function performFlightSearch() {
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const departureDate = document.getElementById('departure').value;
        const returnDate = document.getElementById('return').value;
        const tripType = document.querySelector('.trip-btn.active').getAttribute('data-trip');
        const adults = parseInt(document.getElementById('adults-count').textContent);
        const children = parseInt(document.getElementById('children-count').textContent);
        const travelClass = document.getElementById('class').value;
        
        // Validate inputs
        if (!from || !to) {
            alert('Please enter both departure and arrival cities');
            return;
        }
        
        if (!departureDate) {
            alert('Please select a departure date');
            return;
        }
        
        if (tripType === 'round-trip' && !returnDate) {
            alert('Please select a return date for round trip');
            return;
        }
        
        // Store search criteria
        currentSearchCriteria = {
            from, to, departureDate, returnDate, tripType,
            passengers: adults + children,
            adults, children, travelClass
        };
        
        // Get flights from storage
        const allFlights = JSON.parse(localStorage.getItem('skywings_flights'));
        
        // Filter flights
        const outboundFlights = allFlights.filter(flight => 
            flight.from.toLowerCase().includes(from.toLowerCase()) &&
            flight.to.toLowerCase().includes(to.toLowerCase()) &&
            flight.date === departureDate
        );
        
        let returnFlights = [];
        if (tripType === 'round-trip') {
            returnFlights = allFlights.filter(flight => 
                flight.from.toLowerCase().includes(to.toLowerCase()) &&
                flight.to.toLowerCase().includes(from.toLowerCase()) &&
                flight.date === returnDate
            );
        }
        
        currentSearchResults = outboundFlights;
        
        // Update UI
        document.getElementById('from-city').textContent = from;
        document.getElementById('to-city').textContent = to;
        
        displayFlights(sortFlights(outboundFlights, 'price'));
        showSection('results');
    }
    
    function displayFlights(flights) {
        const flightResults = document.getElementById('flight-results');
        
        if (flights.length === 0) {
            flightResults.innerHTML = `
                <div class="text-center">
                    <i class="fas fa-plane-slash" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                    <h3>No flights found</h3>
                    <p>We couldn't find any flights matching your criteria. Try adjusting your search.</p>
                    <button class="btn-primary" data-section="search">Modify Search</button>
                </div>
            `;
            return;
        }
        
        flightResults.innerHTML = flights.map(flight => `
            <div class="flight-card" data-flight-id="${flight.id}">
                <div class="flight-info">
                    <div class="flight-airline">
                        <div class="airline-logo">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div>
                            <div class="airline-name">${flight.airline}</div>
                            <div class="flight-number">${flight.flightNumber}</div>
                        </div>
                    </div>
                    <div class="flight-times">
                        <div class="time">${flight.departure.time}</div>
                        <div class="city">${flight.departure.city}</div>
                    </div>
                    <div class="flight-duration">
                        ${flight.duration}
                        ${flight.stops > 0 ? `<div class="flight-stops">${flight.stops} stop${flight.stops > 1 ? 's' : ''}</div>` : '<div class="flight-stops">Non-stop</div>'}
                    </div>
                    <div class="flight-times">
                        <div class="time">${flight.arrival.time}</div>
                        <div class="city">${flight.arrival.city}</div>
                    </div>
                </div>
                <div class="flight-price">
                    <div class="price">$${flight.price}</div>
                    <div class="seats-available">${flight.seatsAvailable} seats left</div>
                    <button class="btn-primary select-flight">Select</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to select buttons
        document.querySelectorAll('.select-flight').forEach(button => {
            button.addEventListener('click', function() {
                const flightCard = this.closest('.flight-card');
                const flightId = parseInt(flightCard.getAttribute('data-flight-id'));
                const flight = flights.find(f => f.id === flightId);
                showBookingForm(flight);
            });
        });
    }
    
    function sortFlights(flights, criteria) {
        switch(criteria) {
            case 'price':
                return flights.sort((a, b) => a.price - b.price);
            case 'duration':
                return flights.sort((a, b) => {
                    const aDuration = parseInt(a.duration) * 60 + parseInt(a.duration.split('h ')[1] || 0);
                    const bDuration = parseInt(b.duration) * 60 + parseInt(b.duration.split('h ')[1] || 0);
                    return aDuration - bDuration;
                });
            case 'departure':
                return flights.sort((a, b) => a.departure.time.localeCompare(b.departure.time));
            default:
                return flights;
        }
    }
    
    function filterFlights(flights, stopsFilter) {
        if (stopsFilter === 'all') return flights;
        return flights.filter(flight => {
            if (stopsFilter === '0') return flight.stops === 0;
            if (stopsFilter === '1') return flight.stops === 1;
            if (stopsFilter === '2') return flight.stops >= 2;
            return true;
        });
    }
    
    // Booking process
    let selectedFlight = null;
    
    function showBookingForm(flight) {
        selectedFlight = flight;
        
        // Update flight summary
        const selectedFlightDiv = document.getElementById('selected-flight');
        selectedFlightDiv.innerHTML = `
            <div class="flight-card">
                <div class="flight-info">
                    <div class="flight-airline">
                        <div class="airline-logo">
                            <i class="fas fa-plane"></i>
                        </div>
                        <div>
                            <div class="airline-name">${flight.airline}</div>
                            <div class="flight-number">${flight.flightNumber}</div>
                        </div>
                    </div>
                    <div class="flight-times">
                        <div class="time">${flight.departure.time}</div>
                        <div class="city">${flight.departure.city}</div>
                    </div>
                    <div class="flight-duration">
                        ${flight.duration}
                    </div>
                    <div class="flight-times">
                        <div class="time">${flight.arrival.time}</div>
                        <div class="city">${flight.arrival.city}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Generate passenger forms
        const adults = currentSearchCriteria.adults;
        const children = currentSearchCriteria.children;
        const passengerForms = document.getElementById('passenger-forms');
        
        let formsHTML = '';
        for (let i = 0; i < adults; i++) {
            formsHTML += `
                <div class="passenger-form">
                    <h4>Adult ${i + 1}</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="passenger-first-${i}">First Name</label>
                            <input type="text" id="passenger-first-${i}" required>
                        </div>
                        <div class="form-group">
                            <label for="passenger-last-${i}">Last Name</label>
                            <input type="text" id="passenger-last-${i}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="passenger-dob-${i}">Date of Birth</label>
                        <input type="date" id="passenger-dob-${i}" required>
                    </div>
                    <div class="form-group">
                        <label for="passenger-passport-${i}">Passport Number</label>
                        <input type="text" id="passenger-passport-${i}" required>
                    </div>
                </div>
            `;
        }
        
        for (let i = 0; i < children; i++) {
            formsHTML += `
                <div class="passenger-form">
                    <h4>Child ${i + 1}</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="child-first-${i}">First Name</label>
                            <input type="text" id="child-first-${i}" required>
                        </div>
                        <div class="form-group">
                            <label for="child-last-${i}">Last Name</label>
                            <input type="text" id="child-last-${i}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="child-dob-${i}">Date of Birth</label>
                        <input type="date" id="child-dob-${i}" required>
                    </div>
                </div>
            `;
        }
        
        passengerForms.innerHTML = formsHTML;
        
        // Calculate and display prices
        updatePriceDisplay(flight.price, adults, children);
        
        // Show booking section
        showSection('booking');
    }
    
    function updatePriceDisplay(basePrice, adults, children) {
        const passengerCount = adults + children;
        const baseFare = basePrice * passengerCount;
        const taxes = baseFare * 0.15;
        const serviceCharge = passengerCount * 25;
        const total = baseFare + taxes + serviceCharge;
        
        document.getElementById('passenger-count').textContent = passengerCount;
        document.getElementById('base-fare').textContent = `$${baseFare}`;
        document.getElementById('taxes').textContent = `$${taxes.toFixed(2)}`;
        document.getElementById('service-charge').textContent = `$${serviceCharge}`;
        document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
        document.getElementById('final-price').textContent = total.toFixed(2);
    }
    
    function processBooking() {
        // Collect passenger data
        const adults = currentSearchCriteria.adults;
        const children = currentSearchCriteria.children;
        const passengers = [];
        
        for (let i = 0; i < adults; i++) {
            passengers.push({
                type: 'adult',
                firstName: document.getElementById(`passenger-first-${i}`).value,
                lastName: document.getElementById(`passenger-last-${i}`).value,
                dob: document.getElementById(`passenger-dob-${i}`).value,
                passport: document.getElementById(`passenger-passport-${i}`).value
            });
        }
        
        for (let i = 0; i < children; i++) {
            passengers.push({
                type: 'child',
                firstName: document.getElementById(`child-first-${i}`).value,
                lastName: document.getElementById(`child-last-${i}`).value,
                dob: document.getElementById(`child-dob-${i}`).value
            });
        }
        
        // Generate booking reference
        const bookingRef = 'SKW' + Math.floor(100000000 + Math.random() * 900000000);
        
        // Generate seat assignment
        const seats = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        for (let i = 0; i < passengers.length; i++) {
            const row = Math.floor(10 + Math.random() * 30);
            const seat = rows[Math.floor(Math.random() * rows.length)];
            seats.push(`${row}${seat}`);
        }
        
        // Create booking object
        const booking = {
            id: Date.now(),
            reference: bookingRef,
            flight: selectedFlight,
            passengers: passengers,
            seats: seats,
            contact: {
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value
            },
            payment: {
                method: document.querySelector('.payment-method.active').getAttribute('data-method'),
                amount: parseFloat(document.getElementById('total-price').textContent.replace('$', '')),
                cardLast4: document.getElementById('card-number').value ? document.getElementById('card-number').value.slice(-4) : 'N/A'
            },
            bookingDate: new Date().toISOString(),
            status: 'confirmed'
        };
        
        // Save booking to localStorage
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings'));
        bookings.push(booking);
        localStorage.setItem('skywings_bookings', JSON.stringify(bookings));
        
        // Update flight availability
        updateFlightAvailability(selectedFlight.id, passengers.length);
        
        // Show confirmation
        showConfirmation(booking);
    }
    
    function updateFlightAvailability(flightId, passengersBooked) {
        const flights = JSON.parse(localStorage.getItem('skywings_flights'));
        const flightIndex = flights.findIndex(f => f.id === flightId);
        
        if (flightIndex !== -1) {
            flights[flightIndex].seatsAvailable = Math.max(0, flights[flightIndex].seatsAvailable - passengersBooked);
            localStorage.setItem('skywings_flights', JSON.stringify(flights));
        }
    }
    
    function showConfirmation(booking) {
        // Update confirmation details
        document.getElementById('booking-ref').textContent = booking.reference;
        document.getElementById('passenger-name').textContent = `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`;
        document.getElementById('confirmation-flight').textContent = 
            `${booking.flight.flightNumber} (${booking.flight.from} to ${booking.flight.to})`;
        document.getElementById('confirmation-date').textContent = 
            `${formatDate(booking.flight.date)}, ${booking.flight.departure.time}`;
        document.getElementById('confirmation-price').textContent = `$${booking.payment.amount.toFixed(2)}`;
        
        // Update boarding pass preview
        document.getElementById('bp-from-city').textContent = booking.flight.from.split('(')[1].replace(')', '');
        document.getElementById('bp-to-city').textContent = booking.flight.to.split('(')[1].replace(')', '');
        document.getElementById('bp-from-time').textContent = booking.flight.departure.time;
        document.getElementById('bp-to-time').textContent = booking.flight.arrival.time;
        document.getElementById('bp-passenger').textContent = 
            `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`.toUpperCase();
        document.getElementById('bp-seat').textContent = booking.seats[0];
        
        showSection('confirmation');
    }
    
    // Flight tracking
    function trackFlight() {
        const trackingNumber = document.getElementById('tracking-number').value.trim().toUpperCase();
        const trackingResults = document.getElementById('tracking-results');
        
        if (!trackingNumber) {
            trackingResults.innerHTML = `
                <div class="text-center">
                    <p>Please enter a booking reference or flight number</p>
                </div>
            `;
            trackingResults.classList.remove('hidden');
            return;
        }
        
        // Check if it's a booking reference
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings'));
        const booking = bookings.find(b => b.reference === trackingNumber);
        
        if (booking) {
            displayBookingTracking(booking);
            return;
        }
        
        // Check if it's a flight number
        const flights = JSON.parse(localStorage.getItem('skywings_flights'));
        const flight = flights.find(f => f.flightNumber === trackingNumber);
        
        if (flight) {
            displayFlightTracking(flight);
            return;
        }
        
        // Not found
        trackingResults.innerHTML = `
            <div class="text-center">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>No flight found</h3>
                <p>We couldn't find any flight or booking with that reference.</p>
                <p>Please check your entry and try again.</p>
            </div>
        `;
        trackingResults.classList.remove('hidden');
    }
    
    function displayBookingTracking(booking) {
        const flight = booking.flight;
        const trackingResults = document.getElementById('tracking-results');
        
        // Generate flight status based on current time
        const flightDate = new Date(`${flight.date}T${flight.departure.time}`);
        const now = new Date();
        const hoursUntilFlight = (flightDate - now) / (1000 * 60 * 60);
        
        let status, statusClass, timeline;
        
        if (hoursUntilFlight > 24) {
            status = 'Scheduled';
            statusClass = 'status-scheduled';
            timeline = generateTimeline(flight, 'scheduled');
        } else if (hoursUntilFlight > 2) {
            status = 'Check-in Open';
            statusClass = 'status-scheduled';
            timeline = generateTimeline(flight, 'checkin');
        } else if (hoursUntilFlight > 0) {
            status = 'Boarding';
            statusClass = 'status-boarding';
            timeline = generateTimeline(flight, 'boarding');
        } else if (hoursUntilFlight > -2) {
            status = 'In Air';
            statusClass = 'status-in-air';
            timeline = generateTimeline(flight, 'in-air');
        } else {
            status = 'Landed';
            statusClass = 'status-landed';
            timeline = generateTimeline(flight, 'landed');
        }
        
        trackingResults.innerHTML = `
            <div class="flight-status">
                <h3>Flight ${flight.flightNumber}</h3>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            <div class="flight-route">
                <p><strong>Route:</strong> ${flight.from} to ${flight.to}</p>
                <p><strong>Date:</strong> ${formatDate(flight.date)}</p>
                <p><strong>Departure:</strong> ${flight.departure.time} • <strong>Arrival:</strong> ${flight.arrival.time}</p>
                <p><strong>Duration:</strong> ${flight.duration}</p>
                <p><strong>Booking Reference:</strong> ${booking.reference}</p>
                ${status === 'In Air' ? `<p><strong>Current Location:</strong> Over ${getRandomLocation(flight.from, flight.to)}</p>` : ''}
                ${['Boarding', 'Check-in Open'].includes(status) ? `<p><strong>Gate:</strong> ${getRandomGate()}</p>` : ''}
            </div>
            <div class="tracking-timeline">
                ${timeline}
            </div>
            <div class="passenger-info">
                <h4>Passengers</h4>
                <div class="passengers-list">
                    ${booking.passengers.map((passenger, index) => `
                        <div class="passenger-item">
                            <span>${passenger.firstName} ${passenger.lastName}</span>
                            <span class="seat">Seat: ${booking.seats[index]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        trackingResults.classList.remove('hidden');
    }
    
    function displayFlightTracking(flight) {
        const trackingResults = document.getElementById('tracking-results');
        
        // Simplified tracking for flight number only
        const flightDate = new Date(`${flight.date}T${flight.departure.time}`);
        const now = new Date();
        const hoursUntilFlight = (flightDate - now) / (1000 * 60 * 60);
        
        let status, statusClass;
        
        if (hoursUntilFlight > 2) {
            status = 'Scheduled';
            statusClass = 'status-scheduled';
        } else if (hoursUntilFlight > 0) {
            status = 'On Time';
            statusClass = 'status-scheduled';
        } else if (hoursUntilFlight > -2) {
            status = 'In Air';
            statusClass = 'status-in-air';
        } else {
            status = 'Landed';
            statusClass = 'status-landed';
        }
        
        trackingResults.innerHTML = `
            <div class="flight-status">
                <h3>Flight ${flight.flightNumber}</h3>
                <span class="status-badge ${statusClass}">${status}</span>
            </div>
            <div class="flight-route">
                <p><strong>Route:</strong> ${flight.from} to ${flight.to}</p>
                <p><strong>Date:</strong> ${formatDate(flight.date)}</p>
                <p><strong>Departure:</strong> ${flight.departure.time} • <strong>Arrival:</strong> ${flight.arrival.time}</p>
                <p><strong>Duration:</strong> ${flight.duration}</p>
                <p><strong>Airline:</strong> ${flight.airline}</p>
                ${status === 'In Air' ? `<p><strong>Current Status:</strong> En route to destination</p>` : ''}
                ${status === 'Scheduled' ? `<p><strong>Status:</strong> Flight is scheduled to depart on time</p>` : ''}
            </div>
        `;
        
        trackingResults.classList.remove('hidden');
    }
    
    function generateTimeline(flight, status) {
        const baseTime = new Date(`${flight.date}T${flight.departure.time}`);
        const events = [
            { time: new Date(baseTime.getTime() - 2 * 60 * 60 * 1000), event: 'Check-in opens', completed: false },
            { time: new Date(baseTime.getTime() - 1 * 60 * 60 * 1000), event: 'Boarding starts', completed: false },
            { time: new Date(baseTime.getTime() - 30 * 60 * 1000), event: 'Boarding closes', completed: false },
            { time: baseTime, event: 'Flight departs', completed: false },
            { time: new Date(baseTime.getTime() + getFlightDuration(flight.duration) * 60 * 1000), event: 'Flight arrives', completed: false }
        ];
        
        const now = new Date();
        let timelineHTML = '';
        
        events.forEach((event, index) => {
            const isCompleted = event.time < now;
            const isActive = index > 0 && events[index - 1].time < now && event.time > now;
            const classNames = ['timeline-item'];
            if (isCompleted) classNames.push('completed');
            if (isActive) classNames.push('active');
            
            timelineHTML += `
                <div class="${classNames.join(' ')}">
                    <div class="timeline-time">${formatTime(event.time)}</div>
                    <div class="timeline-event">${event.event}</div>
                </div>
            `;
        });
        
        return timelineHTML;
    }
    
    function getFlightDuration(durationStr) {
        const [hours, minutes] = durationStr.split('h ').map(part => parseInt(part));
        return hours * 60 + (minutes || 0);
    }
    
    // My Bookings
    function loadUserBookings() {
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings'));
        const bookingsList = document.getElementById('bookings-list');
        const noBookings = document.getElementById('no-bookings');
        
        if (bookings.length === 0) {
            noBookings.classList.remove('hidden');
            bookingsList.classList.add('hidden');
            return;
        }
        
        noBookings.classList.add('hidden');
        bookingsList.classList.remove('hidden');
        
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header-row">
                    <div>
                        <span class="booking-ref">${booking.reference}</span>
                        <span class="booking-status status-badge status-scheduled">Confirmed</span>
                    </div>
                    <div class="booking-actions">
                        <button class="btn-secondary view-booking" data-ref="${booking.reference}">View Details</button>
                        <button class="btn-primary track-booking" data-ref="${booking.reference}">Track Flight</button>
                    </div>
                </div>
                <div class="booking-details">
                    <p><strong>Flight:</strong> ${booking.flight.flightNumber} - ${booking.flight.from} to ${booking.flight.to}</p>
                    <p><strong>Date:</strong> ${formatDate(booking.flight.date)} at ${booking.flight.departure.time}</p>
                    <p><strong>Passengers:</strong> ${booking.passengers.length} • <strong>Total:</strong> $${booking.payment.amount.toFixed(2)}</p>
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        document.querySelectorAll('.view-booking').forEach(btn => {
            btn.addEventListener('click', function() {
                const ref = this.getAttribute('data-ref');
                viewBookingDetails(ref);
            });
        });
        
        document.querySelectorAll('.track-booking').forEach(btn => {
            btn.addEventListener('click', function() {
                const ref = this.getAttribute('data-ref');
                document.getElementById('tracking-number').value = ref;
                showSection('tracking');
                trackFlight();
            });
        });
    }
    
    function viewBookingDetails(bookingRef) {
        const bookings = JSON.parse(localStorage.getItem('skywings_bookings'));
        const booking = bookings.find(b => b.reference === bookingRef);
        
        if (booking) {
            // For simplicity, we'll just show the tracking info
            document.getElementById('tracking-number').value = bookingRef;
            showSection('tracking');
            trackFlight();
        }
    }
    
    // Utility functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    function formatTime(date) {
        return date.toTimeString().substring(0, 5);
    }
    
    function getRandomLocation(from, to) {
        const locations = [
            'the Atlantic Ocean', 'the Pacific Ocean', 'mountain ranges', 
            'coastal areas', 'rural countryside', 'the Great Lakes',
            'the Mediterranean Sea', 'the North Sea', 'the Caribbean Sea'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }
    
    function getRandomGate() {
        const letters = ['A', 'B', 'C', 'D'];
        const number = Math.floor(Math.random() * 30) + 1;
        return `${letters[Math.floor(Math.random() * letters.length)]}${number}`;
    }
});