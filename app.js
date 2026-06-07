// ----------------------------------------------------
// 1. CONFIGURACIÓN DEL BACKEND, BASE DE DATOS Y ESTADO
// ----------------------------------------------------

const API_BASE_URL = (window.location.protocol === "file:" || window.location.port) 
  ? "http://localhost:8000" 
  : "";

// Helper mapping functions to adapt SQL model names (snake_case) to Frontend names (camelCase)
function mapPetFromAPI(p) {
  if (!p) return null;
  return {
    ...p,
    subscriptionPaid: p.subscription_paid,
    selectedRecipeId: p.selected_recipe_id,
    excludedIngredients: p.excluded_ingredients || [],
    addedSuperfoods: p.added_superfoods || [],
    customInstructions: p.custom_instructions || ""
  };
}

function mapOrderFromAPI(o) {
  if (!o) return null;
  return {
    ...o,
    orderId: o.order_id,
    petName: o.pet_name,
    petBreed: o.pet_breed,
    petPhoto: o.pet_photo,
    recipeName: o.recipe_name,
    dailyGrams: o.daily_grams,
    monthlyKg: o.monthly_kg,
    totalPrice: o.total_price,
    paidStatus: o.paid_status
  };
}

function mapRecipeFromAPI(r) {
  if (!r) return null;
  return {
    ...r,
    ingredientsArray: r.ingredients_array || []
  };
}

// Fallback values for development if API is offline
const DEFAULT_RECIPES = [
  { 
    id: 'b-pollo', 
    name: 'BARF Pollo Premium', 
    category: 'barf', 
    price: 4200, 
    icon: '🍗', 
    ingredients: 'Hueso de pollo triturado, carne magra de pollo, hígado de pollo, vísceras trituradas, espinaca fresca, zanahoria picada.',
    ingredientsArray: ['Hueso de pollo triturado', 'Carne magra de pollo', 'Hígado de pollo', 'Vísceras trituradas', 'Espinaca fresca', 'Zanahoria picada']
  },
  { 
    id: 'b-vacuno', 
    name: 'BARF Vacuno Tradicional', 
    category: 'barf', 
    price: 4200, 
    icon: '🥩', 
    ingredients: 'Carne magra de res, hueso blando de vacuno molido, hígado de res, bofe, riñón de res, manzana verde, zanahoria.',
    ingredientsArray: ['Carne magra de res', 'Hueso de vacuno molido', 'Hígado de res', 'Vísceras (bofe/riñón)', 'Manzana verde', 'Zanimoria']
  },
  { 
    id: 'b-salmon', 
    name: 'BARF Pavo & Salmón', 
    category: 'barf', 
    price: 4200, 
    icon: '🐟', 
    ingredients: 'Carne magra de pavo, filete de salmón, hueso de pavo triturado, hígado de pavo, acelga fresca, arándanos silvestres.',
    ingredientsArray: ['Carne magra de pavo', 'Filete de salmón', 'Hueso de pavo triturado', 'Hígado de pavo', 'Acelga fresca', 'Arándanos silvestres']
  },
  { 
    id: 'c-pollo', 
    name: 'Pollo Cocido al Vapor', 
    category: 'cooked', 
    price: 5200, 
    icon: '🍲', 
    ingredients: 'Pechuga de pollo cocida, trutro deshuesado, zapallo camote, zanahoria cocida, arroz integral cocido, aceite de oliva.',
    ingredientsArray: ['Pechuga de pollo cocida', 'Trutro de pollo cocido', 'Zapallo camote al vapor', 'Zanahoria cocida', 'Arroz integral cocido', 'Aceite de oliva']
  },
  { 
    id: 'c-vacuno', 
    name: 'Vacuno & Camote Cocido', 
    category: 'cooked', 
    price: 5200, 
    icon: '🥘', 
    ingredients: 'Posta de vacuno picada, camote cocido al vapor, espinaca al vapor, arvejas tiernas, hígado de res cocido.',
    ingredientsArray: ['Posta de vacuno picada', 'Camote al vapor', 'Espinaca al vapor', 'Arvejas tiernas', 'Hígado de res cocido']
  },
  { 
    id: 'c-cerdo', 
    name: 'Cerdo & Manzana Cocido', 
    category: 'cooked', 
    price: 5200, 
    icon: '🍎', 
    ingredients: 'Pulpa de cerdo cocida, manzana roja cocida, zanahoria, avena integral machacada, carbonato de calcio.',
    ingredientsArray: ['Pulpa de cerdo cocida', 'Manzana roja cocida', 'Zanahoria al vapor', 'Avena integral cocida', 'Carbonato de calcio']
  }
];

const DEFAULT_SNACKS = [
  { id: 's-patas', name: 'Patas de Pollo Deshidratadas', category: 'snack', price: 4500, icon: '🐾', ingredients: 'Pack de 5 unidades. Calcio y colágeno natural que actúa como cepillo de dientes.', unit: '5 uds' },
  { id: 's-caldo', name: 'Caldo de Huesos Concentrado', category: 'snack', price: 3800, icon: '🍵', ingredients: 'Botella de 500ml. Caldo cocinado por 24 hrs. Reparador intestinal y de articulaciones.', unit: '500ml' },
  { id: 's-colageno', name: 'Calugas de Colágeno y Coco', category: 'snack', price: 5000, icon: '🥥', ingredients: 'Pote de 20 calugas masticables frías a base de caldo de patas y aceite de coco.', unit: '20 uds' }
];

const DEFAULT_PARAMS = {
  barf_price_per_kg: 4200,
  cooked_price_per_kg: 5200,
  barf_adult_sedentary: 2.0,
  barf_adult_normal: 2.5,
  barf_adult_active: 3.0,
  barf_adult_working: 3.5,
  cooked_adult_sedentary: 3.0,
  cooked_adult_normal: 3.5,
  cooked_adult_active: 4.0,
  cooked_adult_working: 4.5,
  puppy_early: 8.0,
  puppy_mid: 6.0,
  puppy_late: 4.0
};

const SUPERALIMENTOS = [
  { id: 'sup-chia', name: 'Semillas de Chía', icon: '🌱', price: 1500 },
  { id: 'sup-coco', name: 'Aceite de Coco', icon: '🥥', price: 1500 },
  { id: 'sup-levadura', name: 'Levadura Nutricional', icon: '🌾', price: 1500 },
  { id: 'sup-curcuma', name: 'Cúrcuma & Pimienta', icon: '🟡', price: 1500 }
];

// Testimonios Iniciales
const DEFAULT_TESTIMONIALS = [
  { 
    id: 't-1', 
    author: 'Camila Rojas', 
    location: 'Providencia', 
    dog_name: 'Mateo', 
    photo_url: 'assets/logo.jpg', 
    quote: 'El cambio en Mateo fue increíble. Tenía alergias terribles en la piel y se rascaba todo el día. Desde el primer mes con BARF de Origen Canino, su piel está sana, el pelo brilla y sus digestiones son perfectas. ¡Una maravilla!' 
  },
  { 
    id: 't-2', 
    author: 'Andrés Valenzuela', 
    location: 'Las Condes', 
    dog_name: 'Rocky', 
    photo_url: 'assets/logo.jpg', 
    quote: 'Estaba escéptico sobre la comida cruda, pero ver a Rocky comer con tanta felicidad me convenció. La porción viene exacta en bolsas al vacío, lo que facilita todo. Sus dientes están impecables y tiene una energía increíble.' 
  },
  { 
    id: 't-3', 
    author: 'María José Castro', 
    location: 'Viña del Mar', 
    dog_name: 'Luna', 
    photo_url: 'assets/logo.jpg', 
    quote: 'Luna sufría de problemas estomacales constantes con el alimento seco. Cambiamos a las recetas cocinadas de Origen Canino y el cambio fue instantáneo. La comida huele delicioso y le encanta. El servicio de entrega mensual es puntual.' 
  }
];

// 7 Preguntas Frecuentes Iniciales
const DEFAULT_FAQS = [
  { 
    id: 'f-1', 
    question: '¿Qué es la dieta BARF y cuáles son sus beneficios?', 
    answer: 'La dieta BARF (Alimento Crudo Biológicamente Apropiado) consiste en alimentar a los perros con carne magra, huesos carnosos triturados, vísceras y vegetales crudos. Sus beneficios incluyen dientes limpios sin sarro, mejor aliento, digestiones más compactas y menos olorosas, pelaje brillante, mayor vitalidad y reducción drástica de alergias cutáneas.' 
  },
  { 
    id: 'f-2', 
    question: '¿Es seguro dar huesos a mi perro?', 
    answer: 'Sí, siempre y cuando sean huesos carnosos crudos triturados o enteros (nunca cocidos, ya que la cocción los deshidrata y hace que se astillen). En Origen Canino trituramos finamente todos los huesos en nuestras fórmulas BARF para garantizar una seguridad del 100%, eliminando cualquier riesgo de atragantamiento o perforación.' 
  },
  { 
    id: 'f-3', 
    question: '¿Cuál es la diferencia entre la dieta BARF y la comida cocinada al vapor?', 
    answer: 'La dieta BARF utiliza ingredientes 100% crudos para preservar todas las enzimas y bacterias benéficas intactas. La comida cocinada al vapor se cocina a baja temperatura para eliminar patógenos y facilitar la digestión, siendo ideal para perros senior, con estómagos sensibles o cuando los tutores prefieren no manipular carne cruda.' 
  },
  { 
    id: 'f-4', 
    question: '¿Cómo se realiza la transición de alimento seco (croquetas) a alimento natural?', 
    answer: 'Recomendamos una transición gradual de 7 días. Los días 1 y 2, ofrece 75% de su alimento anterior y 25% del nuevo alimento natural (en platos separados, nunca mezclados en la misma porción). Los días 3 y 4, ofrece 50% y 50%. Los días 5 y 6, ofrece 75% de alimento natural y 25% anterior. El día 7, ya estará comiendo 100% Origen Canino.' 
  },
  { 
    id: 'f-5', 
    question: '¿Cómo se entregan y conservan las porciones mensuales?', 
    answer: 'Entregamos el alimento en porciones diarias exactas envasadas al vacío y congeladas. Debes guardarlas en el congelador. Cada noche, saca la porción del día siguiente y déjala descongelar en el refrigerador. Al momento de servir, puedes entibiarla un poco (nunca usar microondas para la dieta BARF para no cocer los huesos triturados).' 
  },
  { 
    id: 'f-6', 
    question: '¿Puedo personalizar la comida si mi mascota tiene alergias o condiciones médicas?', 
    answer: '¡Absolutamente! Utilizando nuestra App Móvil puedes crear el perfil de tu mascota e indicar qué ingredientes base deseas excluir (se tacharán de su receta) y qué superalimentos opcionales agregar (como chía o aceite de coco). Si tiene alguna condición médica compleja, puedes indicarlo en las observaciones y nuestro equipo formulará bajo supervisión veterinaria.' 
  },
  { 
    id: 'f-7', 
    question: '¿Cómo funciona la suscripción mensual y la forma de entrega?', 
    answer: 'Al activar tu suscripción en la App Móvil con pago seguro, nuestro sistema programa la producción personalizada de tu mascota. Despachamos tus 30 porciones mensuales congeladas directamente a tu domicilio cada 30 días, asegurando que nunca te quedes sin comida. Puedes modificar, pausar o cancelar tu suscripción en cualquier momento.' 
  }
];

function safeLoadFromStorage(key, defaultValue) {
  try {
    const val = localStorage.getItem(key);
    if (!val) return defaultValue;
    const parsed = JSON.parse(val);
    if (parsed && Array.isArray(parsed) && parsed.length === 0 && defaultValue !== parsed) {
      return defaultValue;
    }
    return parsed || defaultValue;
  } catch (e) {
    console.error(`Error de parseo en la clave "${key}", reestableciendo valores por defecto:`, e);
    return defaultValue;
  }
}

// Cargar estado inicial
let appState = {
  recipes: [],
  snacks: [],
  params: DEFAULT_PARAMS,
  orders: [],
  pets: [],
  testimonials: [],
  faqs: [],
  
  currentPetId: null,
  activePetIdDashboard: null,
  snacksCart: safeLoadFromStorage('oc_snacks_cart', {}),
  activeView: 'web',
  mobileView: 'welcome',
  adminTab: 'parameters',
  adminToken: localStorage.getItem('oc_admin_token') || null
};

// Guardar bases en localStorage (Solo datos locales de sesión del cliente)
function saveStateToStorage() {
  const petIds = appState.pets.map(p => p.id);
  localStorage.setItem('oc_my_pet_ids', JSON.stringify(petIds));
  localStorage.setItem('oc_snacks_cart', JSON.stringify(appState.snacksCart));
}

// Carga asíncrona de datos desde la API central
async function loadInitialDataFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config`);
    if (!res.ok) throw new Error("No se pudo cargar la configuración del servidor");
    const data = await res.json();
    
    appState.recipes = data.recipes.map(mapRecipeFromAPI);
    appState.snacks = data.snacks;
    appState.params = data.params;
    appState.testimonials = data.testimonials;
    appState.faqs = data.faqs;
    
    // Cargar las mascotas pertenecientes a este navegador (usando la lista de IDs locales)
    const myPetIds = safeLoadFromStorage('oc_my_pet_ids', []);
    let loadedPets = [];
    for (const petId of myPetIds) {
      try {
        const petRes = await fetch(`${API_BASE_URL}/api/pets/${petId}`);
        if (petRes.ok) {
          let pet = await petRes.json();
          loadedPets.push(mapPetFromAPI(pet));
        }
      } catch (err) {
        console.warn(`Error al cargar mascota ${petId}:`, err);
      }
    }
    appState.pets = loadedPets;
    
    // Renderizado reactivo en la UI
    renderWebProducts();
    renderWebTestimonials();
    renderWebFaqs();
    renderMobileWelcomeScreen();
  } catch (err) {
    console.warn("Fallo en la llamada API (servidor desconectado), cargando datos locales/fallback:", err);
    appState.recipes = DEFAULT_RECIPES;
    appState.snacks = DEFAULT_SNACKS;
    appState.params = DEFAULT_PARAMS;
    appState.testimonials = DEFAULT_TESTIMONIALS;
    appState.faqs = DEFAULT_FAQS;
    
    renderWebProducts();
    renderWebTestimonials();
    renderWebFaqs();
    renderMobileWelcomeScreen();
  }
}

// ----------------------------------------------------
// 2. CONFIGURACIÓN DEL SISTEMA HORARIO Y NAVEGACIÓN
// ----------------------------------------------------

function updateSimulatedTime() {
  const timeEl = document.getElementById('simulated-time');
  if (timeEl) {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    timeEl.textContent = `${hours}:${minutes}`;
  }
}
setInterval(updateSimulatedTime, 1000);
updateSimulatedTime();

window.switchView = function(viewName) {
  appState.activeView = viewName;
  
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  
  if (viewName === 'web') {
    document.querySelector('.tab-btn[onclick="switchView(\'web\')"]').classList.add('active');
    document.getElementById('view-web').classList.add('active');
    renderWebProducts();
    renderWebTestimonials();
    renderWebFaqs();
  } else if (viewName === 'mobile') {
    document.querySelector('.tab-btn[onclick="switchView(\'mobile\')"]').classList.add('active');
    document.getElementById('view-mobile').classList.add('active');
    renderMobileWelcomeScreen();
  } else if (viewName === 'admin') {
    document.querySelector('.tab-btn[onclick="switchView(\'admin\')"]').classList.add('active');
    document.getElementById('view-admin').classList.add('active');
    
    if (appState.adminToken) {
      document.getElementById('admin-login-box').style.display = 'none';
      document.getElementById('admin-dashboard-wrapper').style.display = 'flex';
      initAdminPanel();
    } else {
      document.getElementById('admin-login-box').style.display = 'flex';
      document.getElementById('admin-dashboard-wrapper').style.display = 'none';
    }
  }
};

window.changeMobileView = function(viewName) {
  appState.mobileView = viewName;
  
  document.querySelectorAll('.mobile-view').forEach(view => view.classList.remove('active'));
  
  const targetView = document.getElementById(`mobile-${viewName}`);
  if (targetView) {
    targetView.classList.add('active');
    
    if (viewName === 'welcome') {
      renderMobileWelcomeScreen();
    } else if (viewName === 'calculator') {
      renderMobileRecipeSelector();
      updatePortionCalculatorUI();
    } else if (viewName === 'snacks') {
      renderMobileSnacksList();
    } else if (viewName === 'checkout') {
      setupCheckoutUI();
    } else if (viewName === 'receipt') {
      setupReceiptUI();
    } else if (viewName === 'pet-dashboard') {
      renderPetDashboard();
    }
  }

  const navItems = document.querySelectorAll('#mobile-app-nav .nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  if (viewName === 'welcome' || viewName === 'profile-setup') {
    navItems[0].classList.add('active');
  } else if (viewName === 'calculator') {
    navItems[1].classList.add('active');
  } else if (viewName === 'snacks') {
    navItems[2].classList.add('active');
  } else if (viewName === 'pet-dashboard' || viewName === 'checkout' || viewName === 'receipt') {
    navItems[3].classList.add('active');
  }
};

window.navigateMobileNav = function(destination) {
  if (destination === 'profile') {
    if (appState.pets.length === 0) {
      initNewPetWizard();
    } else {
      appState.currentPetId = appState.pets[appState.pets.length - 1].id;
      changeMobileView('calculator');
    }
  } else if (destination === 'snacks') {
    if (appState.pets.length === 0) {
      alert('Por favor, agrega una mascota primero.');
      initNewPetWizard();
    } else {
      changeMobileView('snacks');
    }
  } else if (destination === 'dashboard') {
    const paidPets = appState.pets.filter(p => p.subscriptionPaid);
    if (paidPets.length > 0) {
      if (!appState.activePetIdDashboard) {
        appState.activePetIdDashboard = paidPets[0].id;
      }
      changeMobileView('pet-dashboard');
    } else if (appState.pets.length > 0) {
      changeMobileView('checkout');
    } else {
      initNewPetWizard();
    }
  }
};

// ----------------------------------------------------
// 3. FÓRMULAS DE CÁLCULO DE PORCIONES
// ----------------------------------------------------

function calculatePortion(weight, stage, activity, dietType) {
  let percentage = 2.5;

  if (stage === 'adult') {
    const key = `${dietType}_adult_${activity}`;
    percentage = appState.params[key] || 2.5;
  } else {
    if (stage === 'puppy') {
      percentage = appState.params.puppy_early;
    } else if (stage === 'puppy-mid') {
      percentage = appState.params.puppy_mid;
    } else if (stage === 'puppy-late') {
      percentage = appState.params.puppy_late;
    }
  }

  const dailyGrams = Math.round(weight * (percentage / 100) * 1000);
  const monthlyKg = parseFloat(((dailyGrams * 30) / 1000).toFixed(1));
  
  return {
    dailyGrams,
    monthlyKg,
    percentageUsed: percentage
  };
}

// ----------------------------------------------------
// 4. SITIO WEB DESKTOP: RENDER Y LOGICA
// ----------------------------------------------------

let activeWebFilter = 'todos';
function renderWebProducts() {
  const container = document.getElementById('web-products-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const allProducts = [
    ...appState.recipes.map(r => ({ ...r, priceLabel: `$${r.price.toLocaleString('es-CL')}/kg`, isRecipe: true })),
    ...appState.snacks.map(s => ({ ...s, priceLabel: `$${s.price.toLocaleString('es-CL')} por ${s.unit}`, isRecipe: false }))
  ];

  const filtered = allProducts.filter(p => {
    if (activeWebFilter === 'todos') return true;
    if (activeWebFilter === 'barf') return p.category === 'barf';
    if (activeWebFilter === 'cooked') return p.category === 'cooked';
    if (activeWebFilter === 'snack') return p.category === 'snack';
    return true;
  });

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    let tagText = 'Dieta BARF';
    let tagClass = 'tag-barf';
    if (p.category === 'cooked') {
      tagText = 'Cocinada';
      tagClass = 'tag-cooked';
    } else if (p.category === 'snack') {
      tagText = 'Snack / Supl';
      tagClass = 'tag-snack';
    }

    card.innerHTML = `
      <div class="product-img-wrapper">
        <span class="product-tag ${tagClass}">${tagText}</span>
        ${p.icon}
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="product-ingredients">${p.ingredients}</p>
        <div class="product-footer">
          <span class="product-price">${p.priceLabel}</span>
          <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="switchView('mobile'); changeMobileView('welcome')">
            Comprar en App
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

window.filterCatalog = function(category, btn) {
  activeWebFilter = category;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderWebProducts();
};

window.calculateWebPortion = function() {
  const diet = document.getElementById('web-calc-diet').value;
  const weight = parseFloat(document.getElementById('web-calc-weight').value);
  const age = document.getElementById('web-calc-age').value;
  const activity = document.getElementById('web-calc-activity').value;

  if (isNaN(weight) || weight <= 0) {
    alert('Por favor, ingresa un peso de mascota válido.');
    return;
  }

  const results = calculatePortion(weight, age, activity, diet);
  
  document.getElementById('web-res-daily').textContent = `${results.dailyGrams} g`;
  document.getElementById('web-res-monthly').textContent = `${results.monthlyKg} kg`;
  
  document.getElementById('web-calc-result').classList.add('active');
};

// Renderizar testimonios en el Sitio Web (Estilo Legrand Petit)
function renderWebTestimonials() {
  const container = document.getElementById('web-testimonials-container');
  if (!container) return;

  container.innerHTML = '';

  appState.testimonials.forEach(t => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    // Generar 5 estrellas
    let starsHtml = '';
    for(let i=0; i<5; i++) {
      starsHtml += `<i class="fa-solid fa-star"></i>`;
    }

    card.innerHTML = `
      <div>
        <div class="stars-rating">${starsHtml}</div>
        <p class="testimonial-quote">&ldquo;${t.quote}&rdquo;</p>
      </div>
      <div class="testimonial-user-info">
        <img src="${t.photo_url || 'assets/logo.jpg'}" alt="${t.author}" class="testimonial-avatar">
        <div>
          <h4 class="testimonial-author-name">${t.author}</h4>
          <span class="testimonial-location">${t.location}</span>
          <div class="testimonial-dog-tag">Familia de <span>${t.dog_name}</span></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Renderizar FAQs (Acordeón Interactivo) en el Sitio Web
function renderWebFaqs() {
  const container = document.getElementById('web-faqs-container');
  if (!container) return;

  container.innerHTML = '';

  appState.faqs.forEach(f => {
    const item = document.createElement('div');
    item.className = 'faq-item';
    
    item.innerHTML = `
      <button class="faq-question" onclick="toggleFaqAccordion(this)">
        ${f.question}
        <i class="fa-solid fa-chevron-down faq-chevron"></i>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-content">
          ${f.answer}
        </div>
      </div>
    `;
    container.appendChild(item);
  });
}

// Toggle para expandir/colapsar acordeón FAQ
window.toggleFaqAccordion = function(button) {
  const item = button.parentElement;
  const isActive = item.classList.contains('active');
  
  // Cerrar todos los demás items (comportamiento profesional)
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('active');
  });

  if (!isActive) {
    item.classList.add('active');
  }
};

// ----------------------------------------------------
// 5. APP MÓVIL: FLUJO MULTI-MASCOTA (BIENVENIDA Y EDICIÓN)
// ----------------------------------------------------

function renderMobileWelcomeScreen() {
  const container = document.getElementById('welcome-pets-container');
  const title = document.getElementById('welcome-pets-title');
  if (!container) return;

  container.innerHTML = '';

  if (appState.pets.length === 0) {
    title.style.display = 'none';
    container.innerHTML = `
      <div style="padding: 1.5rem 0; color: var(--text-muted); font-size: 0.85rem;">
        No tienes mascotas registradas aún.<br>¡Comienza agregando tu primer perro!
      </div>
    `;
  } else {
    title.style.display = 'block';
    appState.pets.forEach(p => {
      const item = document.createElement('div');
      item.className = 'welcome-pet-item';
      item.onclick = () => {
        if (p.subscriptionPaid) {
          appState.activePetIdDashboard = p.id;
          changeMobileView('pet-dashboard');
        } else {
          appState.currentPetId = p.id;
          changeMobileView('calculator');
        }
      };

      const paidBadge = p.subscriptionPaid 
        ? `<span class="badge badge-success" style="font-size:0.6rem; padding: 2px 6px;"><i class="fa-solid fa-circle-check"></i> Activo</span>`
        : `<span class="badge badge-danger" style="font-size:0.6rem; padding: 2px 6px;">Pendiente pago</span>`;

      item.innerHTML = `
        <img src="${p.photo}" alt="${p.name}" class="welcome-pet-avatar">
        <div class="welcome-pet-info">
          <h4>${p.name}</h4>
          <p>${p.breed} • ${p.weight} kg</p>
        </div>
        <div>${paidBadge}</div>
      `;
      container.appendChild(item);
    });
  }
}

window.initNewPetWizard = function() {
  appState.currentPetId = 'pet_' + Date.now();
  
  document.getElementById('profile-wizard-title').textContent = 'Perfil de tu Mascota';
  document.getElementById('pet-name').value = '';
  document.getElementById('pet-breed').value = '';
  document.getElementById('pet-weight').value = '';
  document.getElementById('pet-age').value = 'adult';
  document.getElementById('pet-activity').value = 'normal';
  document.getElementById('pet-notes').value = '';
  petPhotoBase64 = null;
  document.getElementById('pet-photo-preview').innerHTML = `<i class="fa-solid fa-camera"></i><span>Subir Foto</span>`;
  
  changeMobileView('profile-setup');
};

window.cancelPetWizard = function() {
  changeMobileView('welcome');
};

window.savePetProfileAndGoToCalculator = async function() {
  const name = document.getElementById('pet-name').value.trim();
  const breed = document.getElementById('pet-breed').value.trim();
  const weight = parseFloat(document.getElementById('pet-weight').value);
  const age = document.getElementById('pet-age').value;
  const activity = document.getElementById('pet-activity').value;
  const notes = document.getElementById('pet-notes').value.trim();

  if (!name || !breed || isNaN(weight) || weight <= 0) {
    alert('Por favor, completa Nombre, Raza y Peso de tu mascota.');
    return;
  }

  let petIndex = appState.pets.findIndex(p => p.id === appState.currentPetId);
  const photo = petPhotoBase64 || (petIndex !== -1 ? appState.pets[petIndex].photo : 'assets/logo.jpg');
  
  const petData = {
    id: appState.currentPetId,
    name,
    breed,
    weight,
    age,
    activity,
    notes,
    photo,
    subscription_paid: petIndex !== -1 ? (appState.pets[petIndex].subscriptionPaid || false) : false,
    selected_recipe_id: petIndex !== -1 ? (appState.pets[petIndex].selectedRecipeId || null) : null,
    excluded_ingredients: petIndex !== -1 ? (appState.pets[petIndex].excludedIngredients || []) : [],
    added_superfoods: petIndex !== -1 ? (appState.pets[petIndex].addedSuperfoods || []) : [],
    custom_instructions: petIndex !== -1 ? (appState.pets[petIndex].customInstructions || '') : ''
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/pets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petData)
    });
    if (!response.ok) throw new Error("Error al guardar mascota en el servidor");
    
    const data = await response.json();
    const savedPet = mapPetFromAPI(data.pet);
    
    if (petIndex !== -1) {
      appState.pets[petIndex] = savedPet;
    } else {
      appState.pets.push(savedPet);
    }
    
    saveStateToStorage();
    changeMobileView('calculator');
  } catch (err) {
    alert("Error al guardar en la base de datos: " + err.message);
  }
};

window.triggerPhotoUpload = function() {
  document.getElementById('pet-photo-input').click();
};

let petPhotoBase64 = null;
window.previewPetPhoto = function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      petPhotoBase64 = e.target.result;
      document.getElementById('pet-photo-preview').innerHTML = `<img src="${petPhotoBase64}" alt="Foto Mascota">`;
    };
    reader.readAsDataURL(file);
  }
};

// ----------------------------------------------------
// 6. APP MÓVIL: CALCULADORA NUTRICIONAL E INGREDIENTES INTERACTIVOS
// ----------------------------------------------------

function renderMobileRecipeSelector() {
  const container = document.getElementById('mobile-recipe-selector');
  if (!container) return;

  container.innerHTML = '';
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;
  
  appState.recipes.forEach(r => {
    const card = document.createElement('div');
    card.className = `recipe-select-card ${pet.selectedRecipeId === r.id ? 'selected' : ''}`;
    card.onclick = () => selectRecipeMobile(r.id);
    
    card.innerHTML = `
      <div style="font-size: 1.4rem; margin-bottom: 2px;">${r.icon}</div>
      <h4>${r.name}</h4>
      <span>$${r.price.toLocaleString('es-CL')}/kg</span>
    `;
    container.appendChild(card);
  });
}

function selectRecipeMobile(recipeId) {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.selectedRecipeId = recipeId;
  pet.excludedIngredients = [];
  
  saveStateToStorage();
  renderMobileRecipeSelector();
  updatePortionCalculatorUI();
}

function updatePortionCalculatorUI() {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  if (!pet.selectedRecipeId && appState.recipes.length > 0) {
    pet.selectedRecipeId = appState.recipes[0].id;
  }

  const selectedRecipe = appState.recipes.find(r => r.id === pet.selectedRecipeId) || appState.recipes[0];
  const dietType = selectedRecipe.category;

  document.getElementById('calc-pet-avatar').src = pet.photo;
  document.getElementById('calc-pet-name').textContent = pet.name;
  document.getElementById('calc-pet-details').textContent = `${pet.breed} • ${pet.weight} kg`;
  document.getElementById('custom-instructions').value = pet.customInstructions || '';

  const results = calculatePortion(pet.weight, pet.age, pet.activity, dietType);
  pet.portionResults = results;

  document.getElementById('calc-daily-total').textContent = `${results.dailyGrams}g`;
  document.getElementById('calc-monthly-weight').textContent = results.monthlyKg;
  
  const descActivity = { sedentary: 'sedentario/senior', normal: 'actividad normal', active: 'activo', working: 'muy activo' };
  const descStage = { adult: 'mantenimiento adulto', puppy: 'crecimiento cachorro 2-4 meses', 'puppy-mid': 'crecimiento cachorro 4-6 meses', 'puppy-late': 'crecimiento cachorro 6-12 meses' };
  document.getElementById('calc-explanation').textContent = `Calculado al ${results.percentageUsed}% del peso corporal para ${descStage[pet.age]} con ${descActivity[pet.activity]}.`;

  const barWrapper = document.getElementById('calc-breakdown-bars');
  const legendWrapper = document.getElementById('calc-breakdown-legend');
  
  if (dietType === 'barf') {
    const gBones = Math.round(results.dailyGrams * 0.5);
    const gMeat = Math.round(results.dailyGrams * 0.3);
    const gOrgans = Math.round(results.dailyGrams * 0.1);
    const gVeg = Math.round(results.dailyGrams * 0.1);

    barWrapper.innerHTML = `
      <div class="bar-part bar-bones" style="width: 50%" title="Hueso Carnudo"></div>
      <div class="bar-part bar-meat" style="width: 30%" title="Carne Magra"></div>
      <div class="bar-part bar-organs" style="width: 10%" title="Vísceras"></div>
      <div class="bar-part bar-veggies" style="width: 10%" title="Vegetales"></div>
    `;
    legendWrapper.innerHTML = `
      <div class="legend-item"><span class="dot bar-bones"></span> Hueso Carnudo (${gBones}g)</div>
      <div class="legend-item"><span class="dot bar-meat"></span> Carne Magra (${gMeat}g)</div>
      <div class="legend-item"><span class="dot bar-organs"></span> Vísceras (${gOrgans}g)</div>
      <div class="legend-item"><span class="dot bar-veggies"></span> Verduras (${gVeg}g)</div>
    `;
  } else {
    const gProtein = Math.round(results.dailyGrams * 0.5);
    const gVeg = Math.round(results.dailyGrams * 0.3);
    const gCarbs = Math.round(results.dailyGrams * 0.1);
    const gOrgans = Math.round(results.dailyGrams * 0.1);

    barWrapper.innerHTML = `
      <div class="bar-part bar-meat" style="width: 50%" title="Proteína"></div>
      <div class="bar-part bar-veggies" style="width: 30%" title="Verduras"></div>
      <div class="bar-part bar-carbs" style="width: 10%" title="Carbohidratos"></div>
      <div class="bar-part bar-organs" style="width: 10%" title="Vísceras"></div>
    `;
    legendWrapper.innerHTML = `
      <div class="legend-item"><span class="dot bar-meat"></span> Proteína (${gProtein}g)</div>
      <div class="legend-item"><span class="dot bar-veggies"></span> Verduras (${gVeg}g)</div>
      <div class="legend-item"><span class="dot bar-carbs"></span> Carbohidratos (${gCarbs}g)</div>
      <div class="legend-item"><span class="dot bar-organs"></span> Vísceras (${gOrgans}g)</div>
    `;
  }

  renderInteractiveIngredients(pet, selectedRecipe);
}

function renderInteractiveIngredients(pet, recipe) {
  const ingContainer = document.getElementById('calc-ingredients-container');
  const supContainer = document.getElementById('calc-superfoods-container');
  if (!ingContainer || !supContainer) return;

  ingContainer.innerHTML = '';
  supContainer.innerHTML = '';

  const ingredients = recipe.ingredientsArray || recipe.ingredients.split(', ');

  ingredients.forEach((ing, i) => {
    const isExcluded = pet.excludedIngredients.includes(ing);
    const checkboxId = `ing-${i}`;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${!isExcluded ? 'checked' : ''} onchange="toggleIngredient('${ing}', this.checked)">
      <label for="${checkboxId}" class="pill-label base-ing">
        <i class="fa-solid fa-check"></i> ${ing}
      </label>
    `;
    ingContainer.appendChild(wrapper.firstElementChild);
    ingContainer.appendChild(wrapper.lastElementChild);
  });

  SUPERALIMENTOS.forEach((sup) => {
    const isAdded = pet.addedSuperfoods.includes(sup.id);
    const checkboxId = `sup-${sup.id}`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${isAdded ? 'checked' : ''} onchange="toggleSuperfood('${sup.id}', this.checked)">
      <label for="${checkboxId}" class="pill-label super-ing">
        <i class="fa-solid fa-plus"></i> ${sup.icon} ${sup.name}
      </label>
    `;
    supContainer.appendChild(wrapper.firstElementChild);
    supContainer.appendChild(wrapper.lastElementChild);
  });

  calculateSingleDietPrice(pet, recipe);
  renderPackageLabelPreview(pet, recipe);
}

window.toggleIngredient = function(ingredientName, isChecked) {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.excludedIngredients = pet.excludedIngredients || [];

  if (!isChecked) {
    if (!pet.excludedIngredients.includes(ingredientName)) {
      pet.excludedIngredients.push(ingredientName);
    }
  } else {
    pet.excludedIngredients = pet.excludedIngredients.filter(ing => ing !== ingredientName);
  }

  saveStateToStorage();
  updatePortionCalculatorUI();
};

window.toggleSuperfood = function(superfoodId, isChecked) {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.addedSuperfoods = pet.addedSuperfoods || [];

  if (isChecked) {
    if (!pet.addedSuperfoods.includes(superfoodId)) {
      pet.addedSuperfoods.push(superfoodId);
    }
  } else {
    pet.addedSuperfoods = pet.addedSuperfoods.filter(id => id !== superfoodId);
  }

  saveStateToStorage();
  updatePortionCalculatorUI();
};

function calculateSingleDietPrice(pet, recipe) {
  const basePrice = recipe.price;
  const dietSubtotal = Math.round(pet.portionResults.monthlyKg * basePrice);
  const superfoodExtra = (pet.addedSuperfoods || []).length * 1500;
  pet.totalPrice = dietSubtotal + superfoodExtra;

  document.getElementById('calc-diet-price').textContent = `$${pet.totalPrice.toLocaleString('es-CL')}`;
}

function renderPackageLabelPreview(pet, recipe) {
  const container = document.getElementById('calc-package-label');
  if (!container) return;

  const exList = (pet.excludedIngredients || []).map(i => `<span style="text-decoration:line-through; opacity:0.6;">- ${i}</span>`).join('<br>');
  const superList = (pet.addedSuperfoods || []).map(id => {
    const s = SUPERALIMENTOS.find(item => item.id === id);
    return s ? `+ ${s.icon} ${s.name}` : '';
  }).filter(Boolean).join('<br>');

  container.innerHTML = `
    <div class="label-title">FORMULACIÓN PERSONALIZADA</div>
    <div class="label-row"><span>PACIENTE:</span><strong>${pet.name.toUpperCase()}</strong></div>
    <div class="label-row"><span>RAZA:</span><span>${pet.breed.toUpperCase()}</span></div>
    <div class="label-row"><span>PESO:</span><span>${pet.weight} KG</span></div>
    <div class="label-row"><span>TIPO DE DIETA:</span><span>${recipe.name.toUpperCase()}</span></div>
    <div class="label-row"><span>DOSIS DIARIA:</span><strong>${pet.portionResults.dailyGrams} G</strong></div>
    <div style="border-top:1px dashed rgba(44,26,14,0.15); margin: 0.5rem 0; padding-top: 0.5rem;">
      <strong>EXCLUSIONES DE ALERGIAS:</strong><br>
      ${exList || '<span style="opacity:0.6;">NINGUNA</span>'}
    </div>
    <div style="border-top:1px dashed rgba(44,26,14,0.15); margin: 0.5rem 0; padding-top: 0.5rem;">
      <strong>SUPLEMENTOS / SUPERALIMENTOS:</strong><br>
      ${superList || '<span style="opacity:0.6;">NINGUNO</span>'}
    </div>
    <div style="font-size:0.6rem; text-align:center; margin-top:0.75rem; font-weight:700;">
      ORIGEN CANINO - COMIDA REAL
    </div>
  `;
}

window.proceedToSnacks = async function() {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (pet) {
    pet.customInstructions = document.getElementById('custom-instructions').value.trim();
    
    const petData = {
      id: pet.id,
      name: pet.name,
      breed: pet.breed,
      weight: pet.weight,
      age: pet.age,
      activity: pet.activity,
      notes: pet.notes,
      photo: pet.photo,
      subscription_paid: pet.subscriptionPaid,
      selected_recipe_id: pet.selectedRecipeId,
      excluded_ingredients: pet.excludedIngredients,
      added_superfoods: pet.addedSuperfoods,
      custom_instructions: pet.customInstructions,
      address: pet.address
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/pets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData)
      });
      if (!res.ok) throw new Error("Error al sincronizar mascota en el servidor");
    } catch (err) {
      console.warn("Error al guardar cambios de receta en el servidor:", err);
    }
    saveStateToStorage();
  }
  changeMobileView('snacks');
};

// ----------------------------------------------------
// 7. APP MÓVIL: CATÁLOGO DE SNACKS Y CALCULO TOTALES MULTI-PERRO
// ----------------------------------------------------

function renderMobileSnacksList() {
  const container = document.getElementById('mobile-snacks-container');
  if (!container) return;

  container.innerHTML = '';

  appState.snacks.forEach(s => {
    const qty = appState.snacksCart[s.id] || 0;
    
    const item = document.createElement('div');
    item.className = 'mobile-snack-item';
    
    item.innerHTML = `
      <div class="mobile-snack-icon">${s.icon}</div>
      <div class="mobile-snack-info">
        <h4>${s.name}</h4>
        <p>${s.ingredients} • <strong>$${s.price.toLocaleString('es-CL')} / ${s.unit}</strong></p>
      </div>
      <div class="mobile-snack-qty">
        <button class="qty-btn" onclick="updateSnackQty('${s.id}', -1)">-</button>
        <span style="font-weight:700; width: 14px; text-align: center;">${qty}</span>
        <button class="qty-btn" onclick="updateSnackQty('${s.id}', 1)">+</button>
      </div>
    `;
    container.appendChild(item);
  });

  calculateSubscriptionTotals();
}

window.updateSnackQty = function(snackId, change) {
  const currentQty = appState.snacksCart[snackId] || 0;
  let newQty = currentQty + change;
  if (newQty < 0) newQty = 0;
  
  if (newQty === 0) {
    delete appState.snacksCart[snackId];
  } else {
    appState.snacksCart[snackId] = newQty;
  }
  
  saveStateToStorage();
  renderMobileSnacksList();
};

let globalCartTotal = 0;
let globalDietSubtotal = 0;
let globalSnacksSubtotal = 0;

function calculateSubscriptionTotals() {
  globalDietSubtotal = 0;
  const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
  
  unpaidPets.forEach(p => {
    globalDietSubtotal += p.totalPrice || 0;
  });

  globalSnacksSubtotal = 0;
  for (const snackId in appState.snacksCart) {
    const snack = appState.snacks.find(s => s.id === snackId);
    if (snack) {
      globalSnacksSubtotal += snack.price * appState.snacksCart[snackId];
    }
  }

  globalCartTotal = globalDietSubtotal + globalSnacksSubtotal;

  document.getElementById('snacks-diet-subtotal').textContent = `$${globalDietSubtotal.toLocaleString('es-CL')}`;
  document.getElementById('snacks-only-subtotal').textContent = `$${globalSnacksSubtotal.toLocaleString('es-CL')}`;
  document.getElementById('snacks-total').textContent = `$${globalCartTotal.toLocaleString('es-CL')}`;
}

window.proceedToCheckout = function() {
  const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
  if (unpaidPets.length === 0 && Object.keys(appState.snacksCart).length === 0) {
    alert('Tu carrito está vacío o no tienes dietas de mascotas pendientes por pagar.');
    changeMobileView('welcome');
    return;
  }
  changeMobileView('checkout');
};

// ----------------------------------------------------
// 8. APP MÓVIL: PASARELA DE PAGO INTERACTIVA (CHECKOUT)
// ----------------------------------------------------

function setupCheckoutUI() {
  document.getElementById('checkout-total-val').textContent = `$${globalCartTotal.toLocaleString('es-CL')}`;
  
  const listContainer = document.getElementById('checkout-pets-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
    
    unpaidPets.forEach(p => {
      const rec = appState.recipes.find(r => r.id === p.selectedRecipeId) || appState.recipes[0];
      const row = document.createElement('div');
      row.className = 'checkout-pet-row';
      
      row.innerHTML = `
        <span class="pet-title">
          <img src="${p.photo}" alt="${p.name}">
          ${p.name} (${rec.icon} Dieta Mensual)
        </span>
        <strong>$${p.totalPrice.toLocaleString('es-CL')}</strong>
      `;
      listContainer.appendChild(row);
    });

    for (const snackId in appState.snacksCart) {
      const snack = appState.snacks.find(s => s.id === snackId);
      const qty = appState.snacksCart[snackId];
      if (snack) {
        const row = document.createElement('div');
        row.className = 'checkout-pet-row';
        row.innerHTML = `
          <span style="opacity: 0.85;">🍪 Snack: ${snack.name} x${qty}</span>
          <strong>$${(snack.price * qty).toLocaleString('es-CL')}</strong>
        `;
        listContainer.appendChild(row);
      }
    }
  }

  document.getElementById('pay-cardholder').value = '';
  document.getElementById('pay-cardnumber').value = '';
  document.getElementById('pay-expiry').value = '';
  document.getElementById('pay-cvv').value = '';
  
  document.getElementById('card-name-preview').textContent = 'Nombre Completo';
  document.getElementById('card-num-preview').textContent = '•••• •••• •••• ••••';
  document.getElementById('card-exp-preview').textContent = 'MM/AA';
  document.getElementById('card-cvv-preview').textContent = '123';
  
  const cardWrapper = document.getElementById('checkout-credit-card');
  cardWrapper.classList.remove('flipped');
}

window.flipCard = function(isFocused) {
  const cardWrapper = document.getElementById('checkout-credit-card');
  if (isFocused) {
    cardWrapper.classList.add('flipped');
  } else {
    cardWrapper.classList.remove('flipped');
  }
};

window.updateCardPreview = function(field, value) {
  if (field === 'name') {
    document.getElementById('card-name-preview').textContent = value.trim() || 'Nombre Completo';
  } else if (field === 'number') {
    let cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      formatted.push(cleaned.substring(i, i + 4));
    }
    const finalVal = formatted.join(' ');
    document.getElementById('pay-cardnumber').value = finalVal;
    document.getElementById('card-num-preview').textContent = finalVal || '•••• •••• •••• ••••';
  } else if (field === 'expiry') {
    let cleaned = value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.substring(0,2) + '/' + cleaned.substring(2,4);
    }
    document.getElementById('pay-expiry').value = cleaned;
    document.getElementById('card-exp-preview').textContent = cleaned || 'MM/AA';
  } else if (field === 'cvv') {
    document.getElementById('card-cvv-preview').textContent = value || '123';
  }
};

window.processSecurePayment = async function() {
  const holder = document.getElementById('pay-cardholder').value.trim();
  const num = document.getElementById('pay-cardnumber').value.trim();
  const expiry = document.getElementById('pay-expiry').value.trim();
  const cvv = document.getElementById('pay-cvv').value.trim();
  const address = document.getElementById('pay-address').value.trim();

  if (!holder || !num || !expiry || !cvv || !address) {
    alert('Ingresa todos los campos requeridos para el pago seguro.');
    return;
  }

  if (num.replace(/\s/g, '').length < 16) {
    alert('El número de tarjeta de crédito es incorrecto.');
    return;
  }

  const payBtn = document.getElementById('pay-btn');
  payBtn.disabled = true;
  payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando Transacción...`;

  const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
  const orderId = `OC-${Math.floor(1000 + Math.random() * 9000)}`;
  const petNames = unpaidPets.map(p => p.name).join(', ');
  const petDetails = unpaidPets.map(p => `${p.name} (${p.weight}kg, ${p.breed})`).join(' | ');

  const recipeSummary = unpaidPets.map(p => {
    const rec = appState.recipes.find(r => r.id === p.selectedRecipeId);
    const superLabels = (p.addedSuperfoods || []).map(id => SUPERALIMENTOS.find(s => s.id === id)?.name || id).join(', ');
    const supText = superLabels ? ` [Suplementos: ${superLabels}]` : '';
    return `${p.name}: ${rec?.name || 'Receta'}${supText}`;
  }).join('; ');

  const snacksArr = [];
  for (const snackId in appState.snacksCart) {
    const snack = appState.snacks.find(s => s.id === snackId);
    if (snack) {
      snacksArr.push(`${snack.name} (x${appState.snacksCart[snackId]})`);
    }
  }

  const dailyGramsTotal = unpaidPets.reduce((acc, p) => acc + (p.portionResults?.dailyGrams || 0), 0);
  const monthlyKgTotal = unpaidPets.reduce((acc, p) => acc + (p.portionResults?.monthlyKg || 0), 0);

  const orderData = {
    order_id: orderId,
    date: new Date().toLocaleDateString('es-CL'),
    pet_name: petNames,
    pet_breed: petDetails,
    pet_weight: unpaidPets.reduce((acc, p) => acc + p.weight, 0),
    pet_photo: unpaidPets[0]?.photo || 'assets/logo.jpg',
    recipe_name: recipeSummary,
    daily_grams: dailyGramsTotal,
    monthly_kg: monthlyKgTotal,
    snacks: snacksArr.join(', ') || 'Ninguno',
    total_price: globalCartTotal,
    address: address,
    paid_status: 'Verificado'
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) throw new Error("Error al procesar la orden en el servidor");
    
    unpaidPets.forEach(p => {
      p.subscriptionPaid = true;
      p.address = address;
    });

    if (unpaidPets.length > 0) {
      appState.activePetIdDashboard = unpaidPets[0].id;
    }

    appState.snacksCart = {};
    saveStateToStorage();

    payBtn.disabled = false;
    payBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Pagar Suscripción`;
    
    changeMobileView('receipt');
  } catch (err) {
    alert("Error al procesar pago: " + err.message);
    payBtn.disabled = false;
    payBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Pagar Suscripción`;
  }
};

// ----------------------------------------------------
// 9. APP MÓVIL: RECIBO Y DASHBOARD DE MASCOTAS
// ----------------------------------------------------

function setupReceiptUI() {
  const container = document.getElementById('receipt-details-container');
  if (!container) return;

  const paidPets = appState.pets.filter(p => p.subscriptionPaid);
  
  let petRows = paidPets.map(p => {
    const rec = appState.recipes.find(r => r.id === p.selectedRecipeId) || appState.recipes[0];
    return `<div class="receipt-row"><span>${p.name}:</span><strong>${rec.name} (${p.portionResults?.monthlyKg} kg)</strong></div>`;
  }).join('');

  container.innerHTML = `
    ${petRows}
    <div class="receipt-row">
      <span>Frecuencia de Despacho:</span>
      <span>Mensual (Cada 30 días)</span>
    </div>
    <div class="receipt-row total-row">
      <span>Monto Total Cobrado:</span>
      <span style="font-size:1.15rem;">$${globalCartTotal.toLocaleString('es-CL')}</span>
    </div>
  `;
}

window.loadPetDashboardView = function() {
  changeMobileView('pet-dashboard');
};

function renderPetDashboard() {
  const paidPets = appState.pets.filter(p => p.subscriptionPaid);
  
  if (paidPets.length === 0) {
    alert('No posees suscripciones activas pagadas.');
    changeMobileView('welcome');
    return;
  }

  const selector = document.getElementById('dash-pet-selector');
  if (selector) {
    selector.innerHTML = '';
    
    paidPets.forEach(p => {
      const img = document.createElement('img');
      img.src = p.photo;
      img.alt = p.name;
      img.className = `pet-selector-avatar ${appState.activePetIdDashboard === p.id ? 'active' : ''}`;
      img.onclick = () => {
        appState.activePetIdDashboard = p.id;
        renderPetDashboard();
      };
      selector.appendChild(img);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'pet-selector-add';
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addBtn.onclick = () => initNewPetWizard();
    selector.appendChild(addBtn);
  }

  const activePet = paidPets.find(p => p.id === appState.activePetIdDashboard) || paidPets[0];
  appState.activePetIdDashboard = activePet.id;

  document.getElementById('dash-pet-avatar').src = activePet.photo;
  document.getElementById('dash-pet-name').textContent = activePet.name;
  document.getElementById('dash-pet-details').textContent = `${activePet.breed} • ${activePet.weight} kg`;
  
  const rec = appState.recipes.find(r => r.id === activePet.selectedRecipeId) || appState.recipes[0];
  document.getElementById('dash-diet-recipe').textContent = rec.name;
  document.getElementById('dash-daily-portion').textContent = `${activePet.portionResults.dailyGrams} g / día`;
  document.getElementById('dash-monthly-cost').textContent = `$${activePet.totalPrice.toLocaleString('es-CL')}`;

  const guideWrapper = document.getElementById('dash-feeding-guide');
  const results = activePet.portionResults;
  
  if (rec.category === 'barf') {
    const gBones = Math.round(results.dailyGrams * 0.5);
    const gMeat = Math.round(results.dailyGrams * 0.3);
    const gOrgans = Math.round(results.dailyGrams * 0.1);
    const gVeg = Math.round(results.dailyGrams * 0.1);

    guideWrapper.innerHTML = `
      <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.35rem;">
        <div style="display:flex; justify-content:space-between;"><span>Hueso Carnudo (Pollo/Pavo):</span><strong>${gBones}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Carne Magra picada:</span><strong>${gMeat}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Vísceras y Órganos:</span><strong>${gOrgans}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Vegetales y Frutas:</span><strong>${gVeg}g</strong></div>
      </div>
    `;
  } else {
    const gProtein = Math.round(results.dailyGrams * 0.5);
    const gVeg = Math.round(results.dailyGrams * 0.3);
    const gCarbs = Math.round(results.dailyGrams * 0.1);
    const gOrgans = Math.round(results.dailyGrams * 0.1);

    guideWrapper.innerHTML = `
      <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.35rem;">
        <div style="display:flex; justify-content:space-between;"><span>Proteínas al vapor:</span><strong>${gProtein}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Verduras picadas:</span><strong>${gVeg}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Carbohidratos saludables:</span><strong>${gCarbs}g</strong></div>
        <div style="display:flex; justify-content:space-between;"><span>Vísceras cocidas:</span><strong>${gOrgans}g</strong></div>
      </div>
    `;
  }
}

window.editCurrentPlanFromDashboard = function() {
  appState.currentPetId = appState.activePetIdDashboard;
};

window.logoutApp = function() {
  if (confirm('¿Deseas cerrar sesión? Se borrarán las mascotas del dispositivo local.')) {
    appState.pets = [];
    appState.currentPetId = null;
    appState.activePetIdDashboard = null;
    appState.snacksCart = {};
    saveStateToStorage();
    changeMobileView('welcome');
  }
};

async function fetchAdminOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
      headers: {
        "Authorization": `Bearer ${appState.adminToken}`
      }
    });
    if (!res.ok) {
      if (res.status === 401) {
        logoutAdmin();
        return;
      }
      throw new Error("No se pudieron cargar las órdenes");
    }
    const rawOrders = await res.json();
    appState.orders = rawOrders.map(mapOrderFromAPI);
  } catch (err) {
    console.error("Error al cargar órdenes del backend:", err);
  }
}

// ----------------------------------------------------
// 10. PANEL DE ADMINISTRACIÓN (MANTENEDORES)
// ----------------------------------------------------

async function initAdminPanel() {
  document.getElementById('cfg-barf-price').value = appState.params.barf_price_per_kg;
  document.getElementById('cfg-cooked-price').value = appState.params.cooked_price_per_kg;
  
  document.getElementById('cfg-barf-adult-sedentary').value = appState.params.barf_adult_sedentary;
  document.getElementById('cfg-barf-adult-normal').value = appState.params.barf_adult_normal;
  document.getElementById('cfg-barf-adult-active').value = appState.params.barf_adult_active;
  document.getElementById('cfg-barf-adult-working').value = appState.params.barf_adult_working;

  document.getElementById('cfg-cooked-adult-sedentary').value = appState.params.cooked_adult_sedentary;
  document.getElementById('cfg-cooked-adult-normal').value = appState.params.cooked_adult_normal;
  document.getElementById('cfg-cooked-adult-active').value = appState.params.cooked_adult_active;
  document.getElementById('cfg-cooked-adult-working').value = appState.params.cooked_adult_working;

  document.getElementById('cfg-puppy-early').value = appState.params.puppy_early;
  document.getElementById('cfg-puppy-mid').value = appState.params.puppy_mid;
  document.getElementById('cfg-puppy-late').value = appState.params.puppy_late;

  renderAdminProductsTable();
  await fetchAdminOrders();
  renderAdminOrdersTable();
  renderAdminTestimonialsTable();
  renderAdminFaqsTable();
}

window.switchAdminTab = async function(tabName) {
  appState.adminTab = tabName;
  
  document.querySelectorAll('.admin-menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-view-panel').forEach(panel => panel.classList.remove('active'));
  
  const activeBtn = document.querySelector(`.admin-menu-btn[onclick="switchAdminTab('${tabName}')"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const activePanel = document.getElementById(`admin-panel-${tabName}`);
  if (activePanel) activePanel.classList.add('active');

  if (tabName === 'recipes') {
    renderAdminProductsTable();
  } else if (tabName === 'orders') {
    await fetchAdminOrders();
    renderAdminOrdersTable();
  } else if (tabName === 'testimonials') {
    renderAdminTestimonialsTable();
  } else if (tabName === 'faqs') {
    renderAdminFaqsTable();
  }
};

window.saveAdminParameters = async function() {
  const updatedParams = {
    barf_price_per_kg: parseInt(document.getElementById('cfg-barf-price').value),
    cooked_price_per_kg: parseInt(document.getElementById('cfg-cooked-price').value),
    barf_adult_sedentary: parseFloat(document.getElementById('cfg-barf-adult-sedentary').value),
    barf_adult_normal: parseFloat(document.getElementById('cfg-barf-adult-normal').value),
    barf_adult_active: parseFloat(document.getElementById('cfg-barf-adult-active').value),
    barf_adult_working: parseFloat(document.getElementById('cfg-barf-adult-working').value),
    cooked_adult_sedentary: parseFloat(document.getElementById('cfg-cooked-adult-sedentary').value),
    cooked_adult_normal: parseFloat(document.getElementById('cfg-cooked-adult-normal').value),
    cooked_adult_active: parseFloat(document.getElementById('cfg-cooked-adult-active').value),
    cooked_adult_working: parseFloat(document.getElementById('cfg-cooked-adult-working').value),
    puppy_early: parseFloat(document.getElementById('cfg-puppy-early').value),
    puppy_mid: parseFloat(document.getElementById('cfg-puppy-mid').value),
    puppy_late: parseFloat(document.getElementById('cfg-puppy-late').value)
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/config/parameters`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(updatedParams)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada o no autorizada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudieron guardar los parámetros");
    }

    appState.params = { ...appState.params, ...updatedParams };
    
    appState.recipes.forEach(r => {
      if (r.category === 'barf') r.price = appState.params.barf_price_per_kg;
      if (r.category === 'cooked') r.price = appState.params.cooked_price_per_kg;
    });

    alert('¡Parámetros de cálculo y precios actualizados con éxito!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

function renderAdminProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  const all = [...appState.recipes, ...appState.snacks];

  all.forEach(p => {
    const isRecipe = p.category === 'barf' || p.category === 'cooked';
    const catLabel = p.category === 'barf' ? 'BARF' : (p.category === 'cooked' ? 'Cocinada' : 'Snack');
    const badgeClass = p.category === 'barf' ? 'badge-success' : (p.category === 'cooked' ? 'badge-danger' : 'badge-info');
    const priceLabel = isRecipe ? `$${p.price.toLocaleString('es-CL')}/kg` : `$${p.price.toLocaleString('es-CL')} por ${p.unit}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size: 1.5rem; text-align: center;">${p.icon}</td>
      <td style="font-weight: 700; color: var(--secondary-brown);">${p.name}</td>
      <td><span class="badge ${badgeClass}">${catLabel}</span></td>
      <td style="max-width: 350px; font-size: 0.8rem; color: var(--text-muted);">${p.ingredients}</td>
      <td style="font-weight: 700; color: var(--primary-green);">${priceLabel}</td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-edit" onclick="editProductInAdmin('${p.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteProductInAdmin('${p.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAddProductForm = function() {
  document.getElementById('add-product-form-container').style.display = 'block';
  document.getElementById('form-product-title').textContent = 'Agregar Nuevo Producto';
  document.getElementById('form-product-id').value = '';
  
  document.getElementById('form-product-name').value = '';
  document.getElementById('form-product-category').value = 'barf';
  document.getElementById('form-product-price').value = '';
  document.getElementById('form-product-icon').value = '';
  document.getElementById('form-product-ingredients').value = '';
};

window.hideProductForm = function() {
  document.getElementById('add-product-form-container').style.display = 'none';
};

window.editProductInAdmin = function(prodId) {
  const all = [...appState.recipes, ...appState.snacks];
  const prod = all.find(p => p.id === prodId);
  if (!prod) return;

  document.getElementById('add-product-form-container').style.display = 'block';
  document.getElementById('form-product-title').textContent = `Editar Producto: ${prod.name}`;
  document.getElementById('form-product-id').value = prod.id;
  
  document.getElementById('form-product-name').value = prod.name;
  document.getElementById('form-product-category').value = prod.category;
  document.getElementById('form-product-price').value = prod.price;
  document.getElementById('form-product-icon').value = prod.icon;
  document.getElementById('form-product-ingredients').value = prod.ingredients;
};

window.submitProductForm = async function() {
  const id = document.getElementById('form-product-id').value;
  const name = document.getElementById('form-product-name').value.trim();
  const category = document.getElementById('form-product-category').value;
  const price = parseFloat(document.getElementById('form-product-price').value);
  const icon = document.getElementById('form-product-icon').value.trim() || '🍖';
  const ingredients = document.getElementById('form-product-ingredients').value.trim();

  if (!name || isNaN(price) || price <= 0 || !ingredients) {
    alert('Ingresa todos los datos requeridos.');
    return;
  }

  const ingredients_array = ingredients.split(', ');

  const recipeData = {
    id: id || null,
    name,
    category,
    price,
    icon,
    ingredients,
    ingredients_array
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(recipeData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudo guardar el producto");
    }

    const data = await res.json();
    const savedProd = mapRecipeFromAPI(data.recipe);
    const isRecipe = category === 'barf' || category === 'cooked';

    if (id) {
      if (isRecipe) {
        const idx = appState.recipes.findIndex(r => r.id === id);
        if (idx !== -1) appState.recipes[idx] = savedProd;
      } else {
        const idx = appState.snacks.findIndex(s => s.id === id);
        if (idx !== -1) appState.snacks[idx] = savedProd;
      }
    } else {
      if (isRecipe) {
        appState.recipes.push(savedProd);
      } else {
        appState.snacks.push(savedProd);
      }
    }

    hideProductForm();
    renderAdminProductsTable();
    renderWebProducts();
    alert('¡Catálogo actualizado!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

window.deleteProductInAdmin = async function(prodId) {
  if (confirm('¿Eliminar producto?')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recipes/${prodId}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${appState.adminToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesión expirada. Por favor inicia sesión.");
          logoutAdmin();
          return;
        }
        throw new Error("No se pudo eliminar el producto");
      }

      appState.recipes = appState.recipes.filter(r => r.id !== prodId);
      appState.snacks = appState.snacks.filter(s => s.id !== prodId);

      renderAdminProductsTable();
      renderWebProducts();
      alert('¡Producto eliminado!');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

function renderAdminOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  if (appState.orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay suscripciones activas registradas.</td></tr>`;
    return;
  }

  appState.orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">
        <img src="${o.petPhoto}" alt="${o.petName}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary-green);">
      </td>
      <td>
        <strong style="color: var(--secondary-brown); font-size: 0.95rem;">${o.petName}</strong>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Dirección: ${o.address}</div>
      </td>
      <td style="font-size: 0.78rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
        ${o.petBreed}
      </td>
      <td style="font-size: 0.78rem; color: var(--text-dark);">
        ${o.recipeName}
        <div style="font-size: 0.72rem; color: var(--accent-red); font-weight:700;">Snacks: ${o.snacks}</div>
      </td>
      <td style="font-weight: 600; font-size: 0.78rem;">
        Total: ${o.dailyGrams} g/día
        <div style="font-size: 0.72rem; font-weight: normal; color: var(--text-muted);">${o.monthlyKg} kg/mes</div>
      </td>
      <td style="font-weight: 700; color: var(--primary-green); font-size: 0.9rem;">
        $${o.totalPrice.toLocaleString('es-CL')}
      </td>
      <td>
        <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${o.paidStatus}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ----------------------------------------------------
// 10.1 MANTENEDOR DE TESTIMONIOS (CRUD)
// ----------------------------------------------------

function renderAdminTestimonialsTable() {
  const tbody = document.getElementById('admin-testimonials-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  appState.testimonials.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">
        <img src="${t.photo_url || 'assets/logo.jpg'}" alt="${t.author}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary-green);">
      </td>
      <td style="font-weight: 600; color: var(--secondary-brown);">${t.author}</td>
      <td>${t.location}</td>
      <td style="font-weight: 500;">${t.dog_name}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${t.quote}
      </td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-edit" onclick="editTestimonialInAdmin('${t.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteTestimonialInAdmin('${t.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAddTestimonialForm = function() {
  document.getElementById('add-testimonial-form-container').style.display = 'block';
  document.getElementById('form-testimonial-title').textContent = 'Agregar Testimonio';
  document.getElementById('form-testimonial-id').value = '';
  document.getElementById('form-testimonial-author').value = '';
  document.getElementById('form-testimonial-location').value = '';
  document.getElementById('form-testimonial-dog').value = '';
  document.getElementById('form-testimonial-photo').value = '';
  document.getElementById('form-testimonial-quote').value = '';
};

window.hideTestimonialForm = function() {
  document.getElementById('add-testimonial-form-container').style.display = 'none';
};

window.editTestimonialInAdmin = function(id) {
  const t = appState.testimonials.find(item => item.id === id);
  if (!t) return;

  document.getElementById('add-testimonial-form-container').style.display = 'block';
  document.getElementById('form-testimonial-title').textContent = `Editar Testimonio de ${t.author}`;
  document.getElementById('form-testimonial-id').value = t.id;
  document.getElementById('form-testimonial-author').value = t.author;
  document.getElementById('form-testimonial-location').value = t.location;
  document.getElementById('form-testimonial-dog').value = t.dog_name;
  document.getElementById('form-testimonial-photo').value = t.photo_url || '';
  document.getElementById('form-testimonial-quote').value = t.quote;
};

window.submitTestimonialForm = async function() {
  const id = document.getElementById('form-testimonial-id').value;
  const author = document.getElementById('form-testimonial-author').value.trim();
  const location = document.getElementById('form-testimonial-location').value.trim();
  const dog_name = document.getElementById('form-testimonial-dog').value.trim() || 'Mascota';
  const photo_url = document.getElementById('form-testimonial-photo').value.trim() || 'assets/logo.jpg';
  const quote = document.getElementById('form-testimonial-quote').value.trim();

  if (!author || !location || !quote) {
    alert('Ingresa el Nombre del Autor, la Ubicación y la Opinión.');
    return;
  }

  const testimonialData = {
    id: id || null,
    author,
    location,
    dog_name,
    photo_url,
    quote
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/testimonials`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(testimonialData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudo guardar el testimonio");
    }

    const data = await res.json();
    const savedTest = data.testimonial;

    if (id) {
      const idx = appState.testimonials.findIndex(item => item.id === id);
      if (idx !== -1) appState.testimonials[idx] = savedTest;
    } else {
      appState.testimonials.push(savedTest);
    }

    hideTestimonialForm();
    renderAdminTestimonialsTable();
    renderWebTestimonials();
    alert('¡Testimonio guardado exitosamente!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

window.deleteTestimonialInAdmin = async function(id) {
  if (confirm('¿Seguro que deseas eliminar este testimonio de la web?')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${appState.adminToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Sesión expirada. Por favor inicia sesión.");
          logoutAdmin();
          return;
        }
        throw new Error("No se pudo eliminar el testimonio");
      }

      appState.testimonials = appState.testimonials.filter(item => item.id !== id);
      renderAdminTestimonialsTable();
      renderWebTestimonials();
      alert('¡Testimonio eliminado!');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 10.2 MANTENEDOR DE FAQS (CRUD)
// ----------------------------------------------------

function renderAdminFaqsTable() {
  const tbody = document.getElementById('admin-faqs-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  appState.faqs.forEach(f => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: var(--secondary-brown); font-size: 0.88rem;">${f.question}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted); max-width: 450px; overflow: hidden; text-overflow: ellipsis;">
        ${f.answer}
      </td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-edit" onclick="editFaqInAdmin('${f.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteFaqInAdmin('${f.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAddFaqForm = function() {
  document.getElementById('add-faq-form-container').style.display = 'block';
  document.getElementById('form-faq-title').textContent = 'Agregar FAQ';
  document.getElementById('form-faq-id').value = '';
  document.getElementById('form-faq-question').value = '';
  document.getElementById('form-faq-answer').value = '';
};

window.hideFaqForm = function() {
  document.getElementById('add-faq-form-container').style.display = 'none';
};

window.editFaqInAdmin = function(id) {
  const f = appState.faqs.find(item => item.id === id);
  if (!f) return;

  document.getElementById('add-faq-form-container').style.display = 'block';
  document.getElementById('form-faq-title').textContent = `Editar FAQ`;
  document.getElementById('form-faq-id').value = f.id;
  document.getElementById('form-faq-question').value = f.question;
  document.getElementById('form-faq-answer').value = f.answer;
};

window.submitFaqForm = async function() {
  const id = document.getElementById('form-faq-id').value;
  const question = document.getElementById('form-faq-question').value.trim();
  const answer = document.getElementById('form-faq-answer').value.trim();

  if (!question || !answer) {
    alert('Ingresa tanto la pregunta como su respuesta.');
    return;
  }

  const faqData = {
    id: id || null,
    question,
    answer
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/faqs`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(faqData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudo guardar la FAQ");
    }

    const data = await res.json();
    const savedFaq = data.faq;

    if (id) {
      const idx = appState.faqs.findIndex(item => item.id === id);
      if (idx !== -1) appState.faqs[idx] = savedFaq;
    } else {
      appState.faqs.push(savedFaq);
    }

    hideFaqForm();
    renderAdminFaqsTable();
    renderWebFaqs();
  }
};
// ----------------------------------------------------
// 10.3 PORTAL PPV SOLUCIONES INFORMÁTICAS (MODAL)
// ----------------------------------------------------
window.openPpvModal = function(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('ppv-contact-modal');
  if (modal) {
    modal.classList.add('active');
    document.getElementById('ppv-contact-form').style.display = 'block';
    document.getElementById('ppv-form-success').style.display = 'none';
    document.getElementById('ppv-contact-form').reset();
  }
};

window.closePpvModal = function() {
  const modal = document.getElementById('ppv-contact-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.submitPpvForm = async function(event) {
  if (event) event.preventDefault();
  
  const name = document.getElementById('ppv-name').value.trim();
  const email = document.getElementById('ppv-email').value.trim();
  const phone = document.getElementById('ppv-phone').value.trim();
  const message = document.getElementById('ppv-message').value.trim();

  if (!name || !email || !phone || !message) {
    alert('Por favor, completa todos los campos del formulario.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message })
    });
    if (!res.ok) throw new Error("Error al enviar tus datos");

    // Ocultar formulario y mostrar éxito
    document.getElementById('ppv-contact-form').style.display = 'none';
    document.getElementById('ppv-form-success').style.display = 'block';
  } catch (err) {
    alert("Error al enviar solicitud: " + err.message);
  }
};

window.loginAdmin = async function() {
  const username = document.getElementById('admin-user-input').value.trim();
  const password = document.getElementById('admin-pass-input').value.trim();

  if (!username || !password) {
    alert('Por favor, ingresa usuario y contraseña.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Usuario o contraseña inválidos");
    }

    const data = await res.json();
    appState.adminToken = data.token;
    localStorage.setItem('oc_admin_token', data.token);

    // Ocultar login y mostrar mantenedores
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-dashboard-wrapper').style.display = 'flex';

    // Cargar datos
    initAdminPanel();
  } catch (err) {
    alert("Error de autenticación: " + err.message);
  }
};

window.logoutAdmin = function() {
  appState.adminToken = null;
  localStorage.removeItem('oc_admin_token');
  document.getElementById('admin-login-box').style.display = 'flex';
  document.getElementById('admin-dashboard-wrapper').style.display = 'none';
  document.getElementById('admin-user-input').value = '';
  document.getElementById('admin-pass-input').value = '';
};

// ----------------------------------------------------
// 11. INICIALIZACIÓN DE LA APLICACIÓN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadInitialDataFromAPI();
  
  if (appState.adminToken) {
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-dashboard-wrapper').style.display = 'flex';
  } else {
    document.getElementById('admin-login-box').style.display = 'flex';
    document.getElementById('admin-dashboard-wrapper').style.display = 'none';
  }
});
