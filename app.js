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
  mobileView: 'welcome'
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
    
    // CHECK FOR CUSTOMER TOKEN
    const token = localStorage.getItem('oc_customer_token');
    if (token) {
      appState.customerToken = token;
      const name = localStorage.getItem('oc_customer_name') || 'Cliente';
      
      const badge = document.getElementById('customer-header-badge');
      const badgeName = document.getElementById('customer-header-name');
      if (badge && badgeName) {
        badgeName.textContent = name;
        badge.style.display = 'flex';
      }
      
      // Sync/Fetch customer pets
      await syncCustomerPets();
    } else {
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
    }
    
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
    } else if (viewName === 'auth') {
      document.getElementById('mb-auth-email').value = '';
      document.getElementById('mb-auth-pass').value = '';
      document.getElementById('mb-auth-reg-name').value = '';
      document.getElementById('mb-auth-reg-email').value = '';
      document.getElementById('mb-auth-reg-pass').value = '';
      toggleMobileAuthView(false);
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
  } else if (viewName === 'pet-dashboard' || viewName === 'checkout' || viewName === 'receipt' || viewName === 'auth') {
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
          <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" onclick="startOrderFlow()">
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

  const selectedRecipe = appState.recipes.find(r => r.id === pet.selectedRecipeId) || appState.recipes[0] || DEFAULT_RECIPES[0];
  const dietType = selectedRecipe ? selectedRecipe.category : 'barf';

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
  if (!appState.customerToken) {
    changeMobileView('auth');
  } else {
    changeMobileView('checkout');
  }
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
  
  const rec = appState.recipes.find(r => r.id === activePet.selectedRecipeId) || appState.recipes[0] || DEFAULT_RECIPES[0];
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
    appState.customerToken = null;
    localStorage.removeItem('oc_customer_token');
    localStorage.removeItem('oc_customer_name');
    localStorage.removeItem('oc_customer_email');
    
    const badge = document.getElementById('customer-header-badge');
    if (badge) badge.style.display = 'none';
    
    appState.pets = [];
    appState.currentPetId = null;
    appState.activePetIdDashboard = null;
    appState.snacksCart = {};
    saveStateToStorage();
    changeMobileView('welcome');
  }
};

// ==========================================================================
// MODO MULTI-DISPOSITIVO, CUENTAS CLIENTES Y ASISTENTE COMPRA DESKTOP
// ==========================================================================

let dkWizardCurrentStep = 1;
let dkPet = {
  id: '',
  name: '',
  breed: '',
  weight: 0,
  age: 'adult',
  activity: 'normal',
  notes: '',
  photo: 'assets/logo.jpg',
  selectedRecipeId: '',
  excludedIngredients: [],
  addedSuperfoods: [],
  customInstructions: '',
  address: ''
};
let dkSnacksCart = {};
let dkPetPhotoBase64 = null;

// Routing principal de compra
window.startOrderFlow = function() {
  if (isMobileDevice()) {
    switchView('mobile');
    changeMobileView('welcome');
  } else {
    openDesktopWizard();
  }
};

// Controladores del Asistente Desktop (Wizard)
window.openDesktopWizard = function() {
  dkWizardCurrentStep = 1;
  dkPet = {
    id: 'pet_' + Date.now(),
    name: '',
    breed: '',
    weight: 0,
    age: 'adult',
    activity: 'normal',
    notes: '',
    photo: 'assets/logo.jpg',
    selectedRecipeId: '',
    excludedIngredients: [],
    addedSuperfoods: [],
    customInstructions: '',
    address: ''
  };
  dkSnacksCart = {};
  dkPetPhotoBase64 = null;
  
  // Limpiar inputs
  document.getElementById('dk-pet-name').value = '';
  document.getElementById('dk-pet-breed').value = '';
  document.getElementById('dk-pet-weight').value = '';
  document.getElementById('dk-pet-age').value = 'adult';
  document.getElementById('dk-pet-activity').value = 'normal';
  document.getElementById('dk-pet-notes').value = '';
  document.getElementById('dk-pet-photo-preview').innerHTML = `<i class="fa-solid fa-camera" style="font-size:1.2rem; margin-bottom:4px;"></i><span>Subir Foto</span>`;
  
  const modal = document.getElementById('desktop-purchase-modal');
  if (modal) {
    modal.classList.add('active');
  }
  
  showDkWizardStep(1);
};

window.closeDesktopWizard = function() {
  const modal = document.getElementById('desktop-purchase-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

function showDkWizardStep(step) {
  dkWizardCurrentStep = step;
  
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`desktop-step-${i}`);
    if (el) el.classList.remove('active');
  }
  
  const currentEl = document.getElementById(`desktop-step-${step}`);
  if (currentEl) currentEl.classList.add('active');
  
  const progressFill = document.getElementById('desktop-wizard-progress-fill');
  if (progressFill) {
    progressFill.style.width = `${(step / 6) * 100}%`;
  }
  
  const prevBtn = document.getElementById('dk-wizard-prev-btn');
  const nextBtn = document.getElementById('dk-wizard-next-btn');
  
  if (prevBtn) {
    if (step === 1 || step === 6) {
      prevBtn.style.visibility = 'hidden';
    } else {
      prevBtn.style.visibility = 'visible';
    }
  }
  
  if (nextBtn) {
    if (step === 5) {
      nextBtn.innerHTML = `Pagar Suscripción <i class="fa-solid fa-credit-card"></i>`;
      nextBtn.style.display = 'block';
    } else if (step === 6) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.innerHTML = `Siguiente <i class="fa-solid fa-arrow-right"></i>`;
      nextBtn.style.display = 'block';
    }
  }
  
  if (step === 2) {
    setupDkStep2();
  } else if (step === 3) {
    setupDkStep3();
  } else if (step === 5) {
    setupDkStep5();
  }
}

window.desktopWizardNextStep = async function() {
  if (dkWizardCurrentStep === 1) {
    const name = document.getElementById('dk-pet-name').value.trim();
    const breed = document.getElementById('dk-pet-breed').value.trim();
    const weight = parseFloat(document.getElementById('dk-pet-weight').value);
    const age = document.getElementById('dk-pet-age').value;
    const activity = document.getElementById('dk-pet-activity').value;
    const notes = document.getElementById('dk-pet-notes').value.trim();
    
    if (!name || !breed || isNaN(weight) || weight <= 0) {
      alert('Por favor, completa Nombre, Raza y Peso de tu mascota.');
      return;
    }
    
    dkPet.name = name;
    dkPet.breed = breed;
    dkPet.weight = weight;
    dkPet.age = age;
    dkPet.activity = activity;
    dkPet.notes = notes;
    dkPet.photo = dkPetPhotoBase64 || 'assets/logo.jpg';
    
    if (!dkPet.selectedRecipeId && appState.recipes.length > 0) {
      dkPet.selectedRecipeId = appState.recipes[0].id;
    }
    
    showDkWizardStep(2);
  } else if (dkWizardCurrentStep === 2) {
    showDkWizardStep(3);
  } else if (dkWizardCurrentStep === 3) {
    if (appState.customerToken) {
      showDkWizardStep(5);
    } else {
      showDkWizardStep(4);
    }
  } else if (dkWizardCurrentStep === 4) {
    alert('Por favor, inicia sesión o crea una cuenta para continuar.');
  } else if (dkWizardCurrentStep === 5) {
    await processDesktopWizardPayment();
  }
};

window.desktopWizardPrevStep = function() {
  if (dkWizardCurrentStep === 5 && appState.customerToken) {
    showDkWizardStep(3);
  } else {
    showDkWizardStep(dkWizardCurrentStep - 1);
  }
};

window.handleDesktopPetPhotoSelect = function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      dkPetPhotoBase64 = e.target.result;
      document.getElementById('dk-pet-photo-preview').innerHTML = `<img src="${dkPetPhotoBase64}" alt="Foto Mascota" style="width:100%; height:100%; object-fit:cover;">`;
    };
    reader.readAsDataURL(file);
  }
};

function setupDkStep2() {
  const selectedRecipe = appState.recipes.find(r => r.id === dkPet.selectedRecipeId) || appState.recipes[0] || DEFAULT_RECIPES[0];
  const dietType = selectedRecipe ? selectedRecipe.category : 'barf';
  const portion = calculatePortion(dkPet.weight, dkPet.age, dkPet.activity, dietType);
  dkPet.portionResults = portion;
  
  document.getElementById('dk-summary-pet-name').textContent = dkPet.name;
  document.getElementById('dk-summary-daily-grams').textContent = `${portion.dailyGrams}g/día`;
  document.getElementById('dk-summary-monthly-kg').textContent = `${portion.monthlyKg} kg/mes`;
  document.getElementById('dk-summary-diet-type').textContent = dietType === 'barf' ? 'BARF Cruda' : 'Cocida al Vapor';
  
  const grid = document.getElementById('dk-recipes-grid');
  if (grid) {
    grid.innerHTML = '';
    appState.recipes.forEach(r => {
      const isSelected = dkPet.selectedRecipeId === r.id;
      const card = document.createElement('div');
      card.className = `recipe-select-card ${isSelected ? 'selected' : ''}`;
      card.style.cursor = 'pointer';
      card.onclick = () => {
        dkPet.selectedRecipeId = r.id;
        dkPet.excludedIngredients = [];
        setupDkStep2();
      };
      card.innerHTML = `
        <div style="font-size: 1.5rem; margin-bottom: 4px;">${r.icon}</div>
        <h4 style="margin:4px 0; font-size:0.9rem; font-weight:700;">${r.name}</h4>
        <span style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">$${r.price.toLocaleString('es-CL')}/kg</span>
      `;
      grid.appendChild(card);
    });
  }
  
  const exclusionsContainer = document.getElementById('dk-exclusions-list');
  if (exclusionsContainer) {
    exclusionsContainer.innerHTML = '';
    const ingredients = selectedRecipe.ingredientsArray || selectedRecipe.ingredients.split(', ');
    ingredients.forEach((ing, i) => {
      const checkboxId = `dk-ing-${i}`;
      const isExcluded = dkPet.excludedIngredients.includes(ing);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${!isExcluded ? 'checked' : ''} onchange="toggleDkIngredient('${ing}', this.checked)">
        <label for="${checkboxId}" class="pill-label base-ing" style="padding:4px 8px; font-size:0.75rem;">
          <i class="fa-solid fa-check"></i> ${ing}
        </label>
      `;
      exclusionsContainer.appendChild(wrapper.firstElementChild);
      exclusionsContainer.appendChild(wrapper.lastElementChild);
    });
  }
  
  const superfoodsContainer = document.getElementById('dk-superfoods-list');
  if (superfoodsContainer) {
    superfoodsContainer.innerHTML = '';
    SUPERALIMENTOS.forEach(sup => {
      const checkboxId = `dk-sup-${sup.id}`;
      const isAdded = dkPet.addedSuperfoods.includes(sup.id);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${isAdded ? 'checked' : ''} onchange="toggleDkSuperfood('${sup.id}', this.checked)">
        <label for="${checkboxId}" class="pill-label super-ing" style="padding:4px 8px; font-size:0.75rem;">
          <i class="fa-solid fa-plus"></i> ${sup.icon} ${sup.name}
        </label>
      `;
      superfoodsContainer.appendChild(wrapper.firstElementChild);
      superfoodsContainer.appendChild(wrapper.lastElementChild);
    });
  }
  
  const basePrice = selectedRecipe.price;
  const dietSubtotal = Math.round(portion.monthlyKg * basePrice);
  const superfoodExtra = dkPet.addedSuperfoods.length * 1500;
  dkPet.totalPrice = dietSubtotal + superfoodExtra;
}

window.toggleDkIngredient = function(ing, isChecked) {
  if (!isChecked) {
    if (!dkPet.excludedIngredients.includes(ing)) {
      dkPet.excludedIngredients.push(ing);
    }
  } else {
    dkPet.excludedIngredients = dkPet.excludedIngredients.filter(x => x !== ing);
  }
};

window.toggleDkSuperfood = function(supId, isChecked) {
  if (isChecked) {
    if (!dkPet.addedSuperfoods.includes(supId)) {
      dkPet.addedSuperfoods.push(supId);
    }
  } else {
    dkPet.addedSuperfoods = dkPet.addedSuperfoods.filter(x => x !== supId);
  }
};

function setupDkStep3() {
  const container = document.getElementById('dk-snacks-list-container');
  if (container) {
    container.innerHTML = '';
    appState.snacks.forEach(s => {
      const qty = dkSnacksCart[s.id] || 0;
      const item = document.createElement('div');
      item.className = 'mobile-snack-item';
      item.style.background = '#fff';
      item.style.border = '1px solid rgba(44, 26, 14, 0.08)';
      item.style.padding = '1rem';
      item.style.borderRadius = 'var(--radius-md)';
      item.innerHTML = `
        <div class="mobile-snack-icon">${s.icon}</div>
        <div class="mobile-snack-info">
          <h4 style="margin:0 0 4px 0; font-size:0.95rem; font-weight:700;">${s.name}</h4>
          <p style="margin:0; font-size:0.75rem; color:var(--text-muted);">${s.ingredients} • <strong>$${s.price.toLocaleString('es-CL')} / ${s.unit}</strong></p>
        </div>
        <div class="mobile-snack-qty">
          <button class="qty-btn" onclick="updateDkSnackQty('${s.id}', -1)">-</button>
          <span style="font-weight:700; width: 14px; text-align: center;">${qty}</span>
          <button class="qty-btn" onclick="updateDkSnackQty('${s.id}', 1)">+</button>
        </div>
      `;
      container.appendChild(item);
    });
  }
}

window.updateDkSnackQty = function(snackId, change) {
  const qty = dkSnacksCart[snackId] || 0;
  let newQty = qty + change;
  if (newQty < 0) newQty = 0;
  if (newQty === 0) {
    delete dkSnacksCart[snackId];
  } else {
    dkSnacksCart[snackId] = newQty;
  }
  setupDkStep3();
};

function setupDkStep5() {
  let snacksTotal = 0;
  for (const id in dkSnacksCart) {
    const s = appState.snacks.find(x => x.id === id);
    if (s) {
      snacksTotal += s.price * dkSnacksCart[id];
    }
  }
  
  document.getElementById('dk-pay-pet-name').textContent = dkPet.name;
  document.getElementById('dk-pay-recipe-price').textContent = `$${dkPet.totalPrice.toLocaleString('es-CL')}`;
  document.getElementById('dk-pay-snacks-price').textContent = `$${snacksTotal.toLocaleString('es-CL')}`;
  document.getElementById('dk-pay-total-price').textContent = `$${(dkPet.totalPrice + snacksTotal + 3500).toLocaleString('es-CL')}`;
  
  document.getElementById('dk-pay-cardholder').value = '';
  document.getElementById('dk-pay-cardnumber').value = '';
  document.getElementById('dk-pay-expiry').value = '';
  document.getElementById('dk-pay-cvv').value = '';
  
  document.getElementById('dk-card-name-preview').textContent = 'Nombre Completo';
  document.getElementById('dk-card-num-preview').textContent = '•••• •••• •••• ••••';
  document.getElementById('dk-card-exp-preview').textContent = 'MM/AA';
}

window.updateDkCardPreview = function(field, value) {
  if (field === 'name') {
    document.getElementById('dk-card-name-preview').textContent = value.trim() || 'Nombre Completo';
  } else if (field === 'number') {
    let cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      formatted.push(cleaned.substring(i, i + 4));
    }
    const finalVal = formatted.join(' ');
    document.getElementById('dk-pay-cardnumber').value = finalVal;
    document.getElementById('dk-card-num-preview').textContent = finalVal || '•••• •••• •••• ••••';
  } else if (field === 'expiry') {
    let cleaned = value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (cleaned.length >= 2) {
      cleaned = cleaned.substring(0,2) + '/' + cleaned.substring(2,4);
    }
    document.getElementById('dk-pay-expiry').value = cleaned;
    document.getElementById('dk-card-exp-preview').textContent = cleaned || 'MM/AA';
  }
};

async function processDesktopWizardPayment() {
  const address = document.getElementById('dk-pay-address').value.trim();
  const holder = document.getElementById('dk-pay-cardholder').value.trim();
  const num = document.getElementById('dk-pay-cardnumber').value.trim();
  const expiry = document.getElementById('dk-pay-expiry').value.trim();
  const cvv = document.getElementById('dk-pay-cvv').value.trim();
  
  if (!address || !holder || !num || !expiry || !cvv) {
    alert('Por favor, completa todos los campos de despacho y pago.');
    return;
  }
  
  if (num.replace(/\s/g, '').length < 16) {
    alert('El número de tarjeta de crédito es incorrecto.');
    return;
  }
  
  const nextBtn = document.getElementById('dk-wizard-next-btn');
  const prevBtn = document.getElementById('dk-wizard-prev-btn');
  nextBtn.disabled = true;
  prevBtn.disabled = true;
  nextBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando...`;
  
  const selectedRecipe = appState.recipes.find(r => r.id === dkPet.selectedRecipeId) || appState.recipes[0];
  const orderId = `OC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const snacksArr = [];
  let snacksTotal = 0;
  for (const id in dkSnacksCart) {
    const s = appState.snacks.find(x => x.id === id);
    if (s) {
      const qty = dkSnacksCart[id];
      snacksArr.push(`${s.name} (x${qty})`);
      snacksTotal += s.price * qty;
    }
  }
  const snacksText = snacksArr.join(', ') || 'Ninguno';
  const totalVal = dkPet.totalPrice + snacksTotal + 3500;
  
  const petData = {
    id: dkPet.id,
    name: dkPet.name,
    breed: dkPet.breed,
    weight: dkPet.weight,
    age: dkPet.age,
    activity: dkPet.activity,
    notes: dkPet.notes,
    photo: dkPet.photo,
    subscription_paid: true,
    selected_recipe_id: dkPet.selectedRecipeId,
    excluded_ingredients: dkPet.excludedIngredients,
    added_superfoods: dkPet.addedSuperfoods,
    custom_instructions: dkPet.customInstructions,
    address: address
  };
  
  const orderData = {
    order_id: orderId,
    date: new Date().toLocaleDateString('es-CL'),
    pet_name: dkPet.name,
    pet_breed: `${dkPet.name} (${dkPet.weight}kg, ${dkPet.breed})`,
    pet_weight: dkPet.weight,
    pet_photo: dkPet.photo,
    recipe_name: `${selectedRecipe.name}${dkPet.addedSuperfoods.length ? ' [Suplementos: ' + dkPet.addedSuperfoods.join(', ') + ']' : ''}`,
    daily_grams: dkPet.portionResults.dailyGrams,
    monthly_kg: dkPet.portionResults.monthlyKg,
    snacks: snacksText,
    total_price: totalVal,
    address: address,
    paid_status: 'Verificado'
  };
  
  try {
    const headers = { "Content-Type": "application/json" };
    if (appState.customerToken) {
      headers["Authorization"] = `Bearer ${appState.customerToken}`;
    }
    
    const petUrl = appState.customerToken ? `${API_BASE_URL}/api/customer/pets` : `${API_BASE_URL}/api/pets`;
    const petRes = await fetch(petUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(petData)
    });
    if (!petRes.ok) throw new Error("Error al registrar la mascota en el servidor");
    const petResponseJson = await petRes.json();
    const savedPet = mapPetFromAPI(petResponseJson.pet);
    
    const orderRes = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(orderData)
    });
    if (!orderRes.ok) throw new Error("Error al registrar la orden en el servidor");
    
    const idx = appState.pets.findIndex(p => p.id === savedPet.id);
    if (idx !== -1) {
      appState.pets[idx] = savedPet;
    } else {
      appState.pets.push(savedPet);
    }
    
    appState.activePetIdDashboard = savedPet.id;
    saveStateToStorage();
    
    document.getElementById('dk-rec-pet-name').textContent = dkPet.name;
    document.getElementById('dk-rec-order-id').textContent = orderId;
    document.getElementById('dk-rec-date').textContent = orderData.date;
    document.getElementById('dk-rec-pet-detail').textContent = `${dkPet.name} (${dkPet.weight} kg, ${dkPet.breed})`;
    document.getElementById('dk-rec-recipe-detail').textContent = selectedRecipe.name;
    document.getElementById('dk-rec-snacks-detail').textContent = snacksText;
    document.getElementById('dk-rec-address-detail').textContent = address;
    document.getElementById('dk-rec-total-detail').textContent = `$${totalVal.toLocaleString('es-CL')}`;
    
    nextBtn.disabled = false;
    prevBtn.disabled = false;
    
    showDkWizardStep(6);
  } catch (err) {
    alert("Error al procesar el pago: " + err.message);
    nextBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.innerHTML = `Pagar Suscripción <i class="fa-solid fa-credit-card"></i>`;
  }
}

// Controladores de Autenticación de Clientes (Desktop y Mobile)
window.toggleDesktopAuthView = function(isRegister) {
  const loginBox = document.getElementById('dk-auth-login-box');
  const registerBox = document.getElementById('dk-auth-register-box');
  if (isRegister) {
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
  } else {
    loginBox.style.display = 'block';
    registerBox.style.display = 'none';
  }
};

window.submitCustomerAuth = async function(type) {
  let url = '';
  let payload = {};
  
  if (type === 'login') {
    const email = document.getElementById('dk-auth-email').value.trim();
    const password = document.getElementById('dk-auth-pass').value;
    if (!email || !password) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    url = `${API_BASE_URL}/api/customer/login`;
    payload = { email, password, provider: 'email' };
  } else {
    const name = document.getElementById('dk-auth-reg-name').value.trim();
    const email = document.getElementById('dk-auth-reg-email').value.trim();
    const password = document.getElementById('dk-auth-reg-pass').value;
    if (!name || !email || !password) {
      alert('Por favor, ingresa tu nombre, correo y contraseña.');
      return;
    }
    url = `${API_BASE_URL}/api/customer/register`;
    payload = { name, email, password, provider: 'email' };
  }
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Error en la autenticación');
    }
    
    const data = await res.json();
    setCustomerSession(data.token, data.name, data.email);
    
    await syncCustomerPets();
    showDkWizardStep(5);
  } catch (err) {
    alert("Error de autenticación: " + err.message);
  }
};

window.loginCustomerSocial = async function(provider) {
  const email = provider === 'google' ? 'usuario.google@gmail.com' : 'usuario.apple@icloud.com';
  const name = provider === 'google' ? 'Google User' : 'Apple User';
  
  const url = `${API_BASE_URL}/api/customer/login`;
  const payload = {
    email: email,
    password: '',
    provider: provider
  };
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Error en la autenticación social');
    }
    
    const data = await res.json();
    setCustomerSession(data.token, data.name, data.email);
    
    await syncCustomerPets();
    showDkWizardStep(5);
  } catch (err) {
    alert("Error de inicio social: " + err.message);
  }
};

window.logoutCustomer = function() {
  if (confirm('¿Deseas cerrar sesión?')) {
    appState.customerToken = null;
    localStorage.removeItem('oc_customer_token');
    localStorage.removeItem('oc_customer_name');
    localStorage.removeItem('oc_customer_email');
    
    const badge = document.getElementById('customer-header-badge');
    if (badge) badge.style.display = 'none';
    
    appState.pets = [];
    appState.currentPetId = null;
    appState.activePetIdDashboard = null;
    appState.snacksCart = {};
    saveStateToStorage();
    
    loadInitialDataFromAPI();
  }
};

function setCustomerSession(token, name, email) {
  appState.customerToken = token;
  localStorage.setItem('oc_customer_token', token);
  localStorage.setItem('oc_customer_name', name);
  localStorage.setItem('oc_customer_email', email);
  
  const badge = document.getElementById('customer-header-badge');
  const badgeName = document.getElementById('customer-header-name');
  if (badge && badgeName) {
    badgeName.textContent = name;
    badge.style.display = 'flex';
  }
}

async function syncCustomerPets() {
  if (!appState.customerToken) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/customer/pets`, {
      headers: { "Authorization": `Bearer ${appState.customerToken}` }
    });
    
    if (!res.ok) throw new Error("No se pudieron obtener las mascotas del servidor");
    const serverPetsJson = await res.json();
    const serverPets = serverPetsJson.map(mapPetFromAPI);
    const serverPetsMap = new Map(serverPets.map(p => [p.id, p]));
    
    for (const pet of appState.pets) {
      if (!serverPetsMap.has(pet.id)) {
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
          const postRes = await fetch(`${API_BASE_URL}/api/customer/pets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${appState.customerToken}`
            },
            body: JSON.stringify(petData)
          });
          if (postRes.ok) {
            const data = await postRes.json();
            const saved = mapPetFromAPI(data.pet);
            serverPets.push(saved);
          }
        } catch (e) {
          console.warn("Error uploading local pet during sync:", e);
        }
      } else {
        const serverPet = serverPetsMap.get(pet.id);
        Object.assign(pet, serverPet);
      }
    }
    
    const localPetIds = new Set(appState.pets.map(p => p.id));
    serverPets.forEach(p => {
      if (!localPetIds.has(p.id)) {
        appState.pets.push(p);
      }
    });
    
    saveStateToStorage();
    renderMobileWelcomeScreen();
  } catch (err) {
    console.warn("Fallo al sincronizar mascotas:", err);
  }
}

// Controladores Mobile Auth
window.toggleMobileAuthView = function(isRegister) {
  const loginFields = document.getElementById('mobile-login-fields');
  const registerFields = document.getElementById('mobile-register-fields');
  const title = document.getElementById('mobile-auth-title');
  if (isRegister) {
    loginFields.style.display = 'none';
    registerFields.style.display = 'block';
    if (title) title.textContent = 'Crear Cuenta';
  } else {
    loginFields.style.display = 'block';
    registerFields.style.display = 'none';
    if (title) title.textContent = 'Inicia Sesión';
  }
};

window.submitCustomerAuthMobile = async function(type) {
  let url = '';
  let payload = {};
  
  if (type === 'login') {
    const email = document.getElementById('mb-auth-email').value.trim();
    const password = document.getElementById('mb-auth-pass').value;
    if (!email || !password) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    url = `${API_BASE_URL}/api/customer/login`;
    payload = { email, password, provider: 'email' };
  } else {
    const name = document.getElementById('mb-auth-reg-name').value.trim();
    const email = document.getElementById('mb-auth-reg-email').value.trim();
    const password = document.getElementById('mb-auth-reg-pass').value;
    if (!name || !email || !password) {
      alert('Por favor, ingresa tu nombre, correo y contraseña.');
      return;
    }
    url = `${API_BASE_URL}/api/customer/register`;
    payload = { name, email, password, provider: 'email' };
  }
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Error en la autenticación');
    }
    
    const data = await res.json();
    setCustomerSession(data.token, data.name, data.email);
    
    await syncCustomerPets();
    changeMobileView('checkout');
  } catch (err) {
    alert("Error de autenticación: " + err.message);
  }
};

window.loginCustomerSocialMobile = async function(provider) {
  const email = provider === 'google' ? 'usuario.google@gmail.com' : 'usuario.apple@icloud.com';
  const name = provider === 'google' ? 'Google User' : 'Apple User';
  
  const url = `${API_BASE_URL}/api/customer/login`;
  const payload = {
    email: email,
    password: '',
    provider: provider
  };
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Error en la autenticación social');
    }
    
    const data = await res.json();
    setCustomerSession(data.token, data.name, data.email);
    
    await syncCustomerPets();
    changeMobileView('checkout');
  } catch (err) {
    alert("Error de inicio social: " + err.message);
  }
};

window.resetToWelcome = function() {
  if (isMobileDevice()) {
    changeMobileView('welcome');
  } else {
    switchView('web');
  }
};

// Detección de Dispositivo y Responsividad
window.isMobileDevice = function() {
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mobileWidth = window.innerWidth <= 768;
  return mobileUA || mobileWidth;
};

window.configureDeviceMode = function() {
  if (isMobileDevice()) {
    document.body.classList.add('mobile-native-mode');
    switchView('mobile');
    changeMobileView('welcome');
  } else {
    document.body.classList.remove('mobile-native-mode');
    if (appState.activeView === 'mobile') {
      switchView('mobile');
    } else {
      switchView('web');
    }
  }
};

// ----------------------------------------------------
// 11. INICIALIZACIÓN DE LA APLICACIÓN
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadInitialDataFromAPI();
  configureDeviceMode();
});

window.addEventListener('resize', () => {
  configureDeviceMode();
});