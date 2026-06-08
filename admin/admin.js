// ----------------------------------------------------
// 1. CONFIGURACIÓN DEL BACKEND Y ESTADO DE ADMIN
// ----------------------------------------------------

const API_BASE_URL = (window.location.protocol === "file:" || window.location.port) 
  ? "http://localhost:8000" 
  : "";

// Estado interno para la administración
let appState = {
  recipes: [],
  snacks: [],
  params: {},
  orders: [],
  testimonials: [],
  faqs: [],
  users: [], // Listado de administradores
  adminTab: 'parameters',
  adminToken: localStorage.getItem('oc_admin_token') || null
};

// Helper mapping functions
function mapRecipeFromAPI(r) {
  if (!r) return null;
  return {
    ...r,
    ingredientsArray: r.ingredients_array || []
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

// Fallback values for development if API is offline
const DEFAULT_RECIPES = [
  { id: 'b-pollo', name: 'BARF Pollo Premium', category: 'barf', price: 4200, icon: '🍗', ingredients: 'Hueso de pollo triturado, carne magra de pollo, hígado de pollo, vísceras trituradas, espinaca fresca, zanahoria picada.', ingredientsArray: ['Hueso de pollo triturado', 'Carne magra de pollo', 'Hígado de pollo', 'Vísceras trituradas', 'Espinaca fresca', 'Zanahoria picada'] },
  { id: 'b-vacuno', name: 'BARF Vacuno Tradicional', category: 'barf', price: 4200, icon: '🥩', ingredients: 'Carne magra de res, hueso blando de vacuno molido, hígado de res, bofe, riñón de res, manzana verde, zanahoria.', ingredientsArray: ['Carne magra de res', 'Hueso de vacuno molido', 'Hígado de res', 'Vísceras (bofe/riñón)', 'Manzana verde', 'Zanahoria'] },
  { id: 'b-salmon', name: 'BARF Pavo & Salmón', category: 'barf', price: 4200, icon: '🐟', ingredients: 'Carne magra de pavo, filete de salmón, hueso de pavo triturado, hígado de pavo, acelga fresca, arándanos silvestres.', ingredientsArray: ['Carne magra de pavo', 'Filete de salmón', 'Hueso de pavo triturado', 'Hígado de pavo', 'Acelga fresca', 'Arándanos silvestres'] },
  { id: 'c-pollo', name: 'Pollo Cocido al Vapor', category: 'cooked', price: 5200, icon: '🍲', ingredients: 'Pechuga de pollo cocida, trutro deshuesado, zapallo camote, zanahoria cocida, arroz integral cocido, aceite de oliva.', ingredientsArray: ['Pechuga de pollo cocida', 'Trutro de pollo cocido', 'Zapallo camote al vapor', 'Zanahoria cocida', 'Arroz integral cocido', 'Aceite de oliva'] },
  { id: 'c-vacuno', name: 'Vacuno & Camote Cocido', category: 'cooked', price: 5200, icon: '🥘', ingredients: 'Posta de vacuno picada, camote cocido al vapor, espinaca al vapor, arvejas tiernas, hígado de res cocido.', ingredientsArray: ['Posta de vacuno picada', 'Camote al vapor', 'Espinaca al vapor', 'Arvejas tiernas', 'Hígado de res cocido'] },
  { id: 'c-cerdo', name: 'Cerdo & Manzana Cocido', category: 'cooked', price: 5200, icon: '🍎', ingredients: 'Pulpa de cerdo cocida, manzana roja cocida, zanahoria, avena integral machacada, carbonato de calcio.', ingredientsArray: ['Pulpa de cerdo cocida', 'Manzana roja cocida', 'Zanahoria al vapor', 'Avena integral cocida', 'Carbonato de calcio'] }
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
  puppy_late: 4.0,
  shipping_cost: 5000
};

// Carga de configuración inicial
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
    
    if (appState.adminToken) {
      initAdminPanel();
    }
  } catch (err) {
    console.warn("Fallo al conectar con la API, usando valores locales de desarrollo:", err);
    appState.recipes = DEFAULT_RECIPES;
    appState.snacks = DEFAULT_SNACKS;
    appState.params = DEFAULT_PARAMS;
    appState.testimonials = [];
    appState.faqs = [];
    
    if (appState.adminToken) {
      initAdminPanel();
    }
  }
}

// ----------------------------------------------------
// 2. PANEL DE ADMINISTRACIÓN - NAVEGACIÓN Y CONFIG
// ----------------------------------------------------

async function initAdminPanel() {
  // Rellenar parámetros en inputs
  if (appState.params) {
    document.getElementById('cfg-barf-price').value = appState.params.barf_price_per_kg || 4200;
    document.getElementById('cfg-cooked-price').value = appState.params.cooked_price_per_kg || 5200;
    document.getElementById('cfg-shipping-cost').value = appState.params.shipping_cost || 5000;
    
    document.getElementById('cfg-barf-adult-sedentary').value = appState.params.barf_adult_sedentary || 2.0;
    document.getElementById('cfg-barf-adult-normal').value = appState.params.barf_adult_normal || 2.5;
    document.getElementById('cfg-barf-adult-active').value = appState.params.barf_adult_active || 3.0;
    document.getElementById('cfg-barf-adult-working').value = appState.params.barf_adult_working || 3.5;

    document.getElementById('cfg-cooked-adult-sedentary').value = appState.params.cooked_adult_sedentary || 3.0;
    document.getElementById('cfg-cooked-adult-normal').value = appState.params.cooked_adult_normal || 3.5;
    document.getElementById('cfg-cooked-adult-active').value = appState.params.cooked_adult_active || 4.0;
    document.getElementById('cfg-cooked-adult-working').value = appState.params.cooked_adult_working || 4.5;

    document.getElementById('cfg-puppy-early').value = appState.params.puppy_early || 8.0;
    document.getElementById('cfg-puppy-mid').value = appState.params.puppy_mid || 6.0;
    document.getElementById('cfg-puppy-late').value = appState.params.puppy_late || 4.0;
  }
  
  // Renderizar tablas
  renderAdminProductsTable();
  await fetchAdminOrders();
  renderAdminOrdersTable();
  renderAdminTestimonialsTable();
  renderAdminFaqsTable();
  await fetchAdminUsers();
  renderAdminUsersTable();
}

window.switchAdminTab = async function(tabName) {
  appState.adminTab = tabName;
  
  document.querySelectorAll('.admin-menu-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-view-panel').forEach(panel => panel.classList.remove('active'));
  
  // Activar pestaña actual
  const activeBtn = document.getElementById(`btn-tab-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');

  const activePanel = document.getElementById(`admin-panel-${tabName}`);
  if (activePanel) activePanel.classList.add('active');

  // Acciones de actualización según pestaña
  if (tabName === 'recipes') {
    renderAdminProductsTable();
  } else if (tabName === 'orders') {
    await fetchAdminOrders();
    renderAdminOrdersTable();
  } else if (tabName === 'testimonials') {
    renderAdminTestimonialsTable();
  } else if (tabName === 'faqs') {
    renderAdminFaqsTable();
  } else if (tabName === 'users') {
    await fetchAdminUsers();
    renderAdminUsersTable();
  }
};

// ----------------------------------------------------
// 3. CRUD DE PARÁMETROS NUTRICIONALES
// ----------------------------------------------------

window.saveAdminParameters = async function() {
  const updatedParams = {
    barf_price_per_kg: parseInt(document.getElementById('cfg-barf-price').value),
    cooked_price_per_kg: parseInt(document.getElementById('cfg-cooked-price').value),
    shipping_cost: parseInt(document.getElementById('cfg-shipping-cost').value),
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
    
    // Sincronizar precios en memoria
    appState.recipes.forEach(r => {
      if (r.category === 'barf') r.price = appState.params.barf_price_per_kg;
      if (r.category === 'cooked') r.price = appState.params.cooked_price_per_kg;
    });

    alert('¡Parámetros de cálculo y precios actualizados con éxito!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

// ----------------------------------------------------
// 4. CRUD DE PRODUCTOS / RECETAS
// ----------------------------------------------------

function renderAdminProductsTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const all = [...appState.recipes, ...appState.snacks];

  if (all.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay productos en el catálogo.</td></tr>`;
    return;
  }

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
    alert('¡Catálogo actualizado!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

window.deleteProductInAdmin = async function(prodId) {
  if (confirm('¿Seguro que deseas eliminar este producto del catálogo?')) {
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
      alert('¡Producto eliminado con éxito!');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 5. MANTENEDOR DE ORDENES / SUSCRIPCIONES
// ----------------------------------------------------

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
        <img src="${o.petPhoto || '../assets/logo.jpg'}" alt="${o.petName}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary-green);" onerror="this.src='../assets/logo.jpg'">
      </td>
      <td>
        <strong style="color: var(--secondary-brown); font-size: 0.95rem;">${o.petName}</strong>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Dirección: ${o.address}</div>
      </td>
      <td style="font-size: 0.78rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">
        ${o.petBreed} • ${o.petWeight} kg
      </td>
      <td style="font-size: 0.78rem; color: var(--text-dark);">
        ${o.recipeName}
        <div style="font-size: 0.72rem; color: var(--accent-red); font-weight:700;">Snacks: ${o.snacks || 'Ninguno'}</div>
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
// 6. CRUD DE TESTIMONIOS
// ----------------------------------------------------

function renderAdminTestimonialsTable() {
  const tbody = document.getElementById('admin-testimonials-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (appState.testimonials.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay testimonios registrados.</td></tr>`;
    return;
  }

  appState.testimonials.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="text-align: center;">
        <img src="${t.photo_url || '../assets/logo.jpg'}" alt="${t.author}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary-green);" onerror="this.src='../assets/logo.jpg'">
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
      alert('¡Testimonio eliminado!');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 7. CRUD DE PREGUNTAS FRECUENTES (FAQS)
// ----------------------------------------------------

function renderAdminFaqsTable() {
  const tbody = document.getElementById('admin-faqs-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (appState.faqs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay FAQs registradas.</td></tr>`;
    return;
  }

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
    alert('¡FAQ guardada exitosamente!');
  } catch (err) {
    alert("Error al guardar FAQ: " + err.message);
  }
};

window.deleteFaqInAdmin = async function(id) {
  if (confirm('¿Seguro que deseas eliminar esta FAQ de la web?')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/faqs/${id}`, {
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
        throw new Error("No se pudo eliminar la FAQ");
      }

      appState.faqs = appState.faqs.filter(item => item.id !== id);
      renderAdminFaqsTable();
      alert('¡FAQ eliminada!');
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 8. CRUD DE USUARIOS ADMINISTRADORES (NUEVO)
// ----------------------------------------------------

async function fetchAdminUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        "Authorization": `Bearer ${appState.adminToken}`
      }
    });
    if (!res.ok) {
      if (res.status === 401) {
        logoutAdmin();
        return;
      }
      throw new Error("No se pudieron cargar los administradores");
    }
    appState.users = await res.json();
  } catch (err) {
    console.error("Error al cargar administradores:", err);
  }
}

function renderAdminUsersTable() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (appState.users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay usuarios administradores.</td></tr>`;
    return;
  }

  appState.users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: var(--primary-green); width: 80px;">#${u.id}</td>
      <td style="font-weight: 600; color: var(--secondary-brown);">${u.username}</td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-edit" onclick="editUserInAdmin('${u.id}', '${u.username}')" title="Editar"><i class="fa-solid fa-user-pen"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteAdminUser('${u.id}', '${u.username}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAddUserForm = function() {
  document.getElementById('add-user-form-container').style.display = 'block';
  document.getElementById('form-user-title').textContent = 'Agregar Administrador';
  document.getElementById('form-user-id').value = '';
  document.getElementById('form-user-name').value = '';
  document.getElementById('form-user-pass').value = '';
  document.getElementById('form-user-pass').required = true;
  document.getElementById('form-user-pass').placeholder = 'Contraseña obligatoria';
};

window.hideUserForm = function() {
  document.getElementById('add-user-form-container').style.display = 'none';
};

window.editUserInAdmin = function(id, username) {
  document.getElementById('add-user-form-container').style.display = 'block';
  document.getElementById('form-user-title').textContent = `Editar Administrador: ${username}`;
  document.getElementById('form-user-id').value = id;
  document.getElementById('form-user-name').value = username;
  document.getElementById('form-user-pass').value = '';
  document.getElementById('form-user-pass').required = false;
  document.getElementById('form-user-pass').placeholder = 'Dejar en blanco para no modificar contraseña';
};

window.submitUserForm = async function() {
  const id = document.getElementById('form-user-id').value;
  const username = document.getElementById('form-user-name').value.trim();
  const password = document.getElementById('form-user-pass').value;

  if (!username) {
    alert('Ingresa el nombre de usuario.');
    return;
  }

  // Si es nuevo usuario, la contraseña es obligatoria
  if (!id && !password) {
    alert('La contraseña es obligatoria para nuevos usuarios.');
    return;
  }

  const userData = {
    username,
    password: password || "" // Si está vacío en edición, enviamos vacío
  };

  try {
    let res;
    if (id) {
      // Edición (PUT)
      res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appState.adminToken}`
        },
        body: JSON.stringify(userData)
      });
    } else {
      // Creación (POST)
      res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appState.adminToken}`
        },
        body: JSON.stringify(userData)
      });
    }

    if (!res.ok) {
      const errData = await res.json();
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error(errData.detail || "No se pudo guardar el administrador");
    }

    const data = await res.json();
    alert('¡Usuario guardado con éxito!');
    hideUserForm();
    await fetchAdminUsers();
    renderAdminUsersTable();
  } catch (err) {
    alert("Error al guardar usuario: " + err.message);
  }
};

window.deleteAdminUser = async function(id, username) {
  if (confirm(`¿Seguro que deseas eliminar al administrador "${username}"?`)) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${appState.adminToken}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 401) {
          alert("Sesión expirada. Por favor inicia sesión.");
          logoutAdmin();
          return;
        }
        throw new Error(errData.detail || "No se pudo eliminar el usuario");
      }

      alert('¡Usuario eliminado con éxito!');
      await fetchAdminUsers();
      renderAdminUsersTable();
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 9. LOGICA DE LOGIN Y LOGOUT
// ----------------------------------------------------

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
// 10. INICIALIZACIÓN DE LA APLICACIÓN DE ADMIN
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
