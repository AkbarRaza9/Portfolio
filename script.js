/* ==================== DOM CONTENT LOADED ==================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ==================== DARK MODE TOGGLE ==================== */
  const themeToggle = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

  // Apply saved or system theme on load
  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ==================== SMOOTH SCROLLING ==================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Close mobile menu if open
      const navLinks = document.querySelector('.nav-links');
      const navToggle = document.querySelector('.nav-toggle');
      if (navLinks?.classList.contains('active')) {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ==================== MOBILE MENU TOGGLE ==================== */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  navToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav') && navLinks?.classList.contains('active')) {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks?.classList.contains('active')) {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  /* ==================== INTERSECTION OBSERVER — FADE-IN ==================== */
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => fadeObserver.observe(el));

  /* Animate skill bars when skills section is visible */
  const skillsSection = document.querySelector('#skills');
  const skillFills = document.querySelectorAll('.skill-fill');

  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        skillFills.forEach(fill => {
          const width = fill.getAttribute('data-width');
          fill.style.width = width + '%';
        });
        skillsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  /* ==================== CONTACT FORM ==================== */
  const contactForm = document.getElementById('contact-form');
  const honeypot = contactForm?.querySelector('input[name="website"]');

  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();

    // Honeypot check — reject if filled
    if (honeypot && honeypot.value.trim() !== '') {
      return;
    }

    let isValid = true;

    // Clear previous errors
    contactForm.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.getElementById('form-success').classList.remove('show');

    // Validate Name
    const name = document.getElementById('name');
    if (name.value.trim() === '') {
      showError(name, 'name-error', 'Please enter your name.');
      isValid = false;
    }

    // Validate Email
    const email = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === '') {
      showError(email, 'email-error', 'Please enter your email.');
      isValid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      showError(email, 'email-error', 'Please enter a valid email address.');
      isValid = false;
    }

    // Validate Subject
    const subject = document.getElementById('subject');
    if (subject.value.trim() === '') {
      showError(subject, 'subject-error', 'Please enter a subject.');
      isValid = false;
    }

    // Validate Message
    const message = document.getElementById('message');
    if (message.value.trim() === '') {
      showError(message, 'message-error', 'Please enter your message.');
      isValid = false;
    }

    // If valid, submit via fetch to Formspree
    if (isValid) {
      const formData = new FormData(contactForm);
      const formAction = contactForm.getAttribute('action');

      fetch(formAction, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
        .then(response => {
          if (response.ok) {
            document.getElementById('form-success').classList.add('show');
            contactForm.reset();
          } else {
            alert('Something went wrong. Please try again later.');
          }
        })
        .catch(() => {
          alert('Network error. Please check your connection and try again.');
        });
    }
  });

  /* Real-time validation on blur */
  const fields = contactForm?.querySelectorAll('input[required], textarea[required]');
  fields?.forEach(field => {
    field.addEventListener('blur', () => {
      const errorEl = document.getElementById(field.getAttribute('aria-describedby'));
      if (field.value.trim() === '') {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = 'This field is required.';
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      }
    });
  });

  function showError(input, errorId, message) {
    input.classList.add('error');
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = message;
  }
});
