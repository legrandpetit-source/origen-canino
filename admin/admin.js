// ----------------------------------------------------
// 1. CONFIGURACIÓN DEL BACKEND Y ESTADO DE ADMIN
// ----------------------------------------------------

const API_BASE_URL = (window.location.protocol === "file:" || window.location.port || window.location.hostname.includes("github.io")) 
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
  additionals: [],
  ingredientsInfo: [],
  users: [], // Listado de administradores
  leads: [],
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
    paidStatus: o.paid_status,
    productionStatus: o.production_status || 'Pendiente',
    deliveryPeriod: o.delivery_period || o.deliveryPeriod || '30'
  };
}

// Fallback values for development if API is offline
const DEFAULT_RECIPES = [
  { id: 'b-pollo', name: 'BARF Pollo Premium', category: 'barf', price: 4200, icon: '🍗', ingredients: 'Hueso de pollo triturado, carne magra de pollo, hígado de pollo, vísceras trituradas, espinaca fresca, zanahoria picada, betarraga.', ingredientsArray: ['Hueso de pollo triturado', 'Carne magra de pollo', 'Hígado de pollo', 'Vísceras trituradas', 'Espinaca fresca', 'Zanahoria picada', 'betarraga'] },
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
    appState.additionals = data.additionals || [];
    appState.ingredientsInfo = data.ingredients_info || [];
    
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
    appState.additionals = [];
    appState.ingredientsInfo = [];
    
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
  await fetchAdminAdditionals();
  renderAdminAdditionalsTables();
  await fetchAdminIngredientsInfo();
  renderAdminIngredientsInfoTable();
  await fetchAdminUsers();
  renderAdminUsersTable();
  await fetchAdminLeads();
  renderAdminLeadsTable();
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
  } else if (tabName === 'additionals') {
    await fetchAdminAdditionals();
    renderAdminAdditionalsTables();
    await fetchAdminIngredientsInfo();
    renderAdminIngredientsInfoTable();
  } else if (tabName === 'leads') {
    await fetchAdminLeads();
    renderAdminLeadsTable();
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

  const cleanedIngredientsStr = ingredients.split(',')
    .map(i => i.trim().replace(/\.$/, ''))
    .filter(Boolean)
    .join(', ');

  const ingredients_array = cleanedIngredientsStr.split(', ');

  const recipeData = {
    id: id || null,
    name,
    category,
    price,
    icon,
    ingredients: cleanedIngredientsStr,
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
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay suscripciones activas registradas.</td></tr>`;
    return;
  }

  // Helper date parsing/formatting functions
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

  function formatDateChilean(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  appState.orders.forEach(o => {
    const orderDate = parseChileanDate(o.date);
    const periodStr = o.deliveryPeriod || "30";
    
    // Split periods by comma to handle multiple pets
    const periods = periodStr.split(',').map(p => parseInt(p.trim(), 10) || 30);
    
    // Format periods and calculate dispatch dates
    const dispatchDetails = periods.map(p => {
      const nextDate = new Date(orderDate);
      nextDate.setDate(orderDate.getDate() + p);
      return {
        days: p,
        formattedDate: formatDateChilean(nextDate)
      };
    });

    // Generate output HTML for the period & dispatch column
    let periodHtml = '';
    if (dispatchDetails.length === 1) {
      const detail = dispatchDetails[0];
      periodHtml = `
        <span style="font-weight: 600; color: var(--secondary-brown); font-size: 0.82rem;">${detail.days} Días</span>
        <div style="font-size: 0.72rem; color: var(--primary-green); font-weight: 700; margin-top: 0.2rem;" title="Fecha estimada de despacho">
          <i class="fa-regular fa-calendar-days"></i> ${detail.formattedDate}
        </div>
      `;
    } else {
      // Multiple pets, e.g., Toby: 15 days, Mateo: 30 days
      const petNames = o.petName.split(',').map(n => n.trim());
      periodHtml = '<div style="display: flex; flex-direction: column; gap: 0.25rem;">';
      dispatchDetails.forEach((detail, index) => {
        const name = petNames[index] || `Mascota ${index + 1}`;
        periodHtml += `
          <div style="font-size: 0.7rem; line-height: 1.15; color: var(--text-dark);">
            <strong style="color: var(--secondary-brown);">${name}:</strong> ${detail.days}d 
            <span style="color: var(--primary-green); font-weight: 600;">(${detail.formattedDate})</span>
          </div>
        `;
      });
      periodHtml += '</div>';
    }

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
        ${periodHtml}
      </td>
      <td>
        <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${o.paidStatus}</span>
      </td>
      <td>
        <select class="form-input" style="font-size: 0.78rem; padding: 0.25rem 0.5rem; width: auto; font-weight: 600; background: var(--bg-cream);" onchange="updateProductionStatus(${o.id}, this.value)">
          <option value="Pendiente" ${o.productionStatus === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Preparación" ${o.productionStatus === 'En Preparación' ? 'selected' : ''}>En Preparación</option>
          <option value="Porcionado y Empacado" ${o.productionStatus === 'Porcionado y Empacado' ? 'selected' : ''}>Porcionado y Empacado</option>
          <option value="Congelación" ${o.productionStatus === 'Congelación' ? 'selected' : ''}>Congelación</option>
          <option value="Listo para Despacho" ${o.productionStatus === 'Listo para Despacho' ? 'selected' : ''}>Listo para Despacho</option>
          <option value="En Camino" ${o.productionStatus === 'En Camino' ? 'selected' : ''}>En Camino</option>
          <option value="Entregado" ${o.productionStatus === 'Entregado' ? 'selected' : ''}>Entregado</option>
        </select>
      </td>
      <td class="admin-actions-cell" style="text-align: center;">
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap;" onclick="showOrderLabelsModal(${o.id})" title="Ver e Imprimir Etiquetas de Porción">
          <i class="fa-solid fa-print"></i> Etiquetas
        </button>
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
// 9. GESTIÓN DE MENSAJES Y CONSULTAS (LEADS)
// ----------------------------------------------------

async function fetchAdminLeads() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/leads`, {
      headers: {
        "Authorization": `Bearer ${appState.adminToken}`
      }
    });
    if (!res.ok) {
      if (res.status === 401) {
        logoutAdmin();
        return;
      }
      throw new Error("No se pudieron cargar los mensajes");
    }
    appState.leads = await res.json();
  } catch (err) {
    console.error("Error al cargar mensajes:", err);
  }
}

function renderAdminLeadsTable() {
  const tbody = document.getElementById('admin-leads-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!appState.leads || appState.leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No hay mensajes recibidos.</td></tr>`;
    return;
  }

  appState.leads.forEach(l => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color: var(--text-muted); font-size: 0.82rem;">${l.date}</td>
      <td style="font-weight: 600; color: var(--secondary-brown);">${l.name}</td>
      <td><a href="mailto:${l.email}" style="color: var(--primary-green); text-decoration: underline;">${l.email}</a></td>
      <td style="font-weight: 600; color: var(--text-dark);">${l.phone}</td>
      <td style="color: var(--text-dark); font-size: 0.85rem; max-width: 350px; overflow-wrap: break-word; white-space: normal;">${l.message}</td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-delete" onclick="deleteAdminLead('${l.id}')" title="Eliminar Mensaje"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteAdminLead = async function(id) {
  if (!confirm("¿Estás seguro de que deseas eliminar este mensaje?")) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/leads/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${appState.adminToken}`
      }
    });
    if (!res.ok) throw new Error("No se pudo eliminar el mensaje");
    
    // Recargar tabla
    await fetchAdminLeads();
    renderAdminLeadsTable();
  } catch (err) {
    alert("Error al eliminar mensaje: " + err.message);
  }
};

// ----------------------------------------------------
// 10. LOGICA DE LOGIN Y LOGOUT
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

// ----------------------------------------------------
// 11. PROCESO PRODUCTIVO Y ETIQUETADO DE PORCIONES
// ----------------------------------------------------

window.updateProductionStatus = async function(orderId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify({ production_status: newStatus })
    });

    if (!res.ok) {
      throw new Error("No se pudo actualizar el estado de producción");
    }

    // Actualizar en el estado local
    const order = appState.orders.find(o => o.id === orderId);
    if (order) {
      order.productionStatus = newStatus;
    }
    
    // Feedback visual breve
    console.log(`Estado de orden ${orderId} actualizado a: ${newStatus}`);
  } catch (err) {
    console.error("Error al actualizar estado de producción:", err);
    alert("Error al actualizar estado de producción: " + err.message);
  }
};

window.showOrderLabelsModal = async function(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/labels`, {
      headers: {
        "Authorization": `Bearer ${appState.adminToken}`
      }
    });

    if (!res.ok) {
      throw new Error("No se pudieron obtener las etiquetas de porciones");
    }

    const data = await res.json();
    const container = document.getElementById('ppv-labels-container');
    if (!container) return;

    container.innerHTML = '';

    if (!data.labels || data.labels.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No se encontraron etiquetas para esta orden.</div>`;
    } else {
      data.labels.forEach(lbl => {
        const div = document.createElement('div');
        div.className = 'label-sticker';
        
        // Formatear ingredientes excluidos
        const exclusionsText = (lbl.excluded_ingredients && lbl.excluded_ingredients.length > 0)
          ? lbl.excluded_ingredients.join(', ')
          : 'Ninguno';
          
        div.innerHTML = `
          <div class="label-sticker-header">
            <h4 class="label-sticker-logo">Origen Canino</h4>
            <p class="label-sticker-tagline">Alimentación Natural Premium</p>
            <div class="label-sticker-title">Porción Mensual Personalizada</div>
          </div>
          
          <div class="label-sticker-section">
            <div class="label-sticker-field"><span>Mascota:</span> <strong>${lbl.pet_name}</strong></div>
            <div class="label-sticker-field"><span>Raza/Peso:</span> <strong>${lbl.breed} (${lbl.weight} kg)</strong></div>
            <div class="label-sticker-field"><span>Cliente:</span> <strong>${lbl.customer_name}</strong></div>
            <div class="label-sticker-field"><span>Fecha Pedido:</span> <strong>${lbl.date}</strong></div>
          </div>
          
          <div class="label-sticker-section" style="border-top: 1px solid #000000; padding-top: 0.4rem;">
            <div class="label-sticker-field"><span>Fórmula BARF/Cocido:</span> <strong>${lbl.recipe}</strong></div>
            <div class="label-sticker-field"><span>Ración Diaria:</span> <strong>${lbl.daily_grams} g / día</strong></div>
            <div class="label-sticker-field"><span>Bolsa:</span> <strong>${lbl.bag_index} de ${lbl.total_bags}</strong></div>
            <div class="label-sticker-field"><span>Peso Bolsa:</span> <strong>${lbl.bag_weight} kg</strong></div>
          </div>
          
          <div class="label-sticker-box">
            <div class="label-sticker-box-title">Ingredientes Excluidos</div>
            <div>${exclusionsText}</div>
          </div>
          
          ${lbl.custom_instructions ? `
            <div class="label-sticker-box">
              <div class="label-sticker-box-title">Instrucciones Especiales</div>
              <div>${lbl.custom_instructions}</div>
            </div>
          ` : ''}

          ${lbl.notes ? `
            <div class="label-sticker-box">
              <div class="label-sticker-box-title">Notas adicionales</div>
              <div>${lbl.notes}</div>
            </div>
          ` : ''}
          
          <div class="label-sticker-footer">
            MANTENER CONGELADO • www.origencanino.cl
          </div>
        `;
        container.appendChild(div);
      });
    }

    document.getElementById('ppv-labels-modal').style.display = 'flex';
  } catch (err) {
    console.error("Error al cargar etiquetas de porciones:", err);
    alert("Error al cargar etiquetas de porciones: " + err.message);
  }
};

window.closeLabelsModal = function() {
  document.getElementById('ppv-labels-modal').style.display = 'none';
};

window.printLabels = function() {
  window.print();
};

// ----------------------------------------------------
// 12. CRUD DE SUPLEMENTOS Y ADICIONALES (additionals)
// ----------------------------------------------------

async function fetchAdminAdditionals() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/additionals`);
    if (!res.ok) throw new Error("No se pudieron cargar los adicionales");
    appState.additionals = await res.json();
  } catch (err) {
    console.error("Error al cargar adicionales:", err);
  }
}

function renderAdminAdditionalsTables() {
  const superfoodsTbody = document.getElementById('admin-superfoods-tbody');
  const vegfruitsTbody = document.getElementById('admin-vegfruits-tbody');
  if (!superfoodsTbody || !vegfruitsTbody) return;

  superfoodsTbody.innerHTML = '';
  vegfruitsTbody.innerHTML = '';

  const superfoods = appState.additionals.filter(a => a.category === 'superfood');
  const vegfruits = appState.additionals.filter(a => a.category === 'vegfruit');

  if (superfoods.length === 0) {
    superfoodsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay suplementos o superalimentos registrados.</td></tr>`;
  } else {
    superfoods.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size: 1.3rem; text-align: center;">${a.icon}</td>
        <td style="font-weight: 700; color: var(--secondary-brown);">${a.name}</td>
        <td style="font-weight: 700; color: var(--primary-green);">$${a.price.toLocaleString('es-CL')}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${a.vitamins || 'N/A'}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${a.benefits || 'N/A'}</td>
        <td class="admin-actions-cell">
          <button class="btn-icon btn-edit" onclick="editAdditionalInAdmin('${a.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteAdditionalInAdmin('${a.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      superfoodsTbody.appendChild(tr);
    });
  }

  if (vegfruits.length === 0) {
    vegfruitsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay verduras o frutas adicionales registradas.</td></tr>`;
  } else {
    vegfruits.forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-size: 1.3rem; text-align: center;">${a.icon}</td>
        <td style="font-weight: 700; color: var(--secondary-brown);">${a.name}</td>
        <td style="font-weight: 700; color: var(--primary-green);">$${a.price.toLocaleString('es-CL')}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${a.vitamins || 'N/A'}</td>
        <td style="font-size: 0.8rem; color: var(--text-muted);">${a.benefits || 'N/A'}</td>
        <td class="admin-actions-cell">
          <button class="btn-icon btn-edit" onclick="editAdditionalInAdmin('${a.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteAdditionalInAdmin('${a.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      vegfruitsTbody.appendChild(tr);
    });
  }
}

window.showAddAdditionalForm = function() {
  document.getElementById('add-additional-form-container').style.display = 'block';
  document.getElementById('form-additional-title').textContent = 'Agregar Nuevo Adicional';
  document.getElementById('form-additional-id').value = '';
  document.getElementById('form-additional-name').value = '';
  document.getElementById('form-additional-category').value = 'superfood';
  document.getElementById('form-additional-price').value = '1500';
  document.getElementById('form-additional-icon').value = '';
  document.getElementById('form-additional-vitamins').value = '';
  document.getElementById('form-additional-benefits').value = '';
};

window.hideAdditionalForm = function() {
  document.getElementById('add-additional-form-container').style.display = 'none';
};

window.editAdditionalInAdmin = function(id) {
  const a = appState.additionals.find(item => item.id === id);
  if (!a) return;

  document.getElementById('add-additional-form-container').style.display = 'block';
  document.getElementById('form-additional-title').textContent = `Editar Adicional: ${a.name}`;
  document.getElementById('form-additional-id').value = a.id;
  document.getElementById('form-additional-name').value = a.name;
  document.getElementById('form-additional-category').value = a.category;
  document.getElementById('form-additional-price').value = a.price;
  document.getElementById('form-additional-icon').value = a.icon;
  document.getElementById('form-additional-vitamins').value = a.vitamins || '';
  document.getElementById('form-additional-benefits').value = a.benefits || '';
};

window.submitAdditionalForm = async function() {
  const id = document.getElementById('form-additional-id').value;
  const name = document.getElementById('form-additional-name').value.trim();
  const category = document.getElementById('form-additional-category').value;
  const price = parseInt(document.getElementById('form-additional-price').value);
  const icon = document.getElementById('form-additional-icon').value.trim() || '🌱';
  const vitamins = document.getElementById('form-additional-vitamins').value.trim();
  const benefits = document.getElementById('form-additional-benefits').value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert('Ingresa el nombre y un precio válido.');
    return;
  }

  const additionalData = {
    id: id || null,
    name,
    category,
    price,
    icon,
    vitamins: vitamins || null,
    benefits: benefits || null
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/additionals`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(additionalData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudo guardar el adicional");
    }

    const data = await res.json();
    const savedAdd = data.additional;

    if (id) {
      const idx = appState.additionals.findIndex(item => item.id === id);
      if (idx !== -1) appState.additionals[idx] = savedAdd;
    } else {
      appState.additionals.push(savedAdd);
    }

    hideAdditionalForm();
    renderAdminAdditionalsTables();
    alert('¡Adicional guardado exitosamente!');
  } catch (err) {
    alert("Error al guardar adicional: " + err.message);
  }
};

window.deleteAdditionalInAdmin = async function(id) {
  if (confirm('¿Seguro que deseas eliminar este adicional?')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/additionals/${id}`, {
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
        throw new Error("No se pudo eliminar el adicional");
      }

      appState.additionals = appState.additionals.filter(item => item.id !== id);
      renderAdminAdditionalsTables();
      alert('¡Adicional eliminado!');
    } catch (err) {
      alert("Error al eliminar adicional: " + err.message);
    }
  }
};

// ----------------------------------------------------
// 13. CRUD DE INFORMACIÓN DE INGREDIENTES BASE
// ----------------------------------------------------

async function fetchAdminIngredientsInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ingredients-info`);
    if (!res.ok) throw new Error("No se pudieron cargar los ingredientes base");
    appState.ingredientsInfo = await res.json();
  } catch (err) {
    console.error("Error al cargar ingredientes base:", err);
  }
}

function renderAdminIngredientsInfoTable() {
  const tbody = document.getElementById('admin-ingredients-info-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (appState.ingredientsInfo.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No hay información de ingredientes base registrada.</td></tr>`;
    return;
  }

  // Sort alphabetically by name
  const sorted = [...appState.ingredientsInfo].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach(i => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; color: var(--secondary-brown);">${i.name}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${i.vitamins || 'N/A'}</td>
      <td style="font-size: 0.8rem; color: var(--text-muted);">${i.benefits || 'N/A'}</td>
      <td class="admin-actions-cell">
        <button class="btn-icon btn-edit" onclick="editIngredientInfoInAdmin('${i.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon btn-delete" onclick="deleteIngredientInfoInAdmin('${i.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.showAddIngredientInfoForm = function() {
  document.getElementById('add-ingredient-info-form-container').style.display = 'block';
  document.getElementById('form-ingredient-info-title').textContent = 'Agregar Información de Ingrediente Base';
  document.getElementById('form-ingredient-info-id').value = '';
  document.getElementById('form-ingredient-info-name').value = '';
  document.getElementById('form-ingredient-info-vitamins').value = '';
  document.getElementById('form-ingredient-info-benefits').value = '';
};

window.hideIngredientInfoForm = function() {
  document.getElementById('add-ingredient-info-form-container').style.display = 'none';
};

window.editIngredientInfoInAdmin = function(id) {
  const i = appState.ingredientsInfo.find(item => item.id === id);
  if (!i) return;

  document.getElementById('add-ingredient-info-form-container').style.display = 'block';
  document.getElementById('form-ingredient-info-title').textContent = `Editar Ingrediente Base: ${i.name}`;
  document.getElementById('form-ingredient-info-id').value = i.id;
  document.getElementById('form-ingredient-info-name').value = i.name;
  document.getElementById('form-ingredient-info-vitamins').value = i.vitamins || '';
  document.getElementById('form-ingredient-info-benefits').value = i.benefits || '';
};

window.submitIngredientInfoForm = async function() {
  const id = document.getElementById('form-ingredient-info-id').value;
  const name = document.getElementById('form-ingredient-info-name').value.trim();
  const vitamins = document.getElementById('form-ingredient-info-vitamins').value.trim();
  const benefits = document.getElementById('form-ingredient-info-benefits').value.trim();

  if (!name) {
    alert('Ingresa el nombre del ingrediente base.');
    return;
  }

  const infoData = {
    id: id || null,
    name,
    vitamins: vitamins || null,
    benefits: benefits || null
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/ingredients-info`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appState.adminToken}`
      },
      body: JSON.stringify(infoData)
    });

    if (!res.ok) {
      if (res.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión.");
        logoutAdmin();
        return;
      }
      throw new Error("No se pudo guardar la información del ingrediente");
    }

    const data = await res.json();
    const savedInfo = data.ingredient_info;

    if (id) {
      const idx = appState.ingredientsInfo.findIndex(item => item.id === id);
      if (idx !== -1) appState.ingredientsInfo[idx] = savedInfo;
    } else {
      appState.ingredientsInfo.push(savedInfo);
    }

    hideIngredientInfoForm();
    renderAdminIngredientsInfoTable();
    alert('¡Información de ingrediente base guardada!');
  } catch (err) {
    alert("Error al guardar: " + err.message);
  }
};

window.deleteIngredientInfoInAdmin = async function(id) {
  if (confirm('¿Seguro que deseas eliminar la información de este ingrediente base?')) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ingredients-info/${id}`, {
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
        throw new Error("No se pudo eliminar el ingrediente base");
      }

      appState.ingredientsInfo = appState.ingredientsInfo.filter(item => item.id !== id);
      renderAdminIngredientsInfoTable();
      alert('¡Información de ingrediente base eliminada!');
    } catch (err) {
      alert("Error al eliminar ingrediente base: " + err.message);
    }
  }
};
