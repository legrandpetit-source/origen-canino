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

class CustomerLogin(BaseModel):
    email: str
    password: Optional[str] = None
    provider: Optional[str] = "email"

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
        "faqs": faqs
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
        provider=data.provider or "email"
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
    return {"token": token, "email": new_cust.email, "name": new_cust.name}

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
    return {"token": token, "email": cust.email, "name": cust.name}

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
