// --- MODAL LOGIC (Only runs if modal exists) ---
const modal = document.getElementById('imageModal');

if (modal) {
    const images = document.querySelectorAll('.image-grid img');
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

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function setTransform() {
        modalImage.style.transform = `translate(-50%, -50%) translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    function resetZoom() {
        scale = 1;
        pointX = 0;
        pointY = 0;
        isDragging = false;
        setTransform();
    }

    function openModal(index) {
        currentIndex = index;
        modalImage.src = images[currentIndex].src;
        modalAltText.textContent = images[currentIndex].alt;
        resetZoom();
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
        resetZoom();
    }

    function nextImage() {
        resetZoom();
        currentIndex = (currentIndex + 1) % images.length;
        modalImage.src = images[currentIndex].src;
        modalAltText.textContent = images[currentIndex].alt;
    }

    function prevImage() {
        resetZoom();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        modalImage.src = images[currentIndex].src;
        modalAltText.textContent = images[currentIndex].alt;
    }

    // Add event listeners for images
    if (!isMobile()) {
        images.forEach((image, index) => {
            image.addEventListener('click', () => openModal(index));
        });

        modalImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            scale += delta;
            scale = Math.min(Math.max(1, scale), 5);
            setTransform();
        });

         modalImage.addEventListener('mousedown', (e) => {
            e.preventDefault();
            // REMOVED: if (scale > 1) { ... }
            isDragging = true;
            startX = e.clientX - pointX;
            startY = e.clientY - pointY;
            modalImage.style.cursor = 'grabbing';
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

    // Navigation arrows (Check if they exist first)
    if (leftArrow) leftArrow.addEventListener('click', prevImage);
    if (rightArrow) rightArrow.addEventListener('click', nextImage);

    // Close modal on outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}

// --- LANGUAGE TOGGLE LOGIC ---
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
    if (englishBtn) englishBtn.classList.toggle('active', lang === 'english');
    if (dutchBtn) dutchBtn.classList.toggle('active', lang === 'dutch');
}

if (englishBtn && dutchBtn) {
    englishBtn.addEventListener('click', () => changeLanguage('english'));
    dutchBtn.addEventListener('click', () => changeLanguage('dutch'));
}

window.addEventListener('load', () => {
    const savedLanguage = localStorage.getItem('language') || 'english';
    changeLanguage(savedLanguage);
});

// --- HASH CHANGE HANDLER ---
window.addEventListener('hashchange', e => {
    history.replaceState({}, "", location.hash.slice(1));
});

// --- CONTACT BUTTON FLASH ANIMATION ---
const contactNavLink = document.querySelector('nav a[href*="contact"]');
const contactSection = document.getElementById('contact');
const socialIcons = document.querySelectorAll('.contact-info a');

let isTargetingContact = false;

// 1. The Animation Trigger (Reusable)
function triggerContactWave() {
    socialIcons.forEach((icon, index) => {
        // Reset animation state
        icon.classList.remove('flash-active');
        void icon.offsetWidth; // Trigger Reflow to restart animation

        // Start animation
        icon.classList.add('flash-active');
    });
}

// 2. The Observer (Handles the "Scroll To" case)
if (contactSection && socialIcons.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        
        // Only trigger if we are scrolling to it via the button
        if (entry.isIntersecting && isTargetingContact) {
            triggerContactWave();
            isTargetingContact = false; // Reset flag so it doesn't loop
        }
    }, { threshold: 0.1 }); // Low threshold so it triggers as soon as it appears

    observer.observe(contactSection);
}

// 3. The Click Listener (Handles both "Scroll To" and "Already There")
if (contactNavLink) {
    contactNavLink.addEventListener('click', () => {
        isTargetingContact = true;

        // Check if the contact section is ALREADY visible
        const rect = contactSection.getBoundingClientRect();
        const isVisible = (
            rect.top < window.innerHeight && 
            rect.bottom >= 0
        );

        if (isVisible) {
            // We are already there, so play immediately!
            triggerContactWave();
            isTargetingContact = false; // Reset flag immediately
        }
        // If not visible, the Observer above will catch it when the scroll finishes.
    });
}


// Add Keyboard Navigation
window.addEventListener('keydown', (e) => {
    // Only trigger if the modal is currently visible
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowRight') {
            nextImage();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
});