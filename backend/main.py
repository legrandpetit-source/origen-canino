import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import jwt
import bcrypt
from pydantic import BaseModel

from database import engine, get_db, Base
import models

# Create tables in the database if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Origen Canino API", version="1.0.0")

# CORS setup to allow frontend access (development & production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Secret & Algorithm
JWT_SECRET = os.getenv("JWT_SECRET", "origen_canino_super_secret_key_12345")
JWT_ALGORITHM = "HS256"

# ----------------------------------------------------
# PYDANTIC SCHEMAS (Validation)
# ----------------------------------------------------

class AdminLogin(BaseModel):
    username: str
    password: str

class ParametersUpdate(BaseModel):
    barf_price_per_kg: int
    cooked_price_per_kg: int
    barf_adult_sedentary: float
    barf_adult_normal: float
    barf_adult_active: float
    barf_adult_working: float
    cooked_adult_sedentary: float
    cooked_adult_normal: float
    cooked_adult_active: float
    cooked_adult_working: float
    puppy_early: float
    puppy_mid: float
    puppy_late: float
    shipping_cost: int

class RecipeCreate(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    price: int
    icon: str
    ingredients: str
    ingredients_array: Optional[List[str]] = None

class TestimonialCreate(BaseModel):
    id: Optional[str] = None
    author: str
    location: str
    dog_name: str
    photo_url: Optional[str] = None
    quote: str

class FaqCreate(BaseModel):
    id: Optional[str] = None
    question: str
    answer: str

class PetCreate(BaseModel):
    id: str
    name: str
    breed: str
    weight: float
    age: str
    activity: str
    notes: Optional[str] = None
    photo: Optional[str] = None
    subscription_paid: Optional[bool] = False
    selected_recipe_id: Optional[str] = None
    excluded_ingredients: Optional[List[str]] = None
    added_superfoods: Optional[List[str]] = None
    added_vegetables_fruits: Optional[List[str]] = None
    custom_instructions: Optional[str] = None
    address: Optional[str] = None
    delivery_period: Optional[int] = 30
    order_date: Optional[str] = None

class OrderCreate(BaseModel):
    order_id: str
    date: str
    pet_name: str
    pet_breed: str
    pet_weight: float
    pet_photo: Optional[str] = None
    recipe_name: str
    daily_grams: int
    monthly_kg: float
    snacks: Optional[str] = None
    total_price: int
    address: str
    paid_status: Optional[str] = "Verificado"
    production_status: Optional[str] = "Pendiente"

class OrderStatusUpdate(BaseModel):
    production_status: str

class AdditionalCreate(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    icon: str
    price: int
    vitamins: Optional[str] = None
    benefits: Optional[str] = None

class IngredientInfoCreate(BaseModel):
    id: Optional[str] = None
    name: str
    vitamins: Optional[str] = None
    benefits: Optional[str] = None

class LeadCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str

class CustomerRegister(BaseModel):
    email: str
    password: Optional[str] = None
    name: Optional[str] = None
    provider: Optional[str] = "email"
    phone: Optional[str] = None
    address: Optional[str] = None

class CustomerLogin(BaseModel):
    email: str
    password: Optional[str] = None
    provider: Optional[str] = "email"

class CustomerProfileUpdate(BaseModel):
    phone: str
    address: str


# ----------------------------------------------------
# AUTHENTICATION DEPENDENCY
# ----------------------------------------------------

def get_current_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorización faltante o inválido",
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token no contiene usuario",
            )
        return username
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

def get_current_customer(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de cliente faltante o inválido",
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None or role != "customer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token no es de cliente",
            )
        return email
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de cliente inválido o expirado",
        )

# Ensure at least default parameters and an admin user exist
@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    # 1. Create default parameters if not exist
    params = db.query(models.Parameter).filter(models.Parameter.id == "default").first()
    if not params:
        params = models.Parameter(id="default")
        db.add(params)
        db.commit()

    # 2. Create default admin if not exist
    admin = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if not admin:
        hashed = bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        admin = models.Admin(username="admin", password_hash=hashed)
        db.add(admin)
        db.commit()

    # 3. Seed default additionals if table is empty
    count = db.query(models.Additional).count()
    if count == 0:
        defaults = [
            # Superfoods
            models.Additional(id='sup-chia', name='Semillas de Chía', icon='🌱', price=1500, category='superfood', vitamins='Omega 3, Vitaminas del grupo B', benefits='Antiinflamatorio natural, mejora piel y pelaje, favorece salud articular.'),
            models.Additional(id='sup-coco', name='Aceite de Coco', icon='🥥', price=1500, category='superfood', vitamins='Ácidos grasos de cadena media (ácido láurico)', benefits='Fortalece el sistema inmune, mejora la digestión y combate el mal aliento.'),
            models.Additional(id='sup-levadura', name='Levadura Nutricional', icon='🌾', price=1500, category='superfood', vitamins='Vitaminas del complejo B, Zinc, Aminoácidos', benefits='Aporte de energía, fortalece defensas y realza el sabor de la comida.'),
            models.Additional(id='sup-curcuma', name='Cúrcuma & Pimienta', icon='🟡', price=1500, category='superfood', vitamins='Curcumina, Vitaminas C y E, antioxidantes', benefits='Potente antiinflamatorio natural, protector hepático y mejora la digestión.'),
            # Veg & Fruits
            models.Additional(id='vf-betarraga', name='Betarraga', icon='🍠', price=1500, category='vegfruit', vitamins='Vitamina C, Hierro, Potasio, Ácido fólico', benefits='Mejora la circulación sanguínea, aporta energía y favorece la digestión.'),
            models.Additional(id='vf-manzana', name='Manzana', icon='🍎', price=1500, category='vegfruit', vitamins='Vitamina C, A, Potasio, Pectina (fibra)', benefits='Ayuda a limpiar los dientes, mejora el tránsito intestinal y saciedad.'),
            models.Additional(id='vf-zapallo', name='Zapallo Camote', icon='🎃', price=1500, category='vegfruit', vitamins='Vitamina A (betacaroteno), C, E, Potasio', benefits='Excelente para la digestión, ayuda a regular el tránsito intestinal.'),
            models.Additional(id='vf-arandanos', name='Arándanos', icon='🫐', price=1500, category='vegfruit', vitamins='Vitamina C, K, antioxidantes naturales', benefits='Previene infecciones urinarias y combate el envejecimiento celular.'),
            models.Additional(id='vf-zanahoria', name='Zanahoria', icon='🥕', price=1500, category='vegfruit', vitamins='Vitamina A (betacaroteno), K, Calcio', benefits='Favorece la salud visual, limpia dientes mecánicamente y aporta fibra.'),
            models.Additional(id='vf-espinaca', name='Espinaca', icon='🥬', price=1500, category='vegfruit', vitamins='Hierro, Calcio, Vitamina K, A, Ácido fólico', benefits='Favorece la salud ósea, combate la anemia y es rica en antioxidantes.'),
        ]
        for d in defaults:
            db.add(d)
        db.commit()

    # 4. Seed default ingredients info if table is empty
    count_ing = db.query(models.IngredientInfo).count()
    if count_ing == 0:
        default_ings = [
            models.IngredientInfo(id='ing-1', name='Hueso de pollo triturado', vitamins='Calcio, Fósforo, Vitamina D', benefits='Aporte mineral de fácil absorción para mantener huesos fuertes y dientes sanos.'),
            models.IngredientInfo(id='ing-2', name='Carne magra de pollo', vitamins='Proteína de alto valor biológico, Vitamina B3, B6', benefits='Ayuda en la construcción de masa muscular magra, fácil digestión y energía diaria.'),
            models.IngredientInfo(id='ing-3', name='Hígado de pollo', vitamins='Vitamina A, Hierro, Cobre, Vitamina B12', benefits='Combate la anemia, favorece una excelente visión y la salud de la piel.'),
            models.IngredientInfo(id='ing-4', name='Vísceras trituradas', vitamins='Vitaminas del complejo B, Hierro, Zinc', benefits='Aporte concentrado de nutrientes esenciales para el soporte de órganos vitales.'),
            models.IngredientInfo(id='ing-5', name='Espinaca fresca', vitamins='Hierro, Calcio, Vitamina K, Ácido fólico', benefits='Aporte de fibra vegetal, ayuda a combatir la anemia y favorece el sistema óseo.'),
            models.IngredientInfo(id='ing-6', name='Zanahoria picada', vitamins='Vitamina A (betacaroteno), K, Fibra', benefits='Promueve una visión saludable, mejora el pelaje y ayuda a fortalecer el sistema inmune.'),
            models.IngredientInfo(id='ing-7', name='betarraga', vitamins='Vitamina C, Hierro, Potasio, Fibra soluble', benefits='Aporta energía natural, promueve la salud digestiva y la oxigenación celular.'),
            models.IngredientInfo(id='ing-8', name='Carne magra de res', vitamins='Proteínas de alta calidad, Hierro, Zinc, Vitamina B12', benefits='Desarrollo y mantenimiento de masa muscular fuerte, energía y sistema inmune.'),
            models.IngredientInfo(id='ing-9', name='Hueso de vacuno molido', vitamins='Calcio, Fósforo, Magnesio', benefits='Excelente fuente mineral natural equilibrada para la integridad de la estructura ósea.'),
            models.IngredientInfo(id='ing-10', name='Hígado de res', vitamins='Vitamina A, B12, Hierro, Cobre', benefits='El superalimento de la naturaleza; aporta vitalidad, energía y salud inmunológica.'),
            models.IngredientInfo(id='ing-11', name='Vísceras (bofe/riñón)', vitamins='Vitaminas del grupo B, Selenio, Fósforo', benefits='Gran fuente de enzimas y minerales traza para la desintoxicación y metabolismo.'),
            models.IngredientInfo(id='ing-12', name='Manzana verde', vitamins='Vitamina C, Potasio, Fibra pectina', benefits='Ayuda a limpiar los dientes y su fibra pectina promueve una flora intestinal sana.'),
            models.IngredientInfo(id='ing-13', name='Zanahoria', vitamins='Vitamina A (betacaroteno), K', benefits='Promueve una visión excelente, piel elástica y un pelaje brillante.'),
            models.IngredientInfo(id='ing-14', name='Carne magra de pavo', vitamins='Proteínas magras de alta calidad, Selenio, Vitamina B6', benefits='Excelente alternativa hipoalergénica, ideal para control de peso corporal.'),
            models.IngredientInfo(id='ing-15', name='Filete de salmón', vitamins='Omega 3 (EPA/DHA), Vitamina D, Selenio', benefits='Potente efecto antiinflamatorio para articulaciones; promueve piel y pelo brillantes.'),
            models.IngredientInfo(id='ing-16', name='Hueso de pavo triturado', vitamins='Calcio, Fósforo', benefits='Fuente de minerales esenciales naturales de muy fácil asimilación y digestión.'),
            models.IngredientInfo(id='ing-17', name='Hígado de pavo', vitamins='Vitamina A, Complejo B, Hierro', benefits='Refuerza el sistema hematopoyético (sangre) y promueve defensas altas.'),
            models.IngredientInfo(id='ing-18', name='Acelga fresca', vitamins='Vitamina K, C, Magnesio, Hierro', benefits='Efecto antioxidante, favorece la coagulación sana y la salud de los vasos sanguíneos.'),
            models.IngredientInfo(id='ing-19', name='Arándanos silvestres', vitamins='Vitaminas C, E, Potentes antioxidantes', benefits='Combate el daño celular oxidativo, protege el cerebro y las vías urinarias.'),
            models.IngredientInfo(id='ing-20', name='Pechuga de pollo cocida', vitamins='Proteína de alta digestibilidad, baja en grasa', benefits='Ideal para estómagos delicados o en periodo de transición de dieta.'),
            models.IngredientInfo(id='ing-21', name='Trutro de pollo cocido', vitamins='Proteínas de alta asimilación, Grasa saludable', benefits='Excelente sabor y aporte calórico óptimo para perros activos.'),
            models.IngredientInfo(id='ing-22', name='Zapallo camote al vapor', vitamins='Fibra soluble, Vitamina A, C, Potasio', benefits='Excelente regulador digestivo natural; idóneo contra diarrea o estreñimiento.'),
            models.IngredientInfo(id='ing-23', name='Zanahoria cocida', vitamins='Vitamina A, Carotenos, Fibra suave', benefits='Muy digerible y suave para el estómago, promueve la hidratación celular.'),
            models.IngredientInfo(id='ing-24', name='Arroz integral cocido', vitamins='Vitaminas del complejo B, Manganeso, Fibra', benefits='Carbohidrato complejo que aporta energía constante y de liberación lenta.'),
            models.IngredientInfo(id='ing-25', name='Aceite de oliva', vitamins='Vitamina E, Polifenoles, Grasas saludables', benefits='Mejora la elasticidad de la piel, da brillo al pelaje y protege el corazón.'),
            models.IngredientInfo(id='ing-26', name='Posta de vacuno picada', vitamins='Proteína de alta calidad, Hierro de fácil absorción', benefits='Promueve el apetito y ayuda al crecimiento muscular saludable.'),
            models.IngredientInfo(id='ing-27', name='Camote al vapor', vitamins='Vitamina A, Potasio, Fibra digestiva', benefits='Carbohidrato saludable de bajo índice glucémico, excelente fuente de energía.'),
            models.IngredientInfo(id='ing-28', name='Espinaca al vapor', vitamins='Hierro, Ácido fólico, Vitamina K', benefits='Minerales y vitaminas en forma altamente absorbible para la vitalidad.'),
            models.IngredientInfo(id='ing-29', name='Arvejas tiernas', vitamins='Vitamina C, A, Proteínas vegetales, Fibra', benefits='Aportan fibra saludable para el intestino y antioxidantes protectores.'),
            models.IngredientInfo(id='ing-30', name='Hígado de res cocido', vitamins='Vitamina A, B12, Hierro, Ácido fólico', benefits='Soporte nutricional máximo en periodos de crecimiento o alta demanda energética.'),
            models.IngredientInfo(id='ing-31', name='Pulpa de cerdo cocida', vitamins='Proteína, Tiamina (Vitamina B1), Zinc', benefits='Excelente perfil de aminoácidos esenciales para el desarrollo muscular activo.'),
            models.IngredientInfo(id='ing-32', name='Manzana roja cocida', vitamins='Vitamina C, Pectina (fibra suave)', benefits='Calma la mucosa gástrica y apoya el tránsito intestinal de forma muy suave.'),
            models.IngredientInfo(id='ing-33', name='Avena integral cocida', vitamins='Fibra soluble (betaglucanos), Vitaminas del grupo B', benefits='Apoya el sistema nervioso, regula la digestión y brinda saciedad.'),
            models.IngredientInfo(id='ing-34', name='Carbonato de calcio', vitamins='Calcio puro', benefits='Suplemento mineral necesario para equilibrar la relación calcio/fósforo de las carnes.')
        ]
        for d in default_ings:
            db.add(d)
        db.commit()

    db.close()

# ----------------------------------------------------
# PUBLIC ENDPOINTS
# ----------------------------------------------------

@app.get("/api/config")
def get_config(db: Session = Depends(get_db)):
    """Fetch active catalog, parameters, testimonials, and FAQs for initial loading."""
    recipes = db.query(models.Recipe).all()
    snacks = db.query(models.Snack).all()
    params = db.query(models.Parameter).filter(models.Parameter.id == "default").first()
    testimonials = db.query(models.Testimonial).all()
    faqs = db.query(models.Faq).all()
    additionals = db.query(models.Additional).all()
    ingredients_info = db.query(models.IngredientInfo).all()

    # If parameters somehow don't exist, use default values
    params_dict = {}
    if params:
        params_dict = {
            "barf_price_per_kg": params.barf_price_per_kg,
            "cooked_price_per_kg": params.cooked_price_per_kg,
            "barf_adult_sedentary": params.barf_adult_sedentary,
            "barf_adult_normal": params.barf_adult_normal,
            "barf_adult_active": params.barf_adult_active,
            "barf_adult_working": params.barf_adult_working,
            "cooked_adult_sedentary": params.cooked_adult_sedentary,
            "cooked_adult_normal": params.cooked_adult_normal,
            "cooked_adult_active": params.cooked_adult_active,
            "cooked_adult_working": params.cooked_adult_working,
            "puppy_early": params.puppy_early,
            "puppy_mid": params.puppy_mid,
            "puppy_late": params.puppy_late,
            "shipping_cost": params.shipping_cost if params.shipping_cost is not None else 5000,
        }

    return {
        "recipes": recipes,
        "snacks": snacks,
        "params": params_dict,
        "testimonials": testimonials,
        "faqs": faqs,
        "additionals": additionals,
        "ingredients_info": ingredients_info
    }

@app.get("/api/pets/{pet_id}")
def get_pet(pet_id: str, db: Session = Depends(get_db)):
    """Retrieve a single pet by ID."""
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Mascota no encontrada")
    return pet

@app.post("/api/pets")
def save_or_update_pet(pet_data: PetCreate, db: Session = Depends(get_db)):
    """Create a new pet profile or update an existing one."""
    existing_pet = db.query(models.Pet).filter(models.Pet.id == pet_data.id).first()

    if existing_pet:
        # Update existing
        for key, value in pet_data.model_dump().items():
            setattr(existing_pet, key, value)
        db.commit()
        db.refresh(existing_pet)
        return {"status": "success", "pet": existing_pet}
    else:
        # Create new
        new_pet = models.Pet(**pet_data.model_dump())
        db.add(new_pet)
        db.commit()
        db.refresh(new_pet)
        return {"status": "success", "pet": new_pet}

@app.post("/api/orders")
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    """Saves a checkout order / subscription and updates corresponding pet payment status."""
    cust_id = None
    cust_email = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            email = payload.get("sub")
            role = payload.get("role")
            if email and role == "customer":
                cust = db.query(models.Customer).filter(models.Customer.email == email).first()
                if cust:
                    cust_id = cust.id
                    cust_email = cust.email
        except jwt.PyJWTError:
            pass

    # Create new order record
    order_dict = order_data.model_dump()
    order_dict["customer_id"] = cust_id
    order_dict["customer_email"] = cust_email
    
    new_order = models.Order(**order_dict)
    db.add(new_order)

    # If this is for specific pets, mark those pets as paid in the database
    # In multi-pet checkout, names are comma separated (e.g. Toby, Mateo)
    pet_names = [name.strip() for name in order_data.pet_name.split(",")]
    for name in pet_names:
        # We find unpaid pets matching this name and mark them paid
        query = db.query(models.Pet).filter(
            models.Pet.name == name, 
            models.Pet.subscription_paid == False
        )
        if cust_email:
            query = query.filter(models.Pet.customer_email == cust_email)
        
        pets = query.all()
        for pet in pets:
            pet.subscription_paid = True
            pet.address = order_data.address
            pet.order_date = order_data.date

    db.commit()
    return {"status": "success", "order_id": order_data.order_id}

@app.post("/api/leads")
def save_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    """Save user inquiries from PPV Soluciones Informáticas footer modal."""
    new_lead = models.Lead(
        id=f"lead-{int(datetime.now().timestamp() * 1000)}",
        name=lead_data.name,
        email=lead_data.email,
        phone=lead_data.phone,
        message=lead_data.message,
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_lead)
    db.commit()
    return {"status": "success"}

@app.get("/api/admin/leads")
def get_leads(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Retrieve all user inquiries/leads sorted by date descending."""
    leads = db.query(models.Lead).order_by(models.Lead.date.desc()).all()
    return leads

@app.delete("/api/admin/leads/{lead_id}")
def delete_lead(lead_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete a lead by ID."""
    lead = db.query(models.Lead).filter(models.Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
    db.delete(lead)
    db.commit()
    return {"status": "success"}

# ----------------------------------------------------
# CUSTOMER AUTHENTICATION & PRIVATE ENDPOINTS
# ----------------------------------------------------

@app.post("/api/customer/register")
def register_customer(data: CustomerRegister, db: Session = Depends(get_db)):
    """Register a new customer account."""
    existing = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    hashed_pass = None
    if data.password:
        hashed_pass = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        
    new_cust = models.Customer(
        email=data.email,
        password_hash=hashed_pass,
        name=data.name or data.email.split("@")[0],
        provider=data.provider or "email",
        phone=data.phone,
        address=data.address
    )
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    
    token_payload = {
        "sub": new_cust.email,
        "role": "customer",
        "exp": datetime.utcnow().timestamp() + 86400 * 30 # 30 days
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"token": token, "email": new_cust.email, "name": new_cust.name, "phone": new_cust.phone, "address": new_cust.address}

@app.post("/api/customer/login")
def login_customer(data: CustomerLogin, db: Session = Depends(get_db)):
    """Authenticate customer (standard or social login)."""
    cust = db.query(models.Customer).filter(models.Customer.email == data.email).first()
    
    if data.provider in ["google", "apple"]:
        if not cust:
            cust = models.Customer(
                email=data.email,
                name=data.email.split("@")[0],
                provider=data.provider
            )
            db.add(cust)
            db.commit()
            db.refresh(cust)
    else:
        if not cust or not cust.password_hash:
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        if not bcrypt.checkpw(data.password.encode("utf-8"), cust.password_hash.encode("utf-8")):
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
            
    token_payload = {
        "sub": cust.email,
        "role": "customer",
        "exp": datetime.utcnow().timestamp() + 86400 * 30 # 30 days
    }
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"token": token, "email": cust.email, "name": cust.name, "phone": cust.phone, "address": cust.address}


@app.post("/api/customer/profile")
def update_customer_profile(profile_data: CustomerProfileUpdate, db: Session = Depends(get_db), customer_email: str = Depends(get_current_customer)):
    """Update customer contact phone and delivery address."""
    cust = db.query(models.Customer).filter(models.Customer.email == customer_email).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    cust.phone = profile_data.phone
    cust.address = profile_data.address
    db.commit()
    db.refresh(cust)
    return {"status": "success", "email": cust.email, "name": cust.name, "phone": cust.phone, "address": cust.address}


@app.get("/api/customer/pets")
def get_customer_pets(db: Session = Depends(get_db), customer_email: str = Depends(get_current_customer)):
    """Retrieve all pet profiles owned by the logged-in customer."""
    pets = db.query(models.Pet).filter(models.Pet.customer_email == customer_email).all()
    return pets

@app.post("/api/customer/pets")
def save_customer_pet(pet_data: PetCreate, db: Session = Depends(get_db), customer_email: str = Depends(get_current_customer)):
    """Create or update a pet profile linked to the logged-in customer."""
    cust = db.query(models.Customer).filter(models.Customer.email == customer_email).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
        
    existing_pet = db.query(models.Pet).filter(models.Pet.id == pet_data.id).first()
    
    attrs = pet_data.model_dump()
    attrs["customer_id"] = cust.id
    attrs["customer_email"] = cust.email
    
    if existing_pet:
        if existing_pet.customer_email != customer_email and existing_pet.customer_email is not None:
            raise HTTPException(status_code=403, detail="No tienes permisos para modificar esta mascota")
        for key, value in attrs.items():
            setattr(existing_pet, key, value)
        db.commit()
        db.refresh(existing_pet)
        return {"status": "success", "pet": existing_pet}
    else:
        new_pet = models.Pet(**attrs)
        db.add(new_pet)
        db.commit()
        db.refresh(new_pet)
        return {"status": "success", "pet": new_pet}

@app.get("/api/customer/orders")
def get_customer_orders(db: Session = Depends(get_db), customer_email: str = Depends(get_current_customer)):
    """Retrieve subscription history for the logged-in customer."""
    orders = db.query(models.Order).filter(models.Order.customer_email == customer_email).all()
    return orders

# ----------------------------------------------------
# ADMIN AUTH & PRIVATE ENDPOINTS
# ----------------------------------------------------

@app.post("/api/admin/login")
def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """Log in administrator, returns JWT token."""
    admin = db.query(models.Admin).filter(models.Admin.username == login_data.username).first()
    if not admin or not bcrypt.checkpw(login_data.password.encode("utf-8"), admin.password_hash.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
        )

    # Generate token
    token_payload = {"sub": admin.username, "exp": datetime.utcnow().timestamp() + 86400} # 24 hrs
    token = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"token": token, "username": admin.username}

@app.post("/api/config/parameters")
def save_parameters(params_data: ParametersUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Save system-wide calculation multipliers and base pricing."""
    params = db.query(models.Parameter).filter(models.Parameter.id == "default").first()
    if not params:
        params = models.Parameter(id="default")
        db.add(params)

    for key, value in params_data.model_dump().items():
        setattr(params, key, value)

    # Sync base prices in recipes table
    db.query(models.Recipe).filter(models.Recipe.category == "barf").update({"price": params_data.barf_price_per_kg})
    db.query(models.Recipe).filter(models.Recipe.category == "cooked").update({"price": params_data.cooked_price_per_kg})

    db.commit()
    return {"status": "success"}

@app.post("/api/recipes")
def save_recipe(recipe_data: RecipeCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create or update a recipe/catalog product."""
    recipe_dict = recipe_data.model_dump()
    if not recipe_dict.get("id"):
        # Create new
        # Generate ID (e.g. b-1234 or s-1234)
        prefix = "b-" if recipe_data.category == "barf" else ("c-" if recipe_data.category == "cooked" else "s-")
        import random
        recipe_dict["id"] = prefix + str(random.randint(1000, 9999))
        
        new_recipe = models.Recipe(**recipe_dict)
        db.add(new_recipe)
        db.commit()
        return {"status": "success", "recipe": new_recipe}
    else:
        # Update existing
        recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_data.id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        for key, value in recipe_dict.items():
            setattr(recipe, key, value)
        db.commit()
        return {"status": "success", "recipe": recipe}

@app.delete("/api/recipes/{recipe_id}")
def delete_recipe(recipe_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete a recipe from the catalog."""
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if not recipe:
        # Check in snacks
        snack = db.query(models.Snack).filter(models.Snack.id == recipe_id).first()
        if not snack:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        db.delete(snack)
    else:
        db.delete(recipe)
    db.commit()
    return {"status": "success"}

@app.post("/api/testimonials")
def save_testimonial(test_data: TestimonialCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create or update customer testimonial."""
    test_dict = test_data.model_dump()
    if not test_dict.get("id"):
        test_dict["id"] = f"t-{int(datetime.now().timestamp() * 1000)}"
        new_test = models.Testimonial(**test_dict)
        db.add(new_test)
        db.commit()
        return {"status": "success", "testimonial": new_test}
    else:
        test = db.query(models.Testimonial).filter(models.Testimonial.id == test_data.id).first()
        if not test:
            raise HTTPException(status_code=404, detail="Testimonio no encontrado")
        for key, value in test_dict.items():
            setattr(test, key, value)
        db.commit()
        return {"status": "success", "testimonial": test}

@app.delete("/api/testimonials/{test_id}")
def delete_testimonial(test_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete a customer testimonial."""
    test = db.query(models.Testimonial).filter(models.Testimonial.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Testimonio no encontrado")
    db.delete(test)
    db.commit()
    return {"status": "success"}

@app.post("/api/faqs")
def save_faq(faq_data: FaqCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create or update FAQ."""
    faq_dict = faq_data.model_dump()
    if not faq_dict.get("id"):
        faq_dict["id"] = f"f-{int(datetime.now().timestamp() * 1000)}"
        new_faq = models.Faq(**faq_dict)
        db.add(new_faq)
        db.commit()
        return {"status": "success", "faq": new_faq}
    else:
        faq = db.query(models.Faq).filter(models.Faq.id == faq_data.id).first()
        if not faq:
            raise HTTPException(status_code=404, detail="FAQ no encontrada")
        for key, value in faq_dict.items():
            setattr(faq, key, value)
        db.commit()
        return {"status": "success", "faq": faq}

@app.delete("/api/faqs/{faq_id}")
def delete_faq(faq_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete a FAQ."""
    faq = db.query(models.Faq).filter(models.Faq.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ no encontrada")
    db.delete(faq)
    db.commit()
    return {"status": "success"}

@app.get("/api/additionals")
def get_additionals(db: Session = Depends(get_db)):
    """Fetch all superfoods and vegetables/fruits."""
    return db.query(models.Additional).all()

@app.post("/api/additionals")
def save_additional(additional_data: AdditionalCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create or update a superfood or vegetable/fruit addition."""
    add_dict = additional_data.model_dump()
    if not add_dict.get("id"):
        # Generate new ID if not provided
        prefix = "sup-" if additional_data.category == "superfood" else "vf-"
        import random
        add_dict["id"] = prefix + str(random.randint(10000, 99999))
        
        new_add = models.Additional(**add_dict)
        db.add(new_add)
        db.commit()
        db.refresh(new_add)
        return {"status": "success", "additional": new_add}
    else:
        # Update existing
        additional = db.query(models.Additional).filter(models.Additional.id == additional_data.id).first()
        if not additional:
            # If id was provided but does not exist, let's create it as a new one
            new_add = models.Additional(**add_dict)
            db.add(new_add)
            db.commit()
            db.refresh(new_add)
            return {"status": "success", "additional": new_add}
        for key, value in add_dict.items():
            setattr(additional, key, value)
        db.commit()
        db.refresh(additional)
        return {"status": "success", "additional": additional}

@app.delete("/api/additionals/{additional_id}")
def delete_additional(additional_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete an additional by ID."""
    additional = db.query(models.Additional).filter(models.Additional.id == additional_id).first()
    if not additional:
        raise HTTPException(status_code=404, detail="Adicional no encontrado")
    db.delete(additional)
    db.commit()
    return {"status": "success"}

@app.get("/api/ingredients-info")
def get_all_ingredients_info(db: Session = Depends(get_db)):
    """Fetch all base ingredients info (vitamins and benefits)."""
    return db.query(models.IngredientInfo).all()

@app.post("/api/ingredients-info")
def save_ingredient_info(info_data: IngredientInfoCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create or update base ingredient information."""
    info_dict = info_data.model_dump()
    if not info_dict.get("id"):
        # Generate new ID if not provided
        import random
        info_dict["id"] = "ing-" + str(random.randint(10000, 99999))
        
        new_info = models.IngredientInfo(**info_dict)
        db.add(new_info)
        db.commit()
        db.refresh(new_info)
        return {"status": "success", "ingredient_info": new_info}
    else:
        # Update existing
        info = db.query(models.IngredientInfo).filter(models.IngredientInfo.id == info_data.id).first()
        if not info:
            new_info = models.IngredientInfo(**info_dict)
            db.add(new_info)
            db.commit()
            db.refresh(new_info)
            return {"status": "success", "ingredient_info": new_info}
        for key, value in info_dict.items():
            setattr(info, key, value)
        db.commit()
        db.refresh(info)
        return {"status": "success", "ingredient_info": info}

@app.delete("/api/ingredients-info/{info_id}")
def delete_ingredient_info(info_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete a base ingredient info record by ID."""
    info = db.query(models.IngredientInfo).filter(models.IngredientInfo.id == info_id).first()
    if not info:
        raise HTTPException(status_code=404, detail="Información de ingrediente no encontrada")
    db.delete(info)
    db.commit()
    return {"status": "success"}

# ----------------------------------------------------
# ADMIN USER MANAGEMENT ENDPOINTS (PROTECTED)
# ----------------------------------------------------

@app.get("/api/admin/users")
def get_admin_users(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Retrieve all admin users."""
    users = db.query(models.Admin).all()
    return [{"id": u.id, "username": u.username} for u in users]

@app.post("/api/admin/users")
def create_admin_user(user_data: AdminLogin, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Create a new administrator user."""
    existing = db.query(models.Admin).filter(models.Admin.username == user_data.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )
    
    hashed = bcrypt.hashpw(user_data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    new_user = models.Admin(username=user_data.username, password_hash=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "success", "user": {"id": new_user.id, "username": new_user.username}}

@app.put("/api/admin/users/{user_id}")
def update_admin_user(user_id: int, user_data: AdminLogin, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Update administrator username and/or password."""
    target_user = db.query(models.Admin).filter(models.Admin.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_data.username != target_user.username:
        existing = db.query(models.Admin).filter(models.Admin.username == user_data.username).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )
        target_user.username = user_data.username
        
    if user_data.password and user_data.password.strip() != "":
        hashed = bcrypt.hashpw(user_data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        target_user.password_hash = hashed
        
    db.commit()
    return {"status": "success", "user": {"id": target_user.id, "username": target_user.username}}

@app.delete("/api/admin/users/{user_id}")
def delete_admin_user(user_id: int, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Delete an administrator user."""
    target_user = db.query(models.Admin).filter(models.Admin.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    if target_user.username == admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminar tu propio usuario activo"
        )
        
    total_admins = db.query(models.Admin).count()
    if total_admins <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el único administrador restante"
        )
        
    db.delete(target_user)
    db.commit()
    return {"status": "success"}

@app.get("/api/admin/orders")
def get_orders(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Retrieve all sales and subscription requests."""
    orders = db.query(models.Order).order_by(models.Order.id.desc()).all()
    return orders

def calculate_pet_portion(db: Session, weight: float, age: str, activity: str, diet_type: str, days: int = 30):
    import math
    params = db.query(models.Parameter).filter(models.Parameter.id == "default").first()
    if not params:
        # Fallback values
        barf_adult_sedentary = 2.0
        barf_adult_normal = 2.5
        barf_adult_active = 3.0
        barf_adult_working = 3.5
        cooked_adult_sedentary = 3.0
        cooked_adult_normal = 3.5
        cooked_adult_active = 4.0
        cooked_adult_working = 4.5
        puppy_early = 8.0
        puppy_mid = 6.0
        puppy_late = 4.0
    else:
        barf_adult_sedentary = params.barf_adult_sedentary
        barf_adult_normal = params.barf_adult_normal
        barf_adult_active = params.barf_adult_active
        barf_adult_working = params.barf_adult_working
        cooked_adult_sedentary = params.cooked_adult_sedentary
        cooked_adult_normal = params.cooked_adult_normal
        cooked_adult_active = params.cooked_adult_active
        cooked_adult_working = params.cooked_adult_working
        puppy_early = params.puppy_early
        puppy_mid = params.puppy_mid
        puppy_late = params.puppy_late

    percentage = 2.5
    if age == 'adult':
        key = f"{diet_type}_adult_{activity}"
        if params and hasattr(params, key):
            percentage = getattr(params, key)
        else:
            if diet_type == 'barf':
                percentages = {'sedentary': barf_adult_sedentary, 'normal': barf_adult_normal, 'active': barf_adult_active, 'working': barf_adult_working}
            else:
                percentages = {'sedentary': cooked_adult_sedentary, 'normal': cooked_adult_normal, 'active': cooked_adult_active, 'working': cooked_adult_working}
            percentage = percentages.get(activity, 2.5)
    else:
        if age == 'puppy':
            percentage = puppy_early
        elif age == 'puppy-mid':
            percentage = puppy_mid
        elif age == 'puppy-late':
            percentage = puppy_late

    daily_grams = round(weight * (percentage / 100.0) * 1000)
    monthly_kg = math.ceil((daily_grams * days) / 1000.0)
    return daily_grams, monthly_kg

def parse_order_pets(order, db: Session):
    import re
    import math
    pet_names = [name.strip() for name in order.pet_name.split(",")]
    parsed_pets = []
    
    # Try to parse from order.pet_breed
    # Example: "Canelo (10kg, Poodle) | Morocha (15kg, Labrador)"
    breed_map = {}
    weight_map = {}
    if order.pet_breed:
        segments = order.pet_breed.split("|")
        for seg in segments:
            match = re.match(r"\s*([^(]+)\s*\(([\d.]+)\s*kg,\s*([^)]+)\)", seg)
            if match:
                p_name = match.group(1).strip()
                p_weight = float(match.group(2))
                p_breed = match.group(3).strip()
                breed_map[p_name] = p_breed
                weight_map[p_name] = p_weight
            else:
                match_w = re.search(r"\(([\d.]+)\s*kg", seg)
                match_n = re.match(r"\s*([^(]+)", seg)
                if match_n and match_w:
                    p_name = match_n.group(1).strip()
                    weight_map[p_name] = float(match_w.group(1))

    # Try to parse from order.recipe_name
    # Example: "Canelo: BARF Pollo Premium [Suplementos: Coco]; Morocha: Vacuno Cocido"
    recipe_map = {}
    if order.recipe_name:
        segments = order.recipe_name.split(";")
        for seg in segments:
            if ":" in seg:
                parts = seg.split(":", 1)
                p_name = parts[0].strip()
                p_recipe = parts[1].strip()
                recipe_map[p_name] = p_recipe

    total_parsed_weight = sum(weight_map.values()) if weight_map else 0

    for name in pet_names:
        # Find in DB
        pet_query = db.query(models.Pet).filter(models.Pet.name == name)
        if order.customer_email:
            pet_query = pet_query.filter(models.Pet.customer_email == order.customer_email)
        pet = pet_query.first()
        
        breed = pet.breed if pet else breed_map.get(name, order.pet_breed or "Mestizo")
        weight = pet.weight if pet else weight_map.get(name, order.pet_weight or 10.0)
        excluded_ingredients = pet.excluded_ingredients if (pet and pet.excluded_ingredients) else []
        custom_instructions = pet.custom_instructions if (pet and pet.custom_instructions) else ""
        notes = pet.notes if (pet and pet.notes) else ""
        
        recipe_desc = recipe_map.get(name)
        if not recipe_desc:
            if pet and pet.selected_recipe_id:
                db_recipe = db.query(models.Recipe).filter(models.Recipe.id == pet.selected_recipe_id).first()
                if db_recipe:
                    recipe_desc = db_recipe.name
            else:
                recipe_desc = order.recipe_name or "Fórmula Especial"
            
        daily_grams = 0
        monthly_kg = 0.0
        
        if pet:
            diet_type = "barf"
            if pet.selected_recipe_id:
                db_recipe = db.query(models.Recipe).filter(models.Recipe.id == pet.selected_recipe_id).first()
                if db_recipe and db_recipe.category in ["barf", "cooked"]:
                    diet_type = db_recipe.category
            
            days = pet.delivery_period if pet.delivery_period else 30
            try:
                dg, mkg = calculate_pet_portion(db, pet.weight, pet.age, pet.activity, diet_type, days)
                daily_grams = dg
                monthly_kg = float(mkg)
            except Exception:
                pass
                
        if daily_grams == 0 or monthly_kg == 0.0:
            if len(pet_names) == 1:
                daily_grams = order.daily_grams
                monthly_kg = order.monthly_kg
            else:
                pet_weight = weight
                total_w = total_parsed_weight if total_parsed_weight > 0 else (order.pet_weight or (10.0 * len(pet_names)))
                ratio = pet_weight / total_w if total_w > 0 else (1.0 / len(pet_names))
                
                daily_grams = round(order.daily_grams * ratio)
                monthly_kg = round(order.monthly_kg * ratio, 1)
                if monthly_kg == 0.0:
                    monthly_kg = 1.0

        parsed_pets.append({
            "name": name,
            "breed": breed,
            "weight": weight,
            "recipe": recipe_desc,
            "daily_grams": daily_grams,
            "monthly_kg": monthly_kg,
            "excluded_ingredients": excluded_ingredients,
            "custom_instructions": custom_instructions,
            "notes": notes
        })
        
    return parsed_pets

@app.put("/api/admin/orders/{order_id}/status")
def update_order_status(
    order_id: int, 
    status_data: OrderStatusUpdate, 
    db: Session = Depends(get_db), 
    admin: str = Depends(get_current_admin)
):
    """Update production status of an order."""
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    valid_statuses = [
        "Pendiente", 
        "En Preparación", 
        "Porcionado y Empacado", 
        "Congelación", 
        "Listo para Despacho", 
        "En Camino", 
        "Entregado"
    ]
    if status_data.production_status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Estado de producción inválido")
        
    order.production_status = status_data.production_status
    db.commit()
    db.refresh(order)
    return {"status": "success", "production_status": order.production_status}

@app.get("/api/admin/orders/{order_id}/labels")
def get_order_labels(
    order_id: int, 
    db: Session = Depends(get_db), 
    admin: str = Depends(get_current_admin)
):
    """Retrieve portion labels for a specific order, calculated into 1kg bags."""
    import math
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    customer_name = ""
    if order.customer_email:
        cust = db.query(models.Customer).filter(models.Customer.email == order.customer_email).first()
        if cust and cust.name:
            customer_name = cust.name
            
    try:
        pets_data = parse_order_pets(order, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar mascotas del pedido: {str(e)}")
        
    all_labels = []
    for pet in pets_data:
        monthly_kg = pet["monthly_kg"]
        num_bags = int(math.ceil(monthly_kg))
        if num_bags <= 0:
            num_bags = 1
            
        for bag_idx in range(1, num_bags + 1):
            if bag_idx == num_bags:
                bag_weight = round(monthly_kg - (num_bags - 1), 2)
                if bag_weight <= 0:
                    bag_weight = 1.0
            else:
                bag_weight = 1.0
                
            all_labels.append({
                "pet_name": pet["name"],
                "breed": pet["breed"],
                "weight": pet["weight"],
                "recipe": pet["recipe"],
                "daily_grams": pet["daily_grams"],
                "bag_index": bag_idx,
                "total_bags": num_bags,
                "bag_weight": bag_weight,
                "excluded_ingredients": pet["excluded_ingredients"],
                "custom_instructions": pet["custom_instructions"],
                "notes": pet["notes"],
                "customer_name": customer_name or order.customer_email or "Cliente Origen Canino",
                "order_display_id": order.order_id,
                "date": order.date
            })
            
    return {
        "order_id": order.id,
        "order_display_id": order.order_id,
        "date": order.date,
        "customer_email": order.customer_email,
        "customer_name": customer_name,
        "labels": all_labels
    }
