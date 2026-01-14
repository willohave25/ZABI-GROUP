/**
 * ZABI GROUP SARL - JavaScript Principal
 * Navigation mobile, dropdown services, carrousel témoignages
 * Développé par W2K-Digital
 */

(function() {
    'use strict';

    /* ========================================
       Variables DOM
       ======================================== */
    const header = document.getElementById('header');
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const dropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');

    /* ========================================
       Header Scroll Effect
       ======================================== */
    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });

    /* ========================================
       Mobile Navigation
       ======================================== */
    function openMobileNav() {
        mobileNav.classList.add('active');
        mobileOverlay.classList.add('active');
        hamburger.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        mobileNav.classList.remove('active');
        mobileOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            if (mobileNav.classList.contains('active')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileNav);
    }

    // Fermer avec Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMobileNav();
        }
    });

    /* ========================================
       Mobile Dropdown Accordion
       ======================================== */
    dropdownToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const dropdownMenu = this.nextElementSibling;
            
            // Fermer autres dropdowns
            dropdownToggles.forEach(function(otherToggle) {
                if (otherToggle !== toggle) {
                    otherToggle.setAttribute('aria-expanded', 'false');
                    otherToggle.nextElementSibling.classList.remove('active');
                }
            });
            
            // Toggle current dropdown
            this.setAttribute('aria-expanded', !isExpanded);
            dropdownMenu.classList.toggle('active');
        });
    });

    /* ========================================
       Smooth Scroll pour liens ancres
       ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Fermer mobile nav si ouvert
                if (mobileNav.classList.contains('active')) {
                    closeMobileNav();
                }
                
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ========================================
       Testimonials Carousel
       ======================================== */
    class TestimonialsSlider {
        constructor() {
            this.carousel = document.getElementById('testimonialsCarousel');
            if (!this.carousel) return;
            
            this.track = document.getElementById('testimonialsTrack');
            this.cards = this.track.querySelectorAll('.testimonial-card');
            this.prevBtn = document.getElementById('carouselPrev');
            this.nextBtn = document.getElementById('carouselNext');
            this.dotsContainer = document.getElementById('carouselDots');
            this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
            
            this.currentIndex = 0;
            this.totalSlides = this.cards.length;
            this.visibleCount = this.getVisibleCount();
            this.autoPlayInterval = null;
            this.autoPlayDelay = 5000;
            this.isPaused = false;
            
            this.init();
        }
        
        init() {
            this.setupEventListeners();
            this.updateSlide();
            this.autoPlay();
        }
        
        getVisibleCount() {
            const width = window.innerWidth;
            if (width >= 1025) return 3;
            if (width >= 769) return 2;
            return 1;
        }
        
        setupEventListeners() {
            // Boutons navigation
            this.prevBtn.addEventListener('click', () => this.prev());
            this.nextBtn.addEventListener('click', () => this.next());
            
            // Dots navigation
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
            
            // Pause on hover
            this.carousel.addEventListener('mouseenter', () => this.pause());
            this.carousel.addEventListener('mouseleave', () => this.resume());
            
            // Responsive
            window.addEventListener('resize', () => {
                const newVisibleCount = this.getVisibleCount();
                if (newVisibleCount !== this.visibleCount) {
                    this.visibleCount = newVisibleCount;
                    this.updateSlide();
                }
            });
            
            // Touch support
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.track.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            this.track.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
        
        handleSwipe(startX, endX) {
            const swipeThreshold = 50;
            const diff = startX - endX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        }
        
        next() {
            this.currentIndex++;
            if (this.currentIndex >= this.totalSlides) {
                this.currentIndex = 0;
            }
            this.updateSlide();
            this.resetTimer();
        }
        
        prev() {
            this.currentIndex--;
            if (this.currentIndex < 0) {
                this.currentIndex = this.totalSlides - 1;
            }
            this.updateSlide();
            this.resetTimer();
        }
        
        goToSlide(index) {
            this.currentIndex = index;
            this.updateSlide();
            this.resetTimer();
        }
        
        updateSlide() {
            // Calculer le pourcentage de translation
            const cardWidth = 100 / this.visibleCount;
            const gap = 24; // var(--space-md) en pixels
            const translateX = this.currentIndex * (cardWidth + (gap / this.track.offsetWidth * 100));
            
            this.track.style.transform = `translateX(-${translateX}%)`;
            this.updateDots();
        }
        
        updateDots() {
            this.dots.forEach((dot, index) => {
                if (index === this.currentIndex) {
                    dot.classList.add('active');
                    dot.setAttribute('aria-selected', 'true');
                } else {
                    dot.classList.remove('active');
                    dot.setAttribute('aria-selected', 'false');
                }
            });
        }
        
        autoPlay() {
            this.autoPlayInterval = setInterval(() => {
                if (!this.isPaused) {
                    this.next();
                }
            }, this.autoPlayDelay);
        }
        
        pause() {
            this.isPaused = true;
        }
        
        resume() {
            setTimeout(() => {
                this.isPaused = false;
            }, 1000);
        }
        
        resetTimer() {
            clearInterval(this.autoPlayInterval);
            this.autoPlay();
        }
    }

    /* ========================================
       Initialisation
       ======================================== */
    document.addEventListener('DOMContentLoaded', function() {
        // Initialiser le carrousel témoignages
        new TestimonialsSlider();
        
        // Vérifier scroll initial pour header
        handleHeaderScroll();
    });

})();
