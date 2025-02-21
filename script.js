   // Get all images in the grid
const images = document.querySelectorAll('.image-grid img');
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalAltText = document.getElementById('modalAltText');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentIndex = 0;

// Function to open the modal and display the clicked image
function openModal(index) {
    currentIndex = index;
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt; // Set the alt text
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Function to navigate to the next image
function nextImage() {
    currentIndex = (currentIndex + 1) % images.length; // Cycle back to the first image
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt; // Update alt text
}

// Function to navigate to the previous image
function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length; // Cycle back to the last image
    modalImage.src = images[currentIndex].src;
    modalAltText.textContent = images[currentIndex].alt; // Update alt text
}

// Function to check if the device is mobile
function isMobile() {
    return window.innerWidth <= 768; // Adjust this value to match your mobile breakpoint
}

// Add event listeners to all images (only if not on mobile)
if (!isMobile()) {
    images.forEach((image, index) => {
        image.addEventListener('click', () => openModal(index));
    });
}

// Add event listeners to navigation arrows
leftArrow.addEventListener('click', prevImage);
rightArrow.addEventListener('click', nextImage);

// Close the modal if the user clicks outside the image
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

    
// Function to check if the device is mobile
function isMobile() {
    return window.innerWidth <= 768; // Adjust this value to match your mobile breakpoint
}

// Add event listeners to all images (only if not on mobile)
if (!isMobile()) {
    images.forEach((image, index) => {
        image.addEventListener('click', () => openModal(index));
    });
}






    function enlargeImage(img) {
        // Toggle the 'enlarged' class on the clicked image
        img.classList.toggle('enlarged');

        // If the image is enlarged, add an event listener to the document to handle clicks outside the image
        if (img.classList.contains('enlarged')) {
            document.addEventListener('click', function onClickOutside(event) {
                if (!img.contains(event.target)) {
                    // Clicked outside the image, so remove the 'enlarged' class
                    img.classList.remove('enlarged');
                    // Remove the event listener after handling the click
                    document.removeEventListener('click', onClickOutside);
                }
            });
        }
    }

    // Add event listeners to all images (only if not on mobile)
if (!isMobile()) {
    images.forEach((image, index) => {
        image.addEventListener('click', () => openModal(index));
    });
}




    window.addEventListener('hashchange', e => {
        history.replaceState({}, "", location.hash.slice(1));
    });








    // Get the language toggle buttons
const englishBtn = document.getElementById('englishBtn');
const dutchBtn = document.getElementById('dutchBtn');




// Function to change the language
function changeLanguage(lang) {
    // Get all elements with data-english and data-dutch attributes
    const elements = document.querySelectorAll('[data-english], [data-dutch]');

    elements.forEach(element => {
        if (lang === 'english') {
            element.textContent = element.getAttribute('data-english');
        } else if (lang === 'dutch') {
            element.textContent = element.getAttribute('data-dutch');
        }
    });

    // Save the selected language to localStorage
    localStorage.setItem('language', lang);

    // Update the active class on the buttons
    englishBtn.classList.toggle('active', lang === 'english');
    dutchBtn.classList.toggle('active', lang === 'dutch');
}

// Event listeners for the language toggle buttons
englishBtn.addEventListener('click', () => changeLanguage('english'));
dutchBtn.addEventListener('click', () => changeLanguage('dutch'));

// Check for saved language preference on page load
window.addEventListener('load', () => {
    const savedLanguage = localStorage.getItem('language') || 'english'; // Default to English
    changeLanguage(savedLanguage);
});