/* =============================================
   SocialBoost — Main Script
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // PARTICLES
    // ============================
    const particlesContainer = document.getElementById('particles');
    function createParticles() {
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            p.style.left = Math.random() * 100 + '%';
            p.style.top = (100 + Math.random() * 20) + '%';
            p.style.width = (2 + Math.random() * 4) + 'px';
            p.style.height = p.style.width;
            p.style.animationDuration = (8 + Math.random() * 15) + 's';
            p.style.animationDelay = Math.random() * 10 + 's';
            p.style.opacity = 0;
            particlesContainer.appendChild(p);
        }
    }
    createParticles();

    // ============================
    // HEADER SCROLL
    // ============================
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ============================
    // BURGER MENU
    // ============================
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    // Close nav on link click
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ============================
    // ANIMATE ON SCROLL
    // ============================
    const observerOptions = { threshold: 0.15, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll(
        '.platform-card, .service-card, .step, .review-card, .order-form, .order__info-card'
    ).forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // ============================
    // COUNTER ANIMATION
    // ============================
    function animateCounter(el) {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            let current = Math.floor(eased * target);

            if (target >= 1000000) {
                el.textContent = (current / 1000000).toFixed(1) + 'M+';
            } else if (target >= 1000) {
                el.textContent = (current / 1000).toFixed(0) + 'K+';
            } else {
                el.textContent = current + (target < 10 ? '' : '%');
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.hero__stat-value').forEach(el => statObserver.observe(el));

    // ============================
    // ORDER FORM
    // ============================
    const platformSelect = document.getElementById('platform');
    const serviceSelect = document.getElementById('service');
    const quantityInput = document.getElementById('quantity');
    const quantityRange = document.getElementById('quantityRange');
    const totalPrice = document.getElementById('totalPrice');

    // Sync range and number inputs
    quantityInput.addEventListener('input', () => {
        quantityRange.value = Math.min(quantityInput.value, 100000);
    });
    quantityRange.addEventListener('input', () => {
        quantityInput.value = quantityRange.value;
    });

    // Platform buttons on cards → set platform in form
    document.querySelectorAll('.platform-card__btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.dataset.platform;
            if (platform) {
                platformSelect.value = platform;
            }
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ============================
    // LINK PREVIEW
    // ============================
    const linkInput = document.getElementById('link');
    const linkPreview = document.getElementById('linkPreview');
    const linkPreviewContent = document.getElementById('linkPreviewContent');
    let previewTimeout = null;

    function getYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    }

    function detectPlatform(url) {
        if (/youtube\.com|youtu\.be/i.test(url)) return { name: 'YouTube', icon: '▶️', color: '#ff0000' };
        if (/tiktok\.com/i.test(url)) return { name: 'TikTok', icon: '🎵', color: '#ff0050' };
        if (/instagram\.com/i.test(url)) return { name: 'Instagram', icon: '📷', color: '#e4405f' };
        if (/t\.me|telegram/i.test(url)) return { name: 'Telegram', icon: '✈️', color: '#0088cc' };
        return null;
    }

    function showPreview(url) {
        const platform = detectPlatform(url);
        if (!platform) {
            linkPreview.classList.remove('active');
            return;
        }

        // Auto-select platform in dropdown
        if (platform.name === 'YouTube') platformSelect.value = 'youtube';
        else if (platform.name === 'TikTok') platformSelect.value = 'tiktok';
        else if (platform.name === 'Instagram') platformSelect.value = 'instagram';
        else if (platform.name === 'Telegram') platformSelect.value = 'telegram';

        const ytId = getYouTubeId(url);

        if (ytId) {
            // YouTube — show embedded video
            linkPreviewContent.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else if (ytId === null && platform.name === 'YouTube') {
            // YouTube link but can't extract ID — show card
            linkPreviewContent.innerHTML = buildCardHTML(platform, url);
        } else {
            // TikTok, Instagram, Telegram — show preview card with thumbnail
            linkPreviewContent.innerHTML = buildCardHTML(platform, url);
        }

        linkPreview.classList.add('active');
    }

    function buildCardHTML(platform, url) {
        const shortUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
        return `
            <div class="link-preview__card">
                <div class="link-preview__thumb" style="border: 2px solid ${platform.color}">
                    <span>${platform.icon}</span>
                </div>
                <div class="link-preview__info">
                    <div class="link-preview__platform" style="color: ${platform.color}">${platform.name}</div>
                    <div class="link-preview__url">${shortUrl}</div>
                    <div class="link-preview__status">
                        <span class="link-preview__status-dot"></span>
                        Content detected
                    </div>
                </div>
            </div>
        `;
    }

    linkInput.addEventListener('input', () => {
        clearTimeout(previewTimeout);
        const url = linkInput.value.trim();
        if (url.length < 10) {
            linkPreview.classList.remove('active');
            return;
        }
        previewTimeout = setTimeout(() => showPreview(url), 500);
    });

    linkInput.addEventListener('paste', () => {
        setTimeout(() => {
            const url = linkInput.value.trim();
            if (url) showPreview(url);
        }, 100);
    });

    // ============================
    // FORM SUBMIT — FAKE
    // ============================
    const form = document.getElementById('orderForm');
    const modal = document.getElementById('successModal');
    const modalDetails = document.getElementById('modalDetails');
    const closeModalBtn = document.getElementById('closeModal');

    const platformNames = {
        tiktok: 'TikTok',
        youtube: 'YouTube',
        instagram: 'Instagram',
        telegram: 'Telegram'
    };

    const serviceNames = {
        views: 'Views',
        likes: 'Likes',
        followers: 'Followers',
        reposts: 'Reposts'
    };

    // Preload Adsterra ad script when user starts filling the form
    // so the popunder triggers exactly on "Get for Free" click
    let adLoaded = false;
    function preloadAd() {
        if (adLoaded) return;
        adLoaded = true;
        const adScript = document.createElement('script');
        adScript.src = 'https://pl28838828.effectivegatecpm.com/50/38/35/50383570ded5ffbeb43be7f1d11a5c31.js';
        document.body.appendChild(adScript);
    }

    // Load ad when user interacts with form fields
    platformSelect.addEventListener('change', preloadAd);
    serviceSelect.addEventListener('change', preloadAd);
    document.getElementById('link').addEventListener('focus', preloadAd);

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const platform = platformSelect.value;
        const service = serviceSelect.value;
        const link = document.getElementById('link').value;
        const quantity = quantityInput.value;

        if (!platform || !service || !link || !quantity) return;

        // Fill modal details
        modalDetails.innerHTML = `
            <div><strong>Platform:</strong> ${platformNames[platform] || platform}</div>
            <div><strong>Service:</strong> ${serviceNames[service] || service}</div>
            <div><strong>Quantity:</strong> ${parseInt(quantity).toLocaleString('en-US')}</div>
            <div><strong>Link:</strong> ${link.length > 40 ? link.substring(0, 40) + '...' : link}</div>
            <div><strong>Price:</strong> Free 🎉</div>
            <div><strong>Order ID:</strong> #${Math.floor(100000 + Math.random() * 900000)}</div>
        `;

        // Reset ad flag so it loads again on next order
        adLoaded = false;

        // Reset progress bar animation
        const progressBar = document.getElementById('progressBar');
        progressBar.style.animation = 'none';
        progressBar.offsetHeight; // trigger reflow
        progressBar.style.animation = 'progressFill 3s ease forwards';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        form.reset();
        quantityInput.value = 1000;
        quantityRange.value = 1000;
        linkPreview.classList.remove('active');
        linkPreviewContent.innerHTML = '';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalBtn.click();
        }
    });

    // ============================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = header.offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });
});
