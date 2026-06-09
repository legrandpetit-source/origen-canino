// ----------------------------------------------------
// 1. CONFIGURACIÓN DEL BACKEND, BASE DE DATOS Y ESTADO
// ----------------------------------------------------

const API_BASE_URL = (window.location.protocol === "file:" || window.location.port || window.location.hostname.includes("github.io")) 
  ? "http://localhost:8000" 
  : "";

// Helper mapping functions to adapt SQL model names (snake_case) to Frontend names (camelCase)
function mapPetFromAPI(p) {
  if (!p) return null;
  return {
    ...p,
    subscriptionPaid: p.subscription_paid,
    selectedRecipeId: p.selected_recipe_id,
    selectedRecipes: p.selected_recipes || {},
    excludedIngredients: p.excluded_ingredients || [],
    addedSuperfoods: p.added_superfoods || [],
    addedVegetablesFruits: p.added_vegetables_fruits || [],
    customInstructions: p.custom_instructions || "",
    deliveryPeriod: p.delivery_period || p.deliveryPeriod || 30,
    orderDate: p.order_date || p.orderDate || ""
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
    ingredients: 'Hueso de pollo triturado, carne magra de pollo, hígado de pollo, vísceras trituradas, espinaca fresca, zanahoria picada, betarraga.',
    ingredientsArray: ['Hueso de pollo triturado', 'Carne magra de pollo', 'Hígado de pollo', 'Vísceras trituradas', 'Espinaca fresca', 'Zanahoria picada', 'betarraga']
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

const VERDURAS_FRUTAS = [
  { id: 'vf-betarraga', name: 'Betarraga', icon: '🍠', price: 1500 },
  { id: 'vf-manzana', name: 'Manzana', icon: '🍎', price: 1500 },
  { id: 'vf-zapallo', name: 'Zapallo Camote', icon: '🎃', price: 1500 },
  { id: 'vf-arandanos', name: 'Arándanos', icon: '🫐', price: 1500 },
  { id: 'vf-zanahoria', name: 'Zanahoria', icon: '🥕', price: 1500 },
  { id: 'vf-espinaca', name: 'Espinaca', icon: '🥬', price: 1500 }
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
  superfoods: SUPERALIMENTOS,
  vegetablesFruits: VERDURAS_FRUTAS,
  ingredientsInfo: [],
  
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
    
    if (data.additionals) {
      appState.superfoods = data.additionals.filter(a => a.category === 'superfood');
      appState.vegetablesFruits = data.additionals.filter(a => a.category === 'vegfruit');
    }
    appState.ingredientsInfo = data.ingredients_info || [];
    
    // CHECK FOR CUSTOMER TOKEN
    const token = localStorage.getItem('oc_customer_token');
    if (token) {
      appState.customerToken = token;
      const name = localStorage.getItem('oc_customer_name') || 'Cliente';
      appState.customerName = name;
      appState.customerEmail = localStorage.getItem('oc_customer_email') || '';
      appState.customerPhone = localStorage.getItem('oc_customer_phone') || '';
      appState.customerAddress = localStorage.getItem('oc_customer_address') || '';
      
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
    appState.superfoods = SUPERALIMENTOS;
    appState.vegetablesFruits = VERDURAS_FRUTAS;
    appState.ingredientsInfo = [];
    
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
  
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  // Toggle app-header visibility in mobile native mode using class
  if (viewName === 'web') {
    document.body.classList.remove('hide-header-on-mobile');
    renderWebProducts();
    renderWebTestimonials();
    renderWebFaqs();
  } else {
    document.body.classList.add('hide-header-on-mobile');
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
      const pet = appState.pets.find(p => p.id === appState.currentPetId);
      if (pet) {
        const selectPeriod = document.getElementById('calc-delivery-period');
        if (selectPeriod) {
          selectPeriod.value = pet.deliveryPeriod || 30;
        }
      }
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
      const phoneEl = document.getElementById('mb-auth-reg-phone');
      if (phoneEl) phoneEl.value = '';
      const streetEl = document.getElementById('mb-auth-reg-street');
      if (streetEl) streetEl.value = '';
      const commEl = document.getElementById('mb-auth-reg-commune');
      if (commEl) commEl.value = '';
      const regEl = document.getElementById('mb-auth-reg-region');
      if (regEl) regEl.value = '';
      toggleMobileAuthView(false);
    } else if (viewName === 'social-profile-setup') {
      const nameEl = document.getElementById('mb-social-name');
      const phoneEl = document.getElementById('mb-social-phone');
      const streetEl = document.getElementById('mb-social-street');
      const communeEl = document.getElementById('mb-social-commune');
      const regionEl = document.getElementById('mb-social-region');
      const cancelBtn = document.getElementById('mb-social-back-btn');
      const submitBtn = document.querySelector('#mobile-social-profile-setup button.mobile-btn-primary');
      const titleEl = document.querySelector('#mobile-social-profile-setup .mobile-title');
      const subtitleEl = document.querySelector('#mobile-social-profile-setup .mobile-subtitle');

      if (!appState.editingProfileFromDashboard) {
        if (titleEl) titleEl.textContent = 'Datos de Despacho';
        if (subtitleEl) subtitleEl.textContent = 'Por favor, completa tus datos de contacto y entrega para continuar.';
        if (submitBtn) submitBtn.textContent = 'Continuar';
        if (cancelBtn) cancelBtn.style.display = 'none';

        if (nameEl && appState.customerName) {
          if (!appState.customerName.includes('.google') && !appState.customerName.includes('.apple') && !appState.customerName.includes('@')) {
            nameEl.value = appState.customerName;
          } else {
            nameEl.value = '';
          }
        }
        if (phoneEl) phoneEl.value = '';
        if (streetEl) streetEl.value = '';
        if (communeEl) communeEl.value = '';
        if (regionEl) regionEl.value = '';
      } else {
        if (titleEl) titleEl.textContent = 'Editar Datos de Cuenta';
        if (subtitleEl) subtitleEl.textContent = 'Modifica tu nombre, teléfono y dirección de despacho.';
        if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
        if (cancelBtn) cancelBtn.style.display = 'block';

        if (nameEl) nameEl.value = appState.customerName || '';
        if (phoneEl) phoneEl.value = appState.customerPhone || '';

        const fullAddress = appState.customerAddress || '';
        const parts = fullAddress.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          if (streetEl) streetEl.value = parts[0];
          if (communeEl) communeEl.value = parts[1];
          if (regionEl) regionEl.value = parts[2];
        } else {
          if (streetEl) streetEl.value = fullAddress;
          if (communeEl) communeEl.value = '';
          if (regionEl) regionEl.value = '';
        }
      }
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

function calculatePortion(weight, stage, activity, dietType, days = 30) {
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
  const monthlyKg = Math.ceil((dailyGrams * days) / 1000);
  
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
            Comprar / Personalizar
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

  const editProfileBtn = document.getElementById('mb-welcome-edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.style.display = appState.customerToken ? 'block' : 'none';
  }

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
  if (!appState.customerToken) {
    appState.pendingWizardInit = true;
    changeMobileView('auth');
    return;
  }
  
  if (!appState.customerPhone || !appState.customerAddress) {
    appState.pendingWizardInit = true;
    changeMobileView('social-profile-setup');
    return;
  }

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
  const paidPets = appState.pets.filter(p => p.subscriptionPaid);
  if (paidPets.length > 0) {
    if (!appState.activePetIdDashboard) {
      appState.activePetIdDashboard = paidPets[0].id;
    }
    changeMobileView('pet-dashboard');
  } else {
    changeMobileView('welcome');
  }
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

  // Validar que no exista otra mascota con el mismo nombre para el usuario
  const isDuplicateName = appState.pets.some(p => 
    p.id !== appState.currentPetId && 
    p.name.trim().toLowerCase() === name.toLowerCase()
  );
  if (isDuplicateName) {
    alert(`Ya registraste una mascota llamada "${name}". Por favor, usa un nombre diferente.`);
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
    selected_recipes: petIndex !== -1 ? (appState.pets[petIndex].selectedRecipes || {}) : {},
    excluded_ingredients: petIndex !== -1 ? (appState.pets[petIndex].excludedIngredients || []) : [],
    added_superfoods: petIndex !== -1 ? (appState.pets[petIndex].addedSuperfoods || []) : [],
    added_vegetables_fruits: petIndex !== -1 ? (appState.pets[petIndex].addedVegetablesFruits || []) : [],
    custom_instructions: petIndex !== -1 ? (appState.pets[petIndex].customInstructions || '') : '',
    delivery_period: petIndex !== -1 ? (appState.pets[petIndex].deliveryPeriod || 30) : 30,
    order_date: petIndex !== -1 ? (appState.pets[petIndex].orderDate || '') : ''
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
  } catch (err) {
    console.warn("Fallo al guardar mascota en el servidor (servidor desconectado), guardando localmente:", err);
    const fallbackPet = {
      id: petData.id,
      name: petData.name,
      breed: petData.breed,
      weight: petData.weight,
      age: petData.age,
      activity: petData.activity,
      notes: petData.notes,
      photo: petData.photo,
      subscriptionPaid: petData.subscription_paid,
      selectedRecipeId: petData.selected_recipe_id,
      selectedRecipes: petData.selected_recipes,
      excludedIngredients: petData.excluded_ingredients,
      addedSuperfoods: petData.added_superfoods,
      addedVegetablesFruits: petData.added_vegetables_fruits,
      customInstructions: petData.custom_instructions,
      deliveryPeriod: petData.delivery_period,
      orderDate: petData.order_date || ''
    };
    if (petIndex !== -1) {
      appState.pets[petIndex] = fallbackPet;
    } else {
      appState.pets.push(fallbackPet);
    }
  }
  
  saveStateToStorage();
  changeMobileView('calculator');
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
  
  pet.selectedRecipes = pet.selectedRecipes || {};
  let totalSelected = 0;
  for (const rid in pet.selectedRecipes) {
    totalSelected += pet.selectedRecipes[rid] || 0;
  }

  const results = pet.portionResults || { monthlyKg: 0 };
  const totalRequired = results.monthlyKg;

  const progressPercent = totalRequired > 0 ? Math.min(100, (totalSelected / totalRequired) * 100) : 0;
  const progressFill = document.getElementById('weight-progress-bar');
  const progressLabel = document.getElementById('weight-progress-label');
  
  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
    progressFill.className = 'weight-progress-bar-fill';
    if (totalSelected === totalRequired) {
      progressFill.classList.add('completed');
    } else if (totalSelected > totalRequired) {
      progressFill.classList.add('exceeded');
    }
  }
  if (progressLabel) {
    if (totalSelected === totalRequired) {
      progressLabel.innerHTML = `${totalSelected} / ${totalRequired} kg <span style="color:#55722e; margin-left: 5px; font-weight:700;"><i class="fa-solid fa-circle-check"></i> ¡Completado!</span>`;
    } else if (totalSelected > totalRequired) {
      progressLabel.innerHTML = `${totalSelected} / ${totalRequired} kg <span style="color:var(--accent-red); margin-left: 5px; font-weight:700;"><i class="fa-solid fa-triangle-exclamation"></i> Exceso</span>`;
    } else {
      progressLabel.textContent = `${totalSelected} / ${totalRequired} kg`;
    }
  }

  const confirmBtn = document.querySelector('#calc-checkout-card button.mobile-btn-primary');
  if (confirmBtn) {
    if (totalSelected !== totalRequired) {
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = '0.5';
      confirmBtn.style.cursor = 'not-allowed';
      confirmBtn.title = 'Debes completar exactamente el total de kilos requeridos.';
    } else {
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = '1';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.title = '';
    }
  }

  appState.recipes.forEach(r => {
    const qty = pet.selectedRecipes[r.id] || 0;
    const card = document.createElement('div');
    card.className = `recipe-select-card ${qty > 0 ? 'selected' : ''}`;
    
    card.innerHTML = `
      <div style="font-size: 1.4rem; margin-bottom: 2px;">${r.icon}</div>
      <h4>${r.name}</h4>
      <span style="display:block; margin-bottom: 0.4rem;">$${r.price.toLocaleString('es-CL')}/kg</span>
      <div class="recipe-qty-selector" onclick="event.stopPropagation()">
        <button class="recipe-qty-btn" onclick="updateRecipeQty('${r.id}', -1)" ${qty <= 0 ? 'disabled' : ''}>-</button>
        <span class="recipe-qty-val">${qty} kg</span>
        <button class="recipe-qty-btn" onclick="updateRecipeQty('${r.id}', 1)" ${totalSelected >= totalRequired ? 'disabled' : ''}>+</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.updateRecipeQty = function(recipeId, change) {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.selectedRecipes = pet.selectedRecipes || {};
  const currentQty = pet.selectedRecipes[recipeId] || 0;
  let newQty = currentQty + change;
  if (newQty < 0) newQty = 0;

  let totalSelected = 0;
  for (const rid in pet.selectedRecipes) {
    if (rid !== recipeId) {
      totalSelected += pet.selectedRecipes[rid] || 0;
    }
  }
  
  const results = pet.portionResults || { monthlyKg: 0 };
  const totalRequired = results.monthlyKg;

  if (change > 0 && totalSelected + newQty > totalRequired) {
    newQty = totalRequired - totalSelected;
  }

  if (newQty === 0) {
    delete pet.selectedRecipes[recipeId];
  } else {
    pet.selectedRecipes[recipeId] = newQty;
  }

  const activeRecipes = Object.keys(pet.selectedRecipes).filter(rid => pet.selectedRecipes[rid] > 0);
  if (activeRecipes.length > 0) {
    pet.selectedRecipeId = activeRecipes[0];
  } else {
    pet.selectedRecipeId = null;
  }

  saveStateToStorage();
  renderMobileRecipeSelector();
  updatePortionCalculatorUI();
};

function updatePortionCalculatorUI() {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.selectedRecipes = pet.selectedRecipes || {};

  const selectPeriod = document.getElementById('calc-delivery-period');
  const deliveryPeriodVal = selectPeriod ? (parseInt(selectPeriod.value) || 30) : 30;
  pet.deliveryPeriod = deliveryPeriodVal;

  let selectedRecipe = null;
  const activeRecipeIds = Object.keys(pet.selectedRecipes).filter(rid => pet.selectedRecipes[rid] > 0);
  if (activeRecipeIds.length > 0) {
    selectedRecipe = appState.recipes.find(r => r.id === activeRecipeIds[0]);
  }
  if (!selectedRecipe && appState.recipes.length > 0) {
    selectedRecipe = appState.recipes[0];
  }
  const dietType = selectedRecipe ? selectedRecipe.category : 'barf';

  document.getElementById('calc-pet-avatar').src = pet.photo;
  document.getElementById('calc-pet-name').textContent = pet.name;
  document.getElementById('calc-pet-details').textContent = `${pet.breed} • ${pet.weight} kg`;
  document.getElementById('custom-instructions').value = pet.customInstructions || '';

  const results = calculatePortion(pet.weight, pet.age, pet.activity, dietType, deliveryPeriodVal);
  pet.portionResults = results;

  document.getElementById('calc-daily-total').textContent = `${results.dailyGrams}g`;
  document.getElementById('calc-monthly-weight').textContent = results.monthlyKg;
  document.getElementById('calc-delivery-label').textContent = deliveryPeriodVal === 15 ? 'Cada 15 días' : 'Cada 30 días';

  let totalSelected = 0;
  for (const rid in pet.selectedRecipes) {
    totalSelected += pet.selectedRecipes[rid] || 0;
  }
  if (totalSelected !== results.monthlyKg) {
    pet.selectedRecipes = {};
    const firstRecipeId = selectedRecipe ? selectedRecipe.id : (appState.recipes[0]?.id || 'b-pollo');
    pet.selectedRecipes[firstRecipeId] = results.monthlyKg;
    pet.selectedRecipeId = firstRecipeId;
  }

  const labelEl = document.getElementById('calc-superfoods-label');
  if (labelEl) {
    labelEl.textContent = deliveryPeriodVal === 15 ? 'Añadir Superalimentos (+$750 c/u por quincena):' : 'Añadir Superalimentos (+$1.500 c/u al mes):';
  }
  const labelVfEl = document.getElementById('calc-vegfruits-label');
  if (labelVfEl) {
    labelVfEl.textContent = deliveryPeriodVal === 15 ? 'Añadir Verduras o Frutas Adicionales (+$750 c/u por quincena):' : 'Añadir Verduras o Frutas Adicionales (+$1.500 c/u al mes):';
  }
  
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

  renderInteractiveIngredients(pet, selectedRecipe || DEFAULT_RECIPES[0]);
}

function renderInteractiveIngredients(pet, recipe) {
  const ingContainer = document.getElementById('calc-ingredients-container');
  const vfContainer = document.getElementById('calc-vegfruits-container');
  const supContainer = document.getElementById('calc-superfoods-container');
  if (!ingContainer || !supContainer) return;

  ingContainer.innerHTML = '';
  if (vfContainer) vfContainer.innerHTML = '';
  supContainer.innerHTML = '';

  let ingredients = [];
  const activeRecipeIds = Object.keys(pet.selectedRecipes || {}).filter(rid => pet.selectedRecipes[rid] > 0);
  activeRecipeIds.forEach(rid => {
    const r = appState.recipes.find(rec => rec.id === rid);
    if (r) {
      let rIngs = r.ingredientsArray || [];
      if (rIngs.length === 0 && r.ingredients) {
        rIngs = r.ingredients.split(',').map(i => i.trim().replace(/\.$/, '')).filter(Boolean);
      } else {
        rIngs = rIngs.map(i => i.trim().replace(/\.$/, '')).filter(Boolean);
      }
      rIngs.forEach(ing => {
        if (!ingredients.includes(ing)) {
          ingredients.push(ing);
        }
      });
    }
  });

  if (ingredients.length === 0) {
    let fallbackIngs = recipe.ingredientsArray || [];
    if (fallbackIngs.length === 0 && recipe.ingredients) {
      fallbackIngs = recipe.ingredients.split(',').map(i => i.trim().replace(/\.$/, '')).filter(Boolean);
    }
    ingredients = fallbackIngs.map(i => i.trim().replace(/\.$/, '')).filter(Boolean);
  }

  ingredients.forEach((ing, i) => {
    const isExcluded = pet.excludedIngredients.includes(ing);
    const checkboxId = `ing-${i}`;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${!isExcluded ? 'checked' : ''} onchange="toggleIngredient('${ing}', this.checked)">
      <label for="${checkboxId}" class="pill-label base-ing"
             onmouseenter="showIngredientTooltip(event, 'base', '${ing}')"
             onmousemove="moveIngredientTooltip(event)"
             onmouseleave="hideIngredientTooltip()">
        <i class="fa-solid fa-check"></i> ${ing}
      </label>
    `;
    ingContainer.appendChild(wrapper.firstElementChild);
    ingContainer.appendChild(wrapper.lastElementChild);
  });

  // Render optional vegetables and fruits
  if (vfContainer) {
    const activeVf = pet.addedVegetablesFruits || [];
    (appState.vegetablesFruits || VERDURAS_FRUTAS).forEach((vf) => {
      const isAdded = activeVf.includes(vf.id);
      const checkboxId = `vf-${vf.id}`;

      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${isAdded ? 'checked' : ''} onchange="toggleVegetableFruit('${vf.id}', this.checked)">
        <label for="${checkboxId}" class="pill-label veg-fruit-ing"
               onmouseenter="showIngredientTooltip(event, 'additional', '${vf.id}')"
               onmousemove="moveIngredientTooltip(event)"
               onmouseleave="hideIngredientTooltip()">
          <i class="fa-solid fa-plus"></i> ${vf.icon} ${vf.name}
        </label>
      `;
      vfContainer.appendChild(wrapper.firstElementChild);
      vfContainer.appendChild(wrapper.lastElementChild);
    });
  }

  (appState.superfoods || SUPERALIMENTOS).forEach((sup) => {
    const isAdded = (pet.addedSuperfoods || []).includes(sup.id);
    const checkboxId = `sup-${sup.id}`;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <input type="checkbox" id="${checkboxId}" class="pill-checkbox" ${isAdded ? 'checked' : ''} onchange="toggleSuperfood('${sup.id}', this.checked)">
      <label for="${checkboxId}" class="pill-label super-ing"
             onmouseenter="showIngredientTooltip(event, 'additional', '${sup.id}')"
             onmousemove="moveIngredientTooltip(event)"
             onmouseleave="hideIngredientTooltip()">
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

window.toggleVegetableFruit = function(vfId, isChecked) {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (!pet) return;

  pet.addedVegetablesFruits = pet.addedVegetablesFruits || [];

  if (isChecked) {
    if (!pet.addedVegetablesFruits.includes(vfId)) {
      pet.addedVegetablesFruits.push(vfId);
    }
  } else {
    pet.addedVegetablesFruits = pet.addedVegetablesFruits.filter(id => id !== vfId);
  }

  saveStateToStorage();
  updatePortionCalculatorUI();
};

function calculateSingleDietPrice(pet, recipe) {
  let dietSubtotal = 0;
  const activeRecipes = pet.selectedRecipes || {};
  let hasActiveSelection = false;
  
  for (const rid in activeRecipes) {
    const kgs = activeRecipes[rid];
    if (kgs > 0) {
      hasActiveSelection = true;
      const r = appState.recipes.find(rec => rec.id === rid);
      if (r) {
        dietSubtotal += kgs * r.price;
      }
    }
  }

  if (!hasActiveSelection) {
    const basePrice = recipe.price;
    dietSubtotal = Math.round(pet.portionResults.monthlyKg * basePrice);
  }
  
  let superfoodExtra = 0;
  (pet.addedSuperfoods || []).forEach(id => {
    const s = (appState.superfoods || SUPERALIMENTOS).find(item => item.id === id);
    const itemPrice = s ? s.price : 1500;
    superfoodExtra += (pet.deliveryPeriod === 15 ? Math.round(itemPrice / 2) : itemPrice);
  });

  let vegFruitExtra = 0;
  (pet.addedVegetablesFruits || []).forEach(id => {
    const vf = (appState.vegetablesFruits || VERDURAS_FRUTAS).find(item => item.id === id);
    const itemPrice = vf ? vf.price : 1500;
    vegFruitExtra += (pet.deliveryPeriod === 15 ? Math.round(itemPrice / 2) : itemPrice);
  });

  pet.totalPrice = dietSubtotal + superfoodExtra + vegFruitExtra;

  document.getElementById('calc-diet-price').textContent = `$${pet.totalPrice.toLocaleString('es-CL')}`;
}

function renderPackageLabelPreview(pet, recipe) {
  const container = document.getElementById('calc-package-label');
  if (!container) return;

  const exList = (pet.excludedIngredients || []).map(i => `<span style="text-decoration:line-through; opacity:0.6;">- ${i}</span>`).join('<br>');
  
  const superList = (pet.addedSuperfoods || []).map(id => {
    const s = (appState.superfoods || SUPERALIMENTOS).find(item => item.id === id);
    return s ? `+ ${s.icon} ${s.name}` : '';
  }).filter(Boolean);

  const vegFruitList = (pet.addedVegetablesFruits || []).map(id => {
    const vf = (appState.vegetablesFruits || VERDURAS_FRUTAS).find(item => item.id === id);
    return vf ? `+ ${vf.icon} ${vf.name}` : '';
  }).filter(Boolean);

  const mergedSupplements = [...superList, ...vegFruitList].join('<br>');

  let recipeLabel = recipe.name.toUpperCase();
  const activeRecipes = pet.selectedRecipes || {};
  const activeRecipeParts = [];
  for (const rid in activeRecipes) {
    const kgs = activeRecipes[rid];
    if (kgs > 0) {
      const r = appState.recipes.find(rec => rec.id === rid);
      if (r) {
        activeRecipeParts.push(`${r.name.toUpperCase()} (${kgs} KG)`);
      }
    }
  }
  if (activeRecipeParts.length > 0) {
    recipeLabel = activeRecipeParts.join(', ');
  }

  container.innerHTML = `
    <div class="label-title">FORMULACIÓN PERSONALIZADA</div>
    <div class="label-row"><span>PACIENTE:</span><strong>${pet.name.toUpperCase()}</strong></div>
    <div class="label-row"><span>RAZA:</span><span>${pet.breed.toUpperCase()}</span></div>
    <div class="label-row"><span>PESO:</span><span>${pet.weight} KG</span></div>
    <div class="label-row"><span>TIPO DE DIETA:</span><span>${recipeLabel}</span></div>
    <div class="label-row"><span>DOSIS DIARIA:</span><strong>${pet.portionResults.dailyGrams} G</strong></div>
    <div class="label-row"><span>FORMATO ENVÍO:</span><strong>PORCIONES DE 1 KG</strong></div>
    <div style="border-top:1px dashed rgba(44,26,14,0.15); margin: 0.5rem 0; padding-top: 0.5rem;">
      <strong>EXCLUSIONES DE ALERGIAS:</strong><br>
      ${exList || '<span style="opacity:0.6;">NINGUNA</span>'}
    </div>
    <div style="border-top:1px dashed rgba(44,26,14,0.15); margin: 0.5rem 0; padding-top: 0.5rem;">
      <strong>SUPLEMENTOS / ADICIONALES:</strong><br>
      ${mergedSupplements || '<span style="opacity:0.6;">NINGUNO</span>'}
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
      selected_recipes: pet.selectedRecipes || {},
      excluded_ingredients: pet.excludedIngredients,
      added_superfoods: pet.addedSuperfoods,
      added_vegetables_fruits: pet.addedVegetablesFruits || [],
      custom_instructions: pet.customInstructions,
      address: pet.address,
      delivery_period: pet.deliveryPeriod || 30,
      order_date: pet.orderDate || ''
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
  calculateSubscriptionTotals(); // Reset globalCartTotal to base subtotal first
  const shippingCost = appState.params.shipping_cost !== undefined ? appState.params.shipping_cost : 5000;
  globalCartTotal += shippingCost; // Add shipping cost to the overall total

  document.getElementById('checkout-total-val').textContent = `$${globalCartTotal.toLocaleString('es-CL')}`;

  if (appState.customerName) {
    const el = document.getElementById('pay-recipient-name');
    if (el) el.value = appState.customerName;
  }
  if (appState.customerPhone) {
    const el = document.getElementById('pay-phone');
    if (el) el.value = appState.customerPhone;
  }
  if (appState.customerAddress) {
    const parts = appState.customerAddress.split(', ');
    if (parts.length >= 3) {
      const streetEl = document.getElementById('pay-street');
      if (streetEl) streetEl.value = parts[0];
      const commEl = document.getElementById('pay-commune');
      if (commEl) commEl.value = parts[1];
      const regEl = document.getElementById('pay-region');
      if (regEl) regEl.value = parts[2];
    } else {
      const streetEl = document.getElementById('pay-street');
      if (streetEl) streetEl.value = appState.customerAddress;
    }
  }

  currentPaymentMethod = 'card';
  transferFileBase64 = null;
  transferFileName = '';
  const prevContainer = document.getElementById('transfer-preview-container');
  if (prevContainer) prevContainer.style.display = 'none';
  const statusTxt = document.getElementById('transfer-file-status');
  if (statusTxt) statusTxt.textContent = 'Haz clic para subir comprobante';
  const box = document.getElementById('transfer-file-box');
  if (box) box.style.borderColor = 'rgba(85, 114, 46, 0.3)';
  
  if (typeof selectPaymentMethod === 'function') {
    selectPaymentMethod('card');
  }
  
  const listContainer = document.getElementById('checkout-pets-list');
  if (listContainer) {
    listContainer.innerHTML = '';
    const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
    
    // Update Checkout Title dynamically
    const checkoutTitleText = document.getElementById('checkout-title-text');
    if (checkoutTitleText) {
      const hasQuincenal = unpaidPets.some(p => p.deliveryPeriod === 15);
      const hasMensual = unpaidPets.some(p => p.deliveryPeriod !== 15);
      if (hasQuincenal && hasMensual) {
        checkoutTitleText.textContent = 'Resumen de Suscripción';
      } else if (hasQuincenal) {
        checkoutTitleText.textContent = 'Suscripción Quincenal';
      } else {
        checkoutTitleText.textContent = 'Suscripción Mensual';
      }
    }

    unpaidPets.forEach(p => {
      const rec = appState.recipes.find(r => r.id === p.selectedRecipeId) || appState.recipes[0];
      const row = document.createElement('div');
      row.className = 'checkout-pet-row';
      
      row.innerHTML = `
        <span class="pet-title">
          <img src="${p.photo}" alt="${p.name}">
          ${p.name} (${rec.icon} Dieta ${p.deliveryPeriod === 15 ? 'Quincenal' : 'Mensual'})
        </span>
        <strong>$${p.totalPrice.toLocaleString('es-CL')}</strong>
      `;
      listContainer.appendChild(row);
    });

    // Add shipping cost row to the breakdown
    const shippingRow = document.createElement('div');
    shippingRow.className = 'checkout-pet-row';
    shippingRow.style.borderTop = '1px dashed rgba(44, 26, 14, 0.1)';
    shippingRow.style.paddingTop = '0.5rem';
    shippingRow.style.marginTop = '0.5rem';
    shippingRow.innerHTML = `
      <span style="opacity: 0.85;">🚚 Costo de Envío / Despacho:</span>
      <strong>$${shippingCost.toLocaleString('es-CL')}</strong>
    `;
    listContainer.appendChild(shippingRow);

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
  const recipient = document.getElementById('pay-recipient-name').value.trim();
  const phone = document.getElementById('pay-phone').value.trim();
  const streetVal = document.getElementById('pay-street').value.trim();
  const communeVal = document.getElementById('pay-commune').value.trim();
  const regionVal = document.getElementById('pay-region').value.trim();
  const deliveryBlock = document.getElementById('pay-delivery-block').value;

  if (!recipient || !phone || !streetVal || !communeVal || !regionVal) {
    alert('Ingresa todos los campos requeridos para el despacho (Nombre, Teléfono, Calle, Comuna y Región).');
    return;
  }

  const addressVal = `${streetVal}, ${communeVal}, ${regionVal}`;

  const address = `${recipient} | Tel: ${phone} | Dir: ${addressVal} | Horario: ${deliveryBlock}`;
  const payBtn = document.getElementById('pay-btn');
  let paidStatus = 'Verificado';

  if (currentPaymentMethod === 'card') {
    const holder = document.getElementById('pay-cardholder').value.trim();
    const num = document.getElementById('pay-cardnumber').value.trim();
    const expiry = document.getElementById('pay-expiry').value.trim();
    const cvv = document.getElementById('pay-cvv').value.trim();

    if (!holder || !num || !expiry || !cvv) {
      alert('Ingresa todos los campos de la tarjeta de crédito para el pago seguro.');
      return;
    }

    if (num.replace(/\s/g, '').length < 16) {
      alert('El número de tarjeta de crédito es incorrecto.');
      return;
    }

    payBtn.disabled = true;
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Procesando Transacción...`;
    
    // Simulate short network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    paidStatus = 'Verificado (Tarjeta)';

  } else { // Transferencia
    if (!transferFileBase64) {
      alert('Por favor, adjunta el comprobante de transferencia bancaria para validar el pago.');
      return;
    }

    payBtn.disabled = true;
    payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Validando comprobante con IA...`;
    
    // Simulate validator checking the file
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    payBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Comprobante Verificado!`;
    await new Promise(resolve => setTimeout(resolve, 800));
    
    paidStatus = 'Verificado (Transferencia)';
  }

  const unpaidPets = appState.pets.filter(p => !p.subscriptionPaid);
  const orderId = `OC-${Math.floor(1000 + Math.random() * 9000)}`;
  const petNames = unpaidPets.map(p => p.name).join(', ');
  const petDetails = unpaidPets.map(p => `${p.name} (${p.weight}kg, ${p.breed})`).join(' | ');

  const recipeSummary = unpaidPets.map(p => {
    let recipeDetailsStr = '';
    const activeRecipes = p.selectedRecipes || {};
    const activeRecipeParts = [];
    for (const rid in activeRecipes) {
      const kgs = activeRecipes[rid];
      if (kgs > 0) {
        const r = appState.recipes.find(rec => rec.id === rid);
        if (r) {
          activeRecipeParts.push(`${r.name} (${kgs}kg)`);
        }
      }
    }
    if (activeRecipeParts.length > 0) {
      recipeDetailsStr = activeRecipeParts.join(', ');
    } else {
      const rec = appState.recipes.find(r => r.id === p.selectedRecipeId);
      recipeDetailsStr = rec?.name || 'Receta';
    }

    const superLabels = (p.addedSuperfoods || []).map(id => (appState.superfoods || SUPERALIMENTOS).find(s => s.id === id)?.name || id);
    const vfLabels = (p.addedVegetablesFruits || []).map(id => (appState.vegetablesFruits || VERDURAS_FRUTAS).find(vf => vf.id === id)?.name || id);
    const mergedList = [...superLabels, ...vfLabels].join(', ');
    const supText = mergedList ? ` [Suplementos: ${mergedList}]` : '';
    return `${p.name}: ${recipeDetailsStr}${supText}`;
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
    paid_status: paidStatus,
    delivery_period: unpaidPets.map(p => p.deliveryPeriod || 30).join(', ')
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) throw new Error("Error al procesar la orden en el servidor");
  } catch (err) {
    console.warn("Fallo al guardar orden en el servidor (servidor desconectado), procesando localmente:", err);
  }
  
  const todayStr = new Date().toLocaleDateString('es-CL');
  unpaidPets.forEach(p => {
    p.subscriptionPaid = true;
    p.address = address;
    p.orderDate = todayStr;
  });

  if (unpaidPets.length > 0) {
    appState.activePetIdDashboard = unpaidPets[0].id;
  }

  appState.snacksCart = {};
  saveStateToStorage();

  payBtn.disabled = false;
  payBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Pagar Suscripción`;
  
  changeMobileView('receipt');
};

// ----------------------------------------------------
// 9. APP MÓVIL: RECIBO Y DASHBOARD DE MASCOTAS
// ----------------------------------------------------

function setupReceiptUI() {
  const container = document.getElementById('receipt-details-container');
  if (!container) return;

  const paidPets = appState.pets.filter(p => p.subscriptionPaid);
  
  let petRows = paidPets.map(p => {
    let recipeDetailsStr = '';
    const activeRecipes = p.selectedRecipes || {};
    const activeRecipeParts = [];
    for (const rid in activeRecipes) {
      const kgs = activeRecipes[rid];
      if (kgs > 0) {
        const r = appState.recipes.find(rec => rec.id === rid);
        if (r) {
          activeRecipeParts.push(`${r.name} (${kgs}kg)`);
        }
      }
    }
    if (activeRecipeParts.length > 0) {
      recipeDetailsStr = activeRecipeParts.join(', ');
    } else {
      const rec = appState.recipes.find(r => r.id === p.selectedRecipeId) || appState.recipes[0];
      recipeDetailsStr = `${rec.name} (${p.portionResults?.monthlyKg} kg)`;
    }
    return `<div class="receipt-row"><span>${p.name}:</span><strong>${recipeDetailsStr}</strong></div>`;
  }).join('');

  // Determine delivery frequency dynamically
  const hasQuincenal = paidPets.some(p => p.deliveryPeriod === 15);
  const hasMensual = paidPets.some(p => p.deliveryPeriod !== 15);
  let freqText = 'Mensual (Cada 30 días)';
  if (hasQuincenal && hasMensual) {
    freqText = 'Mixta (15 y 30 días)';
  } else if (hasQuincenal) {
    freqText = 'Quincenal (Cada 15 días)';
  }

  const shippingCost = appState.params.shipping_cost !== undefined ? appState.params.shipping_cost : 5000;

  const firstPet = paidPets[0];
  let shippingHtml = '';
  if (firstPet && firstPet.address) {
    const parts = firstPet.address.split(' | ');
    if (parts.length === 4) {
      const recipient = parts[0];
      const phone = parts[1].replace('Tel: ', '');
      const addressVal = parts[2].replace('Dir: ', '');
      const blockVal = parts[3].replace('Horario: ', '');
      
      const blockTranslation = { morning: 'Mañana (09:00 - 13:00)', midday: 'Medio día (13:00 - 17:00)', afternoon: 'Tarde (17:00 - 21:00)' };
      const blockText = blockTranslation[blockVal] || blockVal;

      shippingHtml = `
        <div style="border-top: 1px dashed rgba(44,26,14,0.15); margin: 0.75rem 0; padding-top: 0.75rem; font-size: 0.75rem; color: var(--secondary-brown);">
          <strong style="display:block; margin-bottom: 0.25rem;">Datos de Despacho:</strong>
          <div><strong>Destinatario:</strong> ${recipient}</div>
          <div><strong>Teléfono:</strong> ${phone}</div>
          <div><strong>Dirección:</strong> ${addressVal}</div>
          <div><strong>Horario de Entrega:</strong> ${blockText}</div>
        </div>
      `;
    } else {
      shippingHtml = `
        <div style="border-top: 1px dashed rgba(44,26,14,0.15); margin: 0.75rem 0; padding-top: 0.75rem; font-size: 0.75rem; color: var(--secondary-brown);">
          <strong>Despacho:</strong> ${firstPet.address}
        </div>
      `;
    }
  }

  container.innerHTML = `
    ${petRows}
    <div class="receipt-row">
      <span>Frecuencia de Despacho:</span>
      <span>${freqText}</span>
    </div>
    <div class="receipt-row">
      <span>Costo de Despacho:</span>
      <strong>$${shippingCost.toLocaleString('es-CL')}</strong>
    </div>
    ${shippingHtml}
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
  
  let recipeDisplay = '';
  const activeRecipes = activePet.selectedRecipes || {};
  const activeParts = [];
  for (const rid in activeRecipes) {
    const kgs = activeRecipes[rid];
    if (kgs > 0) {
      const r = appState.recipes.find(rec => rec.id === rid);
      if (r) {
        activeParts.push(`${r.name} (${kgs}kg)`);
      }
    }
  }
  if (activeParts.length > 0) {
    recipeDisplay = activeParts.join(', ');
  } else {
    const rec = appState.recipes.find(r => r.id === activePet.selectedRecipeId) || appState.recipes[0] || DEFAULT_RECIPES[0];
    recipeDisplay = rec.name;
  }
  document.getElementById('dash-diet-recipe').textContent = recipeDisplay;
  document.getElementById('dash-daily-portion').textContent = `${activePet.portionResults.dailyGrams} g / día`;
  
  const periodText = activePet.deliveryPeriod === 15 ? 'Cada 15 días' : 'Cada 30 días';
  document.getElementById('dash-monthly-cost').textContent = `$${activePet.totalPrice.toLocaleString('es-CL')} (${periodText})`;

  const deliveryDays = document.getElementById('dash-delivery-days');
  const deliveryEstimate = document.getElementById('dash-delivery-estimate');
  if (deliveryDays && deliveryEstimate) {
    function parseChileanDate(dateStr) {
      if (!dateStr) return new Date();
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-indexed month
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    }

    const orderDate = activePet.orderDate ? parseChileanDate(activePet.orderDate) : new Date();
    const periodDays = activePet.deliveryPeriod || 30;
    
    const nextDeliveryDate = new Date(orderDate);
    nextDeliveryDate.setDate(orderDate.getDate() + periodDays);

    const today = new Date();
    today.setHours(0,0,0,0);
    const nextDeliveryClear = new Date(nextDeliveryDate);
    nextDeliveryClear.setHours(0,0,0,0);

    const diffTime = nextDeliveryClear.getTime() - today.getTime();
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      diffDays = 0;
    }

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const formattedDays = diffDays.toString().padStart(2, '0');
    deliveryDays.textContent = `${formattedDays} Días`;
    deliveryEstimate.textContent = `Entrega estimada: ${nextDeliveryDate.getDate()} de ${months[nextDeliveryDate.getMonth()]}`;
  }

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

window.goBackToProfileSetup = function() {
  const pet = appState.pets.find(p => p.id === appState.currentPetId);
  if (pet) {
    document.getElementById('profile-wizard-title').textContent = pet.subscriptionPaid ? 'Modificar Perfil de ' + pet.name : 'Perfil de tu Mascota';
    document.getElementById('pet-name').value = pet.name || '';
    document.getElementById('pet-breed').value = pet.breed || '';
    document.getElementById('pet-weight').value = pet.weight || '';
    document.getElementById('pet-age').value = pet.age || 'adult';
    document.getElementById('pet-activity').value = pet.activity || 'normal';
    document.getElementById('pet-notes').value = pet.notes || '';
    petPhotoBase64 = pet.photo || 'assets/logo.jpg';
    if (petPhotoBase64 && petPhotoBase64 !== 'assets/logo.jpg') {
      document.getElementById('pet-photo-preview').innerHTML = `<img src="${petPhotoBase64}" alt="Vista previa" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
    } else {
      document.getElementById('pet-photo-preview').innerHTML = `<i class="fa-solid fa-camera"></i><span>Subir Foto</span>`;
    }
  }
  changeMobileView('profile-setup');
};

window.editCurrentPlanFromDashboard = function() {
  appState.currentPetId = appState.activePetIdDashboard;
  window.goBackToProfileSetup();
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
// MODO MULTI-DISPOSITIVO, CUENTAS CLIENTES Y COMPRA SIMPLIFICADA (MOBILE-PC)
// ==========================================================================

// Routing principal de compra (Redirecciona al flujo unificado de la app móvil)
window.startOrderFlow = function() {
  switchView('mobile');
  changeMobileView('welcome');
};

window.logoutCustomer = function() {
  if (confirm('¿Deseas cerrar sesión?')) {
    appState.customerToken = null;
    appState.customerName = null;
    appState.customerEmail = null;
    appState.customerPhone = null;
    appState.customerAddress = null;
    
    localStorage.removeItem('oc_customer_token');
    localStorage.removeItem('oc_customer_name');
    localStorage.removeItem('oc_customer_email');
    localStorage.removeItem('oc_customer_phone');
    localStorage.removeItem('oc_customer_address');
    
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

function setCustomerSession(token, name, email, phone, address) {
  appState.customerToken = token;
  appState.customerName = name;
  appState.customerEmail = email;
  appState.customerPhone = phone || '';
  appState.customerAddress = address || '';
  
  localStorage.setItem('oc_customer_token', token);
  localStorage.setItem('oc_customer_name', name);
  localStorage.setItem('oc_customer_email', email);
  localStorage.setItem('oc_customer_phone', phone || '');
  localStorage.setItem('oc_customer_address', address || '');
  
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
          added_vegetables_fruits: pet.addedVegetablesFruits || [],
          custom_instructions: pet.customInstructions,
          address: pet.address,
          delivery_period: pet.deliveryPeriod || 30,
          order_date: pet.orderDate || ''
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

window.togglePasswordVisibility = function(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btnEl.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) {
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  } else {
    input.type = 'password';
    if (icon) {
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }
};

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
    const phone = document.getElementById('mb-auth-reg-phone').value.trim();
    const street = document.getElementById('mb-auth-reg-street').value.trim();
    const commune = document.getElementById('mb-auth-reg-commune').value.trim();
    const region = document.getElementById('mb-auth-reg-region').value.trim();
    const password = document.getElementById('mb-auth-reg-pass').value;
    if (!name || !email || !password || !phone || !street || !commune || !region) {
      alert('Por favor, ingresa tu nombre, correo, teléfono, calle, comuna, región y contraseña.');
      return;
    }
    const address = `${street}, ${commune}, ${region}`;
    url = `${API_BASE_URL}/api/customer/register`;
    payload = { name, email, password, provider: 'email', phone, address };
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
    setCustomerSession(data.token, data.name, data.email, data.phone, data.address);
    
    await handlePostAuthRedirect();
  } catch (err) {
    console.warn("Fallo de autenticación en el servidor, usando inicio de sesión local de prueba:", err);
    const email = type === 'login' 
      ? document.getElementById('mb-auth-email').value.trim() 
      : document.getElementById('mb-auth-reg-email').value.trim();
    const name = type === 'login' 
      ? email.split('@')[0] 
      : document.getElementById('mb-auth-reg-name').value.trim();
    const phone = type === 'login' ? '' : document.getElementById('mb-auth-reg-phone').value.trim();
    const street = type === 'login' ? '' : document.getElementById('mb-auth-reg-street').value.trim();
    const commune = type === 'login' ? '' : document.getElementById('mb-auth-reg-commune').value.trim();
    const region = type === 'login' ? '' : document.getElementById('mb-auth-reg-region').value.trim();
    const address = type === 'login' ? '' : `${street}, ${commune}, ${region}`;
      
    setCustomerSession("mock_token_email", name, email, phone, address);
    await handlePostAuthRedirect();
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
    setCustomerSession(data.token, data.name, data.email, data.phone, data.address);
    
    await handlePostAuthRedirect();
  } catch (err) {
    console.warn("Fallo de inicio social en el servidor, usando inicio de sesión mock local:", err);
    setCustomerSession("mock_token_social", name, email, "", "");
    await handlePostAuthRedirect();
  }
};

async function handlePostAuthRedirect() {
  await syncCustomerPets();
  
  // If the profile is incomplete (missing phone or address), show the setup form
  if (!appState.customerPhone || !appState.customerAddress) {
    changeMobileView('social-profile-setup');
    return;
  }
  
  if (appState.pendingWizardInit) {
    appState.pendingWizardInit = false;
    
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
  } else {
    changeMobileView('checkout');
  }
}

window.submitSocialProfileCompletion = async function() {
  const name = document.getElementById('mb-social-name').value.trim();
  const phone = document.getElementById('mb-social-phone').value.trim();
  const street = document.getElementById('mb-social-street').value.trim();
  const commune = document.getElementById('mb-social-commune').value.trim();
  const region = document.getElementById('mb-social-region').value.trim();
  
  if (!name || !phone || !street || !commune || !region) {
    alert('Por favor, ingresa tu nombre completo, teléfono, calle, comuna y región para continuar.');
    return;
  }
  
  const address = `${street}, ${commune}, ${region}`;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/customer/profile`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.customerToken}`
      },
      body: JSON.stringify({ name, phone, address })
    });
    
    if (!res.ok) throw new Error("No se pudo guardar la información de perfil");
    
    const data = await res.json();
    setCustomerSession(appState.customerToken, data.name, data.email, data.phone, data.address);
    
    // Reset inputs
    document.getElementById('mb-social-name').value = '';
    document.getElementById('mb-social-phone').value = '';
    document.getElementById('mb-social-street').value = '';
    document.getElementById('mb-social-commune').value = '';
    document.getElementById('mb-social-region').value = '';
    
    if (appState.editingProfileFromDashboard) {
      appState.editingProfileFromDashboard = false;
      alert('¡Tus datos de cuenta se actualizaron con éxito!');
      changeMobileView(appState.profileEditReturnView || 'pet-dashboard');
      return;
    }
    
    // Continue
    if (appState.pendingWizardInit) {
      appState.pendingWizardInit = false;
      
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
    } else {
      changeMobileView('checkout');
    }
  } catch (err) {
    console.warn("Fallo de guardado en el servidor, usando datos locales:", err);
    setCustomerSession(appState.customerToken, name, appState.customerEmail, phone, address);
    
    document.getElementById('mb-social-name').value = '';
    document.getElementById('mb-social-phone').value = '';
    document.getElementById('mb-social-street').value = '';
    document.getElementById('mb-social-commune').value = '';
    document.getElementById('mb-social-region').value = '';
    
    if (appState.editingProfileFromDashboard) {
      appState.editingProfileFromDashboard = false;
      alert('¡Tus datos de cuenta se actualizaron con éxito (Modo Local)!');
      changeMobileView(appState.profileEditReturnView || 'pet-dashboard');
      return;
    }
    
    if (appState.pendingWizardInit) {
      appState.pendingWizardInit = false;
      
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
    } else {
      changeMobileView('checkout');
    }
  }
};

window.openUserProfileEdit = function() {
  appState.editingProfileFromDashboard = true;
  appState.profileEditReturnView = appState.mobileView || 'pet-dashboard';
  changeMobileView('social-profile-setup');
};

window.cancelSocialProfileEdit = function() {
  appState.editingProfileFromDashboard = false;
  changeMobileView(appState.profileEditReturnView || 'pet-dashboard');
};

window.authGoBackMobile = function() {
  if (appState.pendingWizardInit) {
    appState.pendingWizardInit = false;
    changeMobileView('welcome');
  } else {
    changeMobileView('snacks');
  }
};

window.resetToWelcome = function() {
  switchView('web');
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
  } else {
    document.body.classList.remove('mobile-native-mode');
  }
  switchView(appState.activeView);
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

// ==========================================================================
// NUEVAS MEJORAS: PAGO POR TRANSFERENCIA, PERIODO DE ENTREGA Y ALERTAS WHATSAPP
// ==========================================================================

let currentPaymentMethod = 'card';
window.selectPaymentMethod = function(method) {
  currentPaymentMethod = method;
  const btnCard = document.getElementById('tab-pay-card');
  const btnTransfer = document.getElementById('tab-pay-transfer');
  const formCard = document.getElementById('form-pay-card');
  const formTransfer = document.getElementById('form-pay-transfer');
  const creditCardPreview = document.getElementById('checkout-credit-card');
  const transferPlaceholder = document.getElementById('checkout-transfer-placeholder');

  if (method === 'card') {
    if (btnCard) btnCard.classList.add('active');
    if (btnCard) {
      btnCard.style.border = '1.5px solid var(--primary-green)';
      btnCard.style.background = 'var(--bg-white)';
      btnCard.style.color = 'var(--primary-green)';
    }

    if (btnTransfer) btnTransfer.classList.remove('active');
    if (btnTransfer) {
      btnTransfer.style.border = '1.5px solid rgba(44, 26, 14, 0.08)';
      btnTransfer.style.background = 'hsla(24, 25%, 30%, 0.03)';
      btnTransfer.style.color = 'var(--text-muted)';
    }

    if (formCard) formCard.style.display = 'block';
    if (formTransfer) formTransfer.style.display = 'none';
    if (creditCardPreview) creditCardPreview.style.display = 'block';
    if (transferPlaceholder) transferPlaceholder.style.display = 'none';
  } else {
    if (btnTransfer) btnTransfer.classList.add('active');
    if (btnTransfer) {
      btnTransfer.style.border = '1.5px solid var(--primary-green)';
      btnTransfer.style.background = 'var(--bg-white)';
      btnTransfer.style.color = 'var(--primary-green)';
    }

    if (btnCard) btnCard.classList.remove('active');
    if (btnCard) {
      btnCard.style.border = '1.5px solid rgba(44, 26, 14, 0.08)';
      btnCard.style.background = 'hsla(24, 25%, 30%, 0.03)';
      btnCard.style.color = 'var(--text-muted)';
    }

    if (formCard) formCard.style.display = 'none';
    if (formTransfer) formTransfer.style.display = 'block';
    if (creditCardPreview) creditCardPreview.style.display = 'none';
    if (transferPlaceholder) transferPlaceholder.style.display = 'block';
  }
};

window.triggerTransferFileUpload = function() {
  const fileInput = document.getElementById('pay-transfer-file');
  if (fileInput) fileInput.click();
};

let transferFileBase64 = null;
let transferFileName = '';
window.handleTransferFileSelect = function(event) {
  const file = event.target.files[0];
  if (file) {
    transferFileName = file.name;
    const reader = new FileReader();
    reader.onload = function(e) {
      transferFileBase64 = e.target.result;
      
      const prevName = document.getElementById('transfer-preview-name');
      const prevContainer = document.getElementById('transfer-preview-container');
      const statusTxt = document.getElementById('transfer-file-status');
      const box = document.getElementById('transfer-file-box');
      
      if (prevName) prevName.textContent = file.name;
      if (prevContainer) prevContainer.style.display = 'block';
      if (statusTxt) statusTxt.textContent = 'Comprobante seleccionado';
      if (box) box.style.borderColor = 'var(--primary-green)';
    };
    reader.readAsDataURL(file);
  }
};

window.triggerWhatsAppAlertSimulation = function() {
  const paidPets = appState.pets.filter(p => p.subscriptionPaid);
  if (paidPets.length === 0) {
    alert("No hay mascotas con suscripciones pagadas para generar la alerta.");
    return;
  }
  
  // Get pet names
  const petNames = paidPets.map(p => p.name).join(' y ');
  
  // Retrieve phone number from first pet's address metadata
  let phone = "+56 9 1234 5678"; // fallback
  const firstPet = paidPets[0];
  if (firstPet && firstPet.address) {
    const parts = firstPet.address.split(' | ');
    if (parts.length === 4) {
      phone = parts[1].replace('Tel: ', '').trim();
    }
  }

  // Format message
  const daysLeft = 3;
  const message = `Hola, te quedan ${daysLeft} días del fin del periodo para generar tu nuevo pedido. ¡No te quedes sin comida para ${petNames}! 🐾`;
  
  // Clean phone number
  let cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone.startsWith('+') && cleanPhone.length === 9) {
    cleanPhone = '+56' + cleanPhone; // default Chile code if 9 digits
  }
  
  const url = `https://api.whatsapp.com/send?phone=${encodeURIComponent(cleanPhone)}&text=${encodeURIComponent(message)}`;
  
  alert(`Simulación de WhatsApp:\n\nPara: ${cleanPhone}\nMensaje: "${message}"\n\nSe abrirá WhatsApp Web/App para enviar el mensaje real.`);
  window.open(url, '_blank');
};

// ----------------------------------------------------
// MODAL DE CONTACTO PPV SOLUCIONES INFORMÁTICAS
// ----------------------------------------------------
// Audio synthesis functions
const playLaunchSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const oscNode = ctx.createOscillator();
    oscNode.type = 'sawtooth';
    oscNode.frequency.setValueAtTime(80, ctx.currentTime);
    oscNode.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.9);

    const filterNode = ctx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1500, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    oscNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscNode.start(ctx.currentTime);
    oscNode.stop(ctx.currentTime + 0.9);
  } catch (e) {
    console.warn(e);
  }
};

const playExplosionSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const oscNode = ctx.createOscillator();
    oscNode.type = 'sawtooth';
    oscNode.frequency.setValueAtTime(180, ctx.currentTime);
    oscNode.frequency.exponentialRampToValueAtTime(15, ctx.currentTime + 1.2);

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, ctx.currentTime);
    rumbleFilter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.8, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    oscNode.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    noiseNode.start(ctx.currentTime);
    oscNode.start(ctx.currentTime);

    noiseNode.stop(ctx.currentTime + 1.5);
    oscNode.stop(ctx.currentTime + 1.2);
  } catch (e) {
    console.warn(e);
  }
};

window.openPpvModal = function(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('ppv-contact-modal');
  if (modal) {
    modal.classList.add('active');
    
    // Reset form elements
    const form = document.getElementById('ppv-contact-form');
    const formWrapper = document.getElementById('ppv-form-wrapper');
    const successMsg = document.getElementById('ppv-form-success');
    const spaceship = document.getElementById('ppv-spaceship');
    const missile = document.getElementById('ppv-missile');
    const explosion = document.getElementById('ppv-explosion');

    if (form) {
      form.reset();
    }
    if (formWrapper) {
      formWrapper.style.display = 'block';
      formWrapper.classList.remove('faded');
    }
    if (successMsg) successMsg.style.display = 'none';

    // Reset animations
    if (spaceship) {
      spaceship.style.display = 'flex';
      spaceship.className = 'ppv-spaceship animate-spaceship-orbit';
    }
    if (missile) {
      missile.style.display = 'none';
      missile.className = 'ppv-missile';
    }
    if (explosion) {
      explosion.style.display = 'none';
    }
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
  
  const name = document.getElementById('ppv-name')?.value || '';
  const email = document.getElementById('ppv-email')?.value || '';
  const phone = document.getElementById('ppv-phone')?.value || '';
  const message = document.getElementById('ppv-message')?.value || '';
  
  const formWrapper = document.getElementById('ppv-form-wrapper');
  const spaceship = document.getElementById('ppv-spaceship');
  const missile = document.getElementById('ppv-missile');
  const explosion = document.getElementById('ppv-explosion');
  const successMsg = document.getElementById('ppv-form-success');

  // Trigger battle sequence
  if (formWrapper) formWrapper.classList.add('faded');
  
  if (spaceship) {
    spaceship.className = 'ppv-spaceship animate-ship-shake';
  }
  
  if (missile) {
    missile.style.display = 'flex';
    missile.className = 'ppv-missile animate-missile-launch';
  }
  
  playLaunchSound();

  // Collision & explosion
  setTimeout(() => {
    playExplosionSound();
    if (spaceship) spaceship.style.display = 'none';
    if (missile) missile.style.display = 'none';
    if (explosion) explosion.style.display = 'block';
  }, 900);

  // Success screen
  setTimeout(() => {
    if (explosion) explosion.style.display = 'none';
    if (formWrapper) formWrapper.style.display = 'none';
    if (successMsg) successMsg.style.display = 'block';
  }, 1700);

  // Send request in background
  try {
    await fetch(`${API_BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone, message })
    });
  } catch (err) {
    console.warn("Servidor backend offline o error al guardar lead:", err);
  }
};

// ==========================================================================
// INTERACTIVE TOOLTIPS FOR VITAMINS AND BENEFITS
// ==========================================================================

let tooltipEl = document.getElementById('origen-tooltip');
if (!tooltipEl) {
  tooltipEl = document.createElement('div');
  tooltipEl.id = 'origen-tooltip';
  tooltipEl.style.position = 'absolute';
  tooltipEl.style.background = 'rgba(44, 26, 14, 0.96)';
  tooltipEl.style.color = '#f4ece1';
  tooltipEl.style.padding = '0.75rem 1rem';
  tooltipEl.style.borderRadius = '8px';
  tooltipEl.style.fontSize = '0.75rem';
  tooltipEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
  tooltipEl.style.zIndex = '99999';
  tooltipEl.style.pointerEvents = 'none';
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
  tooltipEl.style.transform = 'translateY(5px)';
  tooltipEl.style.maxWidth = '260px';
  tooltipEl.style.border = '1px solid rgba(244, 236, 225, 0.15)';
  tooltipEl.style.display = 'none';
  tooltipEl.style.lineHeight = '1.4';
  document.body.appendChild(tooltipEl);
}

window.showIngredientTooltip = function(event, type, itemIdOrName) {
  let item = null;
  const searchName = itemIdOrName.trim().toLowerCase().replace(/\.$/, '');

  if (type === 'additional') {
    const allAdd = [...(appState.superfoods || []), ...(appState.vegetablesFruits || [])];
    item = allAdd.find(a => a.id === itemIdOrName || a.name.toLowerCase() === searchName);
  } else if (type === 'base') {
    item = (appState.ingredientsInfo || []).find(i => i.name.toLowerCase() === searchName || i.id === itemIdOrName);
    if (!item) {
      item = (appState.ingredientsInfo || []).find(i => searchName.includes(i.name.toLowerCase()) || i.name.toLowerCase().includes(searchName));
    }
  }

  if (item && (item.vitamins || item.benefits)) {
    const vitaminsText = item.vitamins || 'N/A';
    const benefitsText = item.benefits || 'N/A';
    tooltipEl.innerHTML = `
      <div style="font-weight: 700; color: #8a8d6b; margin-bottom: 0.35rem; font-size: 0.82rem; display: flex; align-items: center; gap: 0.25rem;">
        ${item.icon ? item.icon : '🐾'} ${item.name}
      </div>
      <div style="margin-bottom: 0.35rem;"><span style="color: #c9af92; font-weight: 600;">Vitaminas:</span> ${vitaminsText}</div>
      <div><span style="color: #c9af92; font-weight: 600;">Beneficios:</span> ${benefitsText}</div>
    `;
    tooltipEl.style.display = 'block';
    
    // Position it
    const tooltipHeight = tooltipEl.offsetHeight;
    const tooltipWidth = tooltipEl.offsetWidth;
    let top = event.pageY - tooltipHeight - 15;
    let left = event.pageX - (tooltipWidth / 2);

    // Prevent screen overflow
    if (top < window.scrollY) {
      top = event.pageY + 15;
    }
    if (left < 10) {
      left = 10;
    } else if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
    
    // Animate in
    setTimeout(() => {
      tooltipEl.style.opacity = '1';
      tooltipEl.style.transform = 'translateY(0)';
    }, 10);
  }
};

window.hideIngredientTooltip = function() {
  tooltipEl.style.opacity = '0';
  tooltipEl.style.transform = 'translateY(5px)';
  setTimeout(() => {
    if (tooltipEl.style.opacity === '0') {
      tooltipEl.style.display = 'none';
    }
  }, 150);
};

window.moveIngredientTooltip = function(event) {
  if (tooltipEl.style.display === 'block') {
    const tooltipHeight = tooltipEl.offsetHeight;
    const tooltipWidth = tooltipEl.offsetWidth;
    let top = event.pageY - tooltipHeight - 15;
    let left = event.pageX - (tooltipWidth / 2);

    if (top < window.scrollY) {
      top = event.pageY + 15;
    }
    if (left < 10) {
      left = 10;
    } else if (left + tooltipWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltipWidth - 10;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }
};