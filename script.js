// Get all images in the grid
const images = document.querySelectorAll('.image-grid img');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalAltText = document.getElementById('modalAltText');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentIndex = 0;

// Variables for Zoom and Pan
let scale = 1;
let pointX = 0;
let pointY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

// Function to check if the device is mobile
function isMobile() {
    return window.innerWidth <= 768;
}

// Helper to apply the current transform state
function setTransform() {
    // We keep translate(-50%, -50%) because the CSS centers the image this way.
    // We append our custom pan (pointX, pointY) and zoom (scale).
    modalImage.style.transform = `translate(-50%, -50%) translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

// Function to reset zoom/pan to default
function resetZoom() {
    scale = 1;
    pointX = 0;
    pointY = 0;
    isDragging = false;
    setTransform();
}

// Function to open the modal
function openModal(index) {
    currentIndex = index;
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt;
    
    // Reset zoom every time we open a new image
    resetZoom();
    
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
    resetZoom();
}

// Function to navigate to the next image
function nextImage() {
    resetZoom(); // Reset before switching
    currentIndex = (currentIndex + 1) % images.length;
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt;
}

// Function to navigate to the previous image
function prevImage() {
    resetZoom(); // Reset before switching
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt;
}

// Add event listeners
if (!isMobile()) {
    images.forEach((image, index) => {
        image.addEventListener('click', () => openModal(index));
    });

    // --- SCROLL TO ZOOM ---
    modalImage.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevent the actual page from scrolling
        
        // Determine direction (up or down) and speed
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        
        // Update scale
        scale += delta;
        
        // Restrict scale between 1x (original) and 5x (zoomed in)
        scale = Math.min(Math.max(1, scale), 5);
        
        setTransform();
    });

    // --- DRAG TO PAN ---
    modalImage.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent default image dragging behavior
        // Only allow dragging if we are zoomed in
        if (scale > 1) {
            isDragging = true;
            startX = e.clientX - pointX;
            startY = e.clientY - pointY;
            modalImage.style.cursor = 'grabbing';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        
        setTransform();
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        modalImage.style.cursor = 'grab';
    });
}

// Navigation arrows
leftArrow.addEventListener('click', prevImage);
rightArrow.addEventListener('click', nextImage);

// Close modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Hash change handler
window.addEventListener('hashchange', e => {
    history.replaceState({}, "", location.hash.slice(1));
});

// Language Toggle Logic
const englishBtn = document.getElementById('englishBtn');
const dutchBtn = document.getElementById('dutchBtn');

function changeLanguage(lang) {
    const elements = document.querySelectorAll('[data-english], [data-dutch]');
    elements.forEach(element => {
        if (lang === 'english') {
            element.textContent = element.getAttribute('data-english');
        } else if (lang === 'dutch') {
            element.textContent = element.getAttribute('data-dutch');
        }
    });

    localStorage.setItem('language', lang);
    englishBtn.classList.toggle('active', lang === 'english');
    dutchBtn.classList.toggle('active', lang === 'dutch');
}

if (englishBtn && dutchBtn) {
    englishBtn.addEventListener('click', () => changeLanguage('english'));
    dutchBtn.addEventListener('click', () => changeLanguage('dutch'));
}

window.addEventListener('load', () => {
    const savedLanguage = localStorage.getItem('language') || 'english'; 
    changeLanguage(savedLanguage);
});