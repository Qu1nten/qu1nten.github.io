// Carousels on nodenium.html: arrows switch between the media of a build,
// and videos only play while they are on screen.

// Fades the name in the nav bar in/out, same as script.js on the other pages
window.addEventListener('scroll', () => {
    document.body.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

const carousels =document.querySelectorAll('.nd-carousel');

carousels.forEach(carousel => {
    const slides = carousel.querySelectorAll('.nd-slide');
    let currentIndex = 0;
    let onScreen = false;

    if (slides.length < 2) {
        carousel.classList.add('single');
    }

    // Hide media that could not be loaded (e.g. file not uploaded yet)
    slides.forEach(slide => {
        slide.addEventListener('error', () => slide.classList.add('missing'));
    });

    function updatePlayback() {
        slides.forEach((slide, index) => {
            if (slide.tagName !== 'VIDEO') return;

            if (onScreen && index === currentIndex) {
                slide.play().catch(() => {});
            } else {
                slide.pause();
            }
        });
    }

    let leaveTimer;

    function showSlide(index) {
        const oldSlide = slides[currentIndex];
        currentIndex = (index + slides.length) % slides.length; // Cycle around
        const newSlide = slides[currentIndex];
        if (newSlide === oldSlide) {
            newSlide.classList.add('active');
            updatePlayback();
            return;
        }

        // Keep the old slide visible underneath until the new one has faded in
        clearTimeout(leaveTimer);
        slides.forEach(slide => slide.classList.remove('leaving'));
        oldSlide.classList.remove('active');
        oldSlide.classList.add('leaving');
        newSlide.classList.add('active');
        leaveTimer = setTimeout(() => oldSlide.classList.remove('leaving'), 400);

        updatePlayback();
    }

    carousel.querySelector('.nd-prev').addEventListener('click', () => showSlide(currentIndex - 1));
    carousel.querySelector('.nd-next').addEventListener('click', () => showSlide(currentIndex + 1));

    // Play when at least half of the media is visible, pause otherwise
    const observer = new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
        updatePlayback();
    }, { threshold: 0.5 });

    observer.observe(carousel.querySelector('.nd-slides'));

    showSlide(0);
});


// --- SCREENSHOT GALLERY ---
// Fits the screenshots together like blocks: works out how many rows are needed,
// spreads the images over those rows as evenly as possible, then scales each row
// so it fills the full width exactly. No row is ever left half empty.
const gallery = document.querySelector('.nd-gallery');
const galleryImages = document.querySelectorAll('.nd-gallery img');

function ratioOf(img) {
    return img.naturalWidth ? img.naturalWidth / img.naturalHeight : 16 / 9; // Guess until loaded
}

// Split the ratios into `rowCount` consecutive rows whose total widths are as equal as possible
function splitIntoRows(ratios, rowCount) {
    const n = ratios.length;
    const prefix = [0];
    ratios.forEach(r => prefix.push(prefix[prefix.length - 1] + r));
    const ideal = prefix[n] / rowCount;

    // cost[k][i] = best cost to put the first i images in k rows
    const cost = Array.from({ length: rowCount + 1 }, () => Array(n + 1).fill(Infinity));
    const cut = Array.from({ length: rowCount + 1 }, () => Array(n + 1).fill(0));
    cost[0][0] = 0;
    for (let k = 1; k <= rowCount; k++) {
        for (let i = k; i <= n; i++) {
            for (let j = k - 1; j < i; j++) {
                const c = cost[k - 1][j] + (prefix[i] - prefix[j] - ideal) ** 2;
                if (c < cost[k][i]) {
                    cost[k][i] = c;
                    cut[k][i] = j;
                }
            }
        }
    }

    const rows = [];
    for (let k = rowCount, i = n; k > 0; k--) {
        const j = cut[k][i];
        rows.unshift([j, i]);
        i = j;
    }
    return rows;
}

function layoutGallery() {
    if (!gallery || galleryImages.length === 0) return;

    const width = gallery.clientWidth;
    const gap = parseFloat(getComputedStyle(gallery).columnGap) || 0;
    const targetHeight = window.innerWidth <= 768 ? 120 : 220;
    const ratios = [...galleryImages].map(ratioOf);
    const totalRatio = ratios.reduce((a, b) => a + b, 0);
    const rowCount = Math.min(galleryImages.length, Math.max(1, Math.round(totalRatio * targetHeight / width)));

    splitIntoRows(ratios, rowCount).forEach(([start, end]) => {
        const rowRatio = ratios.slice(start, end).reduce((a, b) => a + b, 0);
        const height = (width - gap * (end - start - 1)) / rowRatio;
        for (let i = start; i < end; i++) {
            // Shave a hair off so rounding never pushes the last image onto the next row
            galleryImages[i].style.width = (height * ratios[i] - 0.05) + 'px';
            galleryImages[i].style.height = height + 'px';
        }
    });
}

galleryImages.forEach(img => {
    if (!img.complete) img.addEventListener('load', layoutGallery);
});

// Redo the layout whenever the gallery's width changes (window resize, phone rotation, ...)
if (gallery) {
    let lastWidth = 0;
    const relayoutIfResized = () => {
        if (gallery.clientWidth !== lastWidth) {
            lastWidth = gallery.clientWidth;
            layoutGallery();
        }
    };
    new ResizeObserver(relayoutIfResized).observe(gallery);
    window.addEventListener('resize', relayoutIfResized);
}


// --- IMAGE MODAL ---
// Same behaviour as the modal in script.js on the other pages: click to open,
// arrows / arrow keys to browse, scroll to zoom, drag to pan, click outside or Esc to close.
const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalAltText = document.getElementById('modalAltText');

let modalIndex = 0;
let scale = 1;
let pointX = 0;
let pointY = 0;
let startX = 0;
let startY = 0;
let isDragging = false;

function isMobile() {
    return window.innerWidth <= 768 || window.matchMedia('(hover: none)').matches;
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

function showModalImage(index) {
    modalIndex = (index + galleryImages.length) % galleryImages.length; // Cycle around
    modalImage.src = galleryImages[modalIndex].src;
    modalAltText.textContent = galleryImages[modalIndex].alt;
    resetZoom();
}

function openModal(index) {
    showModalImage(index);
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    resetZoom();
}

if (!isMobile()) {
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });

    modalImage.addEventListener('wheel', e => {
        e.preventDefault();
        scale = Math.min(Math.max(1, scale + (e.deltaY > 0 ? -0.1 : 0.1)), 5);
        setTransform();
    });

    modalImage.addEventListener('mousedown', e => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        modalImage.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', e => {
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

modal.querySelector('.left-arrow').addEventListener('click', () => showModalImage(modalIndex - 1));
modal.querySelector('.right-arrow').addEventListener('click', () => showModalImage(modalIndex + 1));

modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
});

window.addEventListener('keydown', e => {
    if (modal.style.display !== 'block') return;
    if (e.key === 'ArrowRight') showModalImage(modalIndex + 1);
    else if (e.key === 'ArrowLeft') showModalImage(modalIndex - 1);
    else if (e.key === 'Escape') closeModal();
});
