/**
 * script.js – Curso Técnico em Logística | CEET Vasco Coutinho
 * Landing Page da Feira de Cursos 2026
 *
 * Funcionalidades:
 *  1. Header scroll (efeito ao rolar)
 *  2. Menu hamburguer (mobile)
 *  3. Scroll suave e destaque do link ativo
 *  4. Animações de entrada (Intersection Observer)
 *  5. Carrosséis de imagens nos produtos (inclui suporte a toque)
 *  6. Carrinho de brindes (localStorage)
 *  7. Modal de finalização
 *  8. Botão voltar ao topo
 *  9. Formulário de interesse (demonstrativo)
 */

'use strict';

/* ══════════════════════════════════════
   1. UTILITÁRIOS
══════════════════════════════════════ */

/** Seleciona um elemento no DOM */
const $ = (selector, context = document) => context.querySelector(selector);

/** Seleciona múltiplos elementos no DOM */
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/* ══════════════════════════════════════
   2. HEADER: EFEITO DE SCROLL
══════════════════════════════════════ */

(function initHeaderScroll() {
  const header = $('#header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Verificar estado inicial
})();

/* ══════════════════════════════════════
   3. MENU HAMBURGUER (MOBILE)
══════════════════════════════════════ */

(function initHamburger() {
  const btn  = $('#hamburgerBtn');
  const nav  = $('#navMenu');
  if (!btn || !nav) return;

  function openMenu() {
    nav.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Fechar ao clicar em um link do menu
  $$('.nav__link', nav).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // Fechar ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

/* ══════════════════════════════════════
   4. DESTAQUE DO LINK ATIVO NO MENU
══════════════════════════════════════ */

(function initActiveNav() {
  const navLinks = $$('.nav__link');
  const sections = $$('section[id]');
  if (!navLinks.length || !sections.length) return;

  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY + headerH + 60;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

/* ══════════════════════════════════════
   5. ANIMAÇÕES DE ENTRADA (scroll reveal)
══════════════════════════════════════ */

(function initScrollReveal() {
  // Adicionar classe 'fade-in-up' a todos os elementos que devem animar
  const targets = [
    '.info-card',
    '.aprende-card',
    '.objetivo-item',
    '.projeto-card',
    '.produto-card',
    '.mercado-card',
    '.contato-card',
    '.section__header',
    '.mercado__cta',
  ];

  targets.forEach(selector => {
    $$(selector).forEach((el, i) => {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = `${(i % 6) * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
  );

  $$('.fade-in-up').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   6. BOTÃO VOLTAR AO TOPO
══════════════════════════════════════ */

(function initBackToTop() {
  const btn = $('#backToTopBtn');
  if (!btn) return;

  function onScroll() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   7. CARROSSÉIS DE IMAGENS DOS PRODUTOS
══════════════════════════════════════ */

/**
 * Estado dos carrosséis.
 * Cada entrada: { currentIndex, totalSlides, el, track }
 */
const carousels = {};

/**
 * Inicializa todos os carrosséis da página.
 */
(function initCarousels() {
  // Detectar todos os carrosséis pelo atributo id="carousel-*"
  const carouselEls = $$('.carousel[id]');

  carouselEls.forEach(carouselEl => {
    const id    = carouselEl.id.replace('carousel-', '');
    const track = $(`#carouselTrack-${id}`);
    const dots  = $$(`#carouselDots-${id} .carousel__dot`);
    const slides = $$('.carousel__slide', carouselEl);

    if (!track || slides.length === 0) return;

    // Registrar no estado
    carousels[id] = {
      id,
      currentIndex: 0,
      totalSlides:  slides.length,
      carouselEl,
      track,
      dots,
      slides,
    };

    // Botões prev/next deste carrossel
    $$(`[data-carousel="${id}"].carousel__btn--prev`, document).forEach(btn => {
      btn.addEventListener('click', () => carouselMove(id, -1));
    });
    $$(`[data-carousel="${id}"].carousel__btn--next`, document).forEach(btn => {
      btn.addEventListener('click', () => carouselMove(id, 1));
    });

    // Bolinhas indicadoras
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => carouselGoTo(id, index));
    });

    // Suporte a toque (swipe)
    initCarouselTouch(id, carouselEl);

    // Renderizar estado inicial
    carouselRender(id);
  });
})();

/**
 * Move o carrossel em uma direção.
 * @param {string} id - ID do carrossel
 * @param {number} dir - +1 para próximo, -1 para anterior
 */
function carouselMove(id, dir) {
  const c = carousels[id];
  if (!c) return;
  const newIndex = (c.currentIndex + dir + c.totalSlides) % c.totalSlides;
  carouselGoTo(id, newIndex);
}

/**
 * Vai direto para um slide específico.
 * @param {string} id - ID do carrossel
 * @param {number} index - Índice do slide
 */
function carouselGoTo(id, index) {
  const c = carousels[id];
  if (!c) return;
  c.currentIndex = index;
  carouselRender(id);
}

/**
 * Atualiza a renderização visual do carrossel.
 * @param {string} id - ID do carrossel
 */
function carouselRender(id) {
  const c = carousels[id];
  if (!c) return;

  // Mover o track
  c.track.style.transform = `translateX(-${c.currentIndex * 100}%)`;

  // Atualizar slides ativos (para possíveis estilos futuros)
  c.slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === c.currentIndex);
  });

  // Atualizar bolinhas
  c.dots.forEach((dot, i) => {
    const isActive = i === c.currentIndex;
    dot.classList.toggle('active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
}

/**
 * Adiciona suporte a gesto de swipe (toque) no carrossel.
 * @param {string} id
 * @param {HTMLElement} el
 */
function initCarouselTouch(id, el) {
  let startX = null;
  let isDragging = false;
  const threshold = 50; // px mínimos para considerar swipe

  el.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  el.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    // Prevenir scroll vertical acidental ao fazer swipe horizontal
    const dx = Math.abs(e.touches[0].clientX - startX);
    if (dx > 10) {
      // Só previne se for claramente horizontal
      // e.preventDefault(); // descomente se precisar (requer {passive: false})
    }
  }, { passive: true });

  el.addEventListener('touchend', (e) => {
    if (!isDragging || startX === null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) >= threshold) {
      // Swipe left = próximo; swipe right = anterior
      carouselMove(id, diff > 0 ? 1 : -1);
    }

    startX = null;
    isDragging = false;
  }, { passive: true });
}

/* ══════════════════════════════════════
   8. CARRINHO DE BRINDES
══════════════════════════════════════ */

/**
 * Estrutura do item do carrinho:
 * { name: string, qty: number }
 *
 * O carrinho é salvo no localStorage.
 */

const CART_STORAGE_KEY = 'logistica_ceet_cart';

/** Carrega o carrinho do localStorage */
function cartLoad() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Salva o carrinho no localStorage */
function cartSave(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Falha silenciosa em caso de localStorage indisponível
  }
}

/** Retorna o total de itens (somando quantidades) */
function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/** Atualiza os badges de contagem no header e na seção */
function cartUpdateBadges() {
  const cart  = cartLoad();
  const total = cartTotal(cart);
  const badge = $('#cartBadge');
  const badgeInline = $('#cartBadgeInline');
  if (badge) badge.textContent = total;
  if (badgeInline) badgeInline.textContent = total;
}

/**
 * Adiciona um produto ao carrinho.
 * Chamada pelo onclick nos botões dos cards de produto.
 * @param {HTMLButtonElement} btn
 */
function addToCart(btn) {
  const productName = btn.getAttribute('data-product');
  if (!productName) return;

  let cart = cartLoad();
  const existing = cart.find(item => item.name === productName);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: productName, qty: 1 });
  }

  cartSave(cart);
  cartUpdateBadges();
  cartRenderPanel();
  cartOpen();

  // Feedback visual no botão
  const originalText = btn.innerHTML;
  btn.innerHTML = '✅ Adicionado!';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 1500);
}

/** Remove um item do carrinho */
function cartRemoveItem(productName) {
  let cart = cartLoad();
  cart = cart.filter(item => item.name !== productName);
  cartSave(cart);
  cartUpdateBadges();
  cartRenderPanel();
}

/** Altera a quantidade de um item */
function cartChangeQty(productName, delta) {
  let cart = cartLoad();
  const item = cart.find(i => i.name === productName);
  if (!item) return;

  item.qty = Math.max(1, item.qty + delta);
  cartSave(cart);
  cartUpdateBadges();
  cartRenderPanel();
}

/** Renderiza a lista de itens no painel do carrinho */
function cartRenderPanel() {
  const list   = $('#cartList');
  const empty  = $('#cartEmpty');
  if (!list) return;

  const cart = cartLoad();

  // Limpar itens anteriores (exceto o item "vazio")
  $$('.cart-item', list).forEach(el => el.remove());

  if (cart.length === 0) {
    if (empty) empty.style.display = '';
    return;
  }

  if (empty) empty.style.display = 'none';

  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.setAttribute('role', 'listitem');
    // Sanitizar o nome para uso em atributos
    const safeName = item.name.replace(/"/g, '&quot;');
    li.innerHTML = `
      <div class="cart-item__info">
        <span class="cart-item__name">${item.name}</span>
        <div class="cart-item__qty-row">
          <button
            class="cart-item__qty-btn"
            onclick="cartChangeQty('${safeName}', -1)"
            aria-label="Diminuir quantidade de ${item.name}"
          >−</button>
          <span class="cart-item__qty" aria-label="Quantidade: ${item.qty}">${item.qty}</span>
          <button
            class="cart-item__qty-btn"
            onclick="cartChangeQty('${safeName}', 1)"
            aria-label="Aumentar quantidade de ${item.name}"
          >+</button>
        </div>
      </div>
      <button
        class="cart-item__remove"
        onclick="cartRemoveItem('${safeName}')"
        aria-label="Remover ${item.name} do carrinho"
        title="Remover"
      >🗑️</button>
    `;
    list.appendChild(li);
  });
}

/** Abre o painel do carrinho */
function cartOpen() {
  const panel   = $('#cartPanel');
  const overlay = $('#cartOverlay');
  if (!panel || !overlay) return;

  panel.classList.add('open');
  overlay.classList.add('visible');
  panel.setAttribute('aria-hidden', 'false');
  overlay.setAttribute('aria-hidden', 'false');

  // Foco no botão fechar para acessibilidade
  const closeBtn = $('#closeCartBtn');
  if (closeBtn) setTimeout(() => closeBtn.focus(), 100);
}

/** Fecha o painel do carrinho */
function cartClose() {
  const panel   = $('#cartPanel');
  const overlay = $('#cartOverlay');
  if (!panel || !overlay) return;

  panel.classList.remove('open');
  overlay.classList.remove('visible');
  panel.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('aria-hidden', 'true');
}

/** Inicializa eventos do carrinho */
(function initCart() {
  // Botões para abrir o carrinho
  const openBtns = ['#cartIconBtn', '#openCartBtn'];
  openBtns.forEach(selector => {
    const btn = $(selector);
    if (btn) btn.addEventListener('click', cartOpen);
  });

  // Botão fechar
  const closeBtn = $('#closeCartBtn');
  if (closeBtn) closeBtn.addEventListener('click', cartClose);

  // Fechar ao clicar no overlay
  const overlay = $('#cartOverlay');
  if (overlay) overlay.addEventListener('click', cartClose);

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cartClose();
      fecharModal();
    }
  });

  // Renderizar estado inicial (caso venha do localStorage)
  cartUpdateBadges();
  cartRenderPanel();
})();

/* ══════════════════════════════════════
   9. FINALIZAR ESCOLHA E MODAL
══════════════════════════════════════ */

/**
 * Abre o modal de confirmação com o resumo do carrinho.
 * Chamada pelo onclick no botão "Finalizar Escolha".
 */
function finalizarEscolha() {
  const cart = cartLoad();

  if (cart.length === 0) {
    alert('Seu carrinho está vazio! Adicione um brinde antes de finalizar.');
    return;
  }

  const modalList = $('#modalList');
  if (modalList) {
    modalList.innerHTML = '';
    cart.forEach(item => {
      const li = document.createElement('li');
      li.className = 'modal__list-item';
      li.textContent = `${item.name} (x${item.qty})`;
      modalList.appendChild(li);
    });
  }

  const overlay = $('#modalOverlay');
  if (overlay) {
    overlay.classList.add('visible');
    overlay.setAttribute('aria-hidden', 'false');
  }

  cartClose();
}

/** Fecha o modal de confirmação */
function fecharModal() {
  const overlay = $('#modalOverlay');
  if (overlay) {
    overlay.classList.remove('visible');
    overlay.setAttribute('aria-hidden', 'true');
  }
}

/** Fecha o modal ao clicar no overlay */
(function initModalClose() {
  const overlay = $('#modalOverlay');
  if (!overlay) return;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fecharModal();
  });
})();

/* ══════════════════════════════════════
   10. FUNÇÃO DE ENVIO POR WHATSAPP
        (descomentada quando necessário)
══════════════════════════════════════ */

/**
 * Envia um resumo dos brindes escolhidos via WhatsApp.
 *
 * INSTRUÇÕES PARA ATIVAR:
 *  1. Descomente o bloco abaixo.
 *  2. Substitua '5527900000000' pelo número de WhatsApp real,
 *     incluindo código do país (55) e DDD (27 para ES).
 *  3. Descomente o botão "Enviar por WhatsApp" no HTML (na seção modal).
 */
/*
function enviarWhatsApp() {
  const cart = cartLoad();
  if (cart.length === 0) return;

  const WHATSAPP_NUMBER = '5527900000000'; // ← EDITE AQUI

  const itens = cart
    .map(item => `• ${item.name} (x${item.qty})`)
    .join('\n');

  const mensagem =
    `Olá! Participei da Feira do Curso Técnico em Logística do CEET Vasco Coutinho.\n\n` +
    `Escolhi os seguintes brindes:\n${itens}\n\n` +
    `Obrigado! 📦🚛`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
*/

/* ══════════════════════════════════════
   11. FORMULÁRIO DE INTERESSE (DEMONSTRATIVO)
══════════════════════════════════════ */

(function initForm() {
  const form = $('#interestForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const name   = $('#formName');
    const phone  = $('#formPhone');
    const turno  = $('#formTurno');
    const submitBtn = $('#formSubmitBtn');

    // Validação básica
    if (!name || name.value.trim().length < 2) {
      e.preventDefault();
      name && name.focus();
      showFormError(name, 'Por favor, informe seu nome completo.');
      return;
    }

    if (!phone || phone.value.trim().length < 8) {
      e.preventDefault();
      phone && phone.focus();
      showFormError(phone, 'Por favor, informe seu WhatsApp ou telefone.');
      return;
    }

    if (!turno || !turno.value) {
      e.preventDefault();
      turno && turno.focus();
      showFormError(turno, 'Por favor, selecione seu turno de interesse.');
      return;
    }

    // Permite a submissão ao hidden_iframe, e altera o botão de envio temporariamente
    if (submitBtn) {
      submitBtn.innerHTML = '⏳ Enviando...';
      submitBtn.disabled = true;
    }

    // Resetar estado do botão após 4 segundos
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.innerHTML = '📩 Quero me inscrever!';
        submitBtn.disabled = false;
      }
    }, 4000);
  });

  /** Mostra uma mensagem de erro acessível */
  function showFormError(input, message) {
    if (!input) return;
    input.style.borderColor = '#ef4444';
    input.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.2)';

    // Remover erro ao digitar
    input.addEventListener('input', () => {
      input.style.borderColor = '';
      input.style.boxShadow   = '';
    }, { once: true });

    // Feedback sonoro/visual
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', 'formError');

    let errEl = $('#formError');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.id = 'formError';
      errEl.style.cssText = 'color:#ef4444;font-size:0.8rem;margin-top:4px;display:block;';
      errEl.setAttribute('role', 'alert');
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
  }
})();

/* ══════════════════════════════════════
   12. SCROLL SUAVE PARA LINKS ÂNCORA
        (fallback para navegadores antigos)
══════════════════════════════════════ */

(function initSmoothScroll() {
  // O CSS já usa scroll-behavior: smooth, mas adicionamos um fallback JS
  // para garantir que o header fixo seja considerado no offset
  const HEADER_OFFSET = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 72;

  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = $(href);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ══════════════════════════════════════
   INICIALIZAÇÃO FINAL
══════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  console.log(
    '%c📦 Curso Técnico em Logística – CEET Vasco Coutinho\n%cFeira de Cursos 2026',
    'color: #f59e0b; font-size: 1rem; font-weight: bold;',
    'color: #94a3b8; font-size: 0.8rem;'
  );
});
