/* ==========================================================
   script.js – Premium Creative Studio Interaction & Logic
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 1. SCROLL ANIMAÇÕES (Intersection Observer) */
  const animatedElements = document.querySelectorAll('.fade-in-up');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => {
    scrollObserver.observe(el);
  });


  /* 2. BARRA DE NAVEGAÇÃO FLUTUANTE (Fixed Bottom Nav) */
  const fixedNav = document.getElementById('fixedNav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      fixedNav.classList.add('scrolled');
    } else {
      fixedNav.classList.remove('scrolled');
    }
  });


  /* 3. MODAL DE CONTATO (Dialog Element & Google Forms) */
  const contactModal = document.getElementById('contactModal');
  const openModalBtns = document.querySelectorAll('.btn-contact');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Open Dialog
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      contactModal.showModal();
    });
  });

  // Close Dialog via Button
  closeModalBtn.addEventListener('click', () => {
    contactModal.close();
  });

  // Close Dialog clicking Backdrop
  contactModal.addEventListener('click', (e) => {
    const dialogDimensions = contactModal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      contactModal.close();
    }
  });


  /* 4. TESTIMONIAL CAROUSEL LOGIC */
  const carouselContainer = document.getElementById('carouselContainer');
  const prevBtn = document.getElementById('carouselPrevBtn');
  const nextBtn = document.getElementById('carouselNextBtn');

  if (carouselContainer && prevBtn && nextBtn) {
    const scrollAmount = 400; // Average card width + gap
    
    prevBtn.addEventListener('click', () => {
      carouselContainer.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    });

    nextBtn.addEventListener('click', () => {
      carouselContainer.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    });
  }


  /* 5. PARALLAX EFFECT FOR QUOTE SECTION IMAGE */
  const parallaxImage = document.getElementById('parallaxImage');
  if (parallaxImage) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = parallaxImage.parentElement.getBoundingClientRect();
          const viewHeight = window.innerHeight;
          
          // Calculate visibility scroll ratio
          if (rect.top < viewHeight && rect.bottom > 0) {
            // Speed factor: adjust multiplier to change visual intensity
            const relativeScroll = (rect.top - viewHeight) * 0.12;
            parallaxImage.style.setProperty('--offset', `${relativeScroll}px`);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }


  /* 6. MOUSE TRAIL LOGIC (Partner Section) */
  const partnerSection = document.getElementById('partner');
  // Array of local assets to act as trail images dynamically
  const trailImages = [
    'img/bloco.jpg',
    'img/botton.png',
    'img/brinde1.png',
    'img/logo-kepudim.png',
    'img/logo-imobtech.png',
    'img/logo-pezinhos.png',
    'img/cyber-logistica-1.png',
    'img/cyber-logistica-2.png'
  ];

  let lastTrailTime = 0;
  const trailCooldown = 75; // ms between image placements to avoid spamming the DOM

  if (partnerSection) {
    partnerSection.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastTrailTime < trailCooldown) return;
      lastTrailTime = now;

      // Get container boundaries
      const rect = partnerSection.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Create trail image element
      const trailImg = document.createElement('img');
      const randomImgSrc = trailImages[Math.floor(Math.random() * trailImages.length)];
      
      trailImg.src = randomImgSrc;
      trailImg.className = 'mouse-trail-image';
      trailImg.style.left = `${relativeX}px`;
      trailImg.style.top = `${relativeY}px`;
      
      // Random rotation for organic feeling
      const randomRotation = (Math.random() - 0.5) * 40; // -20deg to 20deg
      trailImg.style.transform = `translate(-50%, -50%) rotate(${randomRotation}deg)`;

      partnerSection.appendChild(trailImg);

      // Clean up after fadeout finishes
      setTimeout(() => {
        trailImg.remove();
      }, 1000);
    });
  }


  /* 7. MYSTERY CARD INTERACTIVE LOGIC (Brindes) */
  const mysteryCard = document.getElementById('mysteryCard');
  let hasMysteryFlipped = false;

  const surpriseGifts = [
    'Você ganhou o Super Kit Logística: Bloco + Botton + Brinde 3D! 🎁',
    'Você ganhou um Chaveiro 3D Personalizado exclusivo! 🔑',
    'Você ganhou um Bloco de Notas Premium Vasco Coutinho! 🗒️',
    'Você ganhou 2 Bottons Especiais da Feira! 📍'
  ];

  if (mysteryCard) {
    mysteryCard.addEventListener('click', () => {
      if (hasMysteryFlipped) return; // Allow only one click trigger
      
      hasMysteryFlipped = true;
      mysteryCard.classList.add('flipped');

      const backTitle = mysteryCard.querySelector('.brindes-card__reveal-title');
      const backDesc = mysteryCard.querySelector('.brindes-card__reveal-desc');

      // Randomize gift selection
      const randomGift = surpriseGifts[Math.floor(Math.random() * surpriseGifts.length)];

      // Add a slight delay to change text when the card flips at 90deg
      setTimeout(() => {
        backTitle.textContent = "Parabéns!";
        backDesc.textContent = randomGift;
      }, 250);
    });
  }

});
