from sqlalchemy import Column, String, Integer, Float, Boolean, Text, JSON
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # barf, cooked
    price = Column(Integer, nullable=False)
    icon = Column(String(20))
    ingredients = Column(Text, nullable=False)
    ingredients_array = Column(JSON, nullable=True)  # List of ingredients

class Snack(Base):
    __tablename__ = "snacks"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # snack
    price = Column(Integer, nullable=False)
    icon = Column(String(20))
    ingredients = Column(Text, nullable=False)
    unit = Column(String(50), nullable=False)  # e.g., '5 uds'

class Parameter(Base):
    __tablename__ = "parameters"

    # We will only have 1 active configuration row (id = "default")
    id = Column(String(50), primary_key=True, default="default")
    barf_price_per_kg = Column(Integer, default=4200)
    cooked_price_per_kg = Column(Integer, default=5200)
    
    # Active multipliers
    barf_adult_sedentary = Column(Float, default=2.0)
    barf_adult_normal = Column(Float, default=2.5)
    barf_adult_active = Column(Float, default=3.0)
    barf_adult_working = Column(Float, default=3.5)
    
    cooked_adult_sedentary = Column(Float, default=3.0)
    cooked_adult_normal = Column(Float, default=3.5)
    cooked_adult_active = Column(Float, default=4.0)
    cooked_adult_working = Column(Float, default=4.5)
    
    puppy_early = Column(Float, default=8.0)
    puppy_mid = Column(Float, default=6.0)
    puppy_late = Column(Float, default=4.0)
    shipping_cost = Column(Integer, default=5000, nullable=True)

class Pet(Base):
    __tablename__ = "pets"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    breed = Column(String(100), nullable=False)
    weight = Column(Float, nullable=False)
    age = Column(String(50), nullable=False)  # adult, puppy, puppy-mid, puppy-late
    activity = Column(String(50), nullable=False)  # sedentary, normal, active, working
    notes = Column(Text, nullable=True)
    photo = Column(Text, nullable=True)  # Base64 image
    subscription_paid = Column(Boolean, default=False)
    selected_recipe_id = Column(String(50), nullable=True)
    excluded_ingredients = Column(JSON, nullable=True)  # List of strings
    added_superfoods = Column(JSON, nullable=True)  # List of superfood ids
    added_vegetables_fruits = Column(JSON, nullable=True)  # List of vegetable/fruit ids
    custom_instructions = Column(Text, nullable=True)
    address = Column(Text, nullable=True)
    customer_id = Column(Integer, nullable=True, index=True)
    customer_email = Column(String(100), nullable=True, index=True)
    delivery_period = Column(Integer, default=30, nullable=True)
    order_date = Column(String(50), nullable=True)

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(50), nullable=False, index=True)  # e.g., OC-1234
    date = Column(String(50), nullable=False)
    pet_name = Column(Text, nullable=False)  # Can contain multiple pet names
    pet_breed = Column(Text, nullable=True)
    pet_weight = Column(Float, nullable=True)
    pet_photo = Column(Text, nullable=True)
    recipe_name = Column(Text, nullable=True)
    daily_grams = Column(Integer, nullable=False)
    monthly_kg = Column(Float, nullable=False)
    snacks = Column(Text, nullable=True)
    total_price = Column(Integer, nullable=False)
    address = Column(Text, nullable=False)
    paid_status = Column(String(50), default="Verificado")
    customer_id = Column(Integer, nullable=True, index=True)
    customer_email = Column(String(100), nullable=True, index=True)
    production_status = Column(String(50), default="Pendiente", nullable=False)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(String(50), primary_key=True, index=True)
    author = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    dog_name = Column(String(100), nullable=False)
    photo_url = Column(Text, nullable=True)
    quote = Column(Text, nullable=False)

class Faq(Base):
    __tablename__ = "faqs"

    id = Column(String(50), primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    message = Column(Text, nullable=False)
    date = Column(String(50), nullable=False)

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    name = Column(String(100), nullable=True)
    provider = Column(String(50), default="email")  # email, google, apple

class Additional(Base):
    __tablename__ = "additionals"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # superfood, vegfruit
    icon = Column(String(20), nullable=False)
    price = Column(Integer, default=1500)
    vitamins = Column(String(255), nullable=True)
    benefits = Column(Text, nullable=True)

class IngredientInfo(Base):
    __tablename__ = "ingredients_info"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    vitamins = Column(String(255), nullable=True)
    benefits = Column(Text, nullable=True)
