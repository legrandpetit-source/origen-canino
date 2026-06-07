from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
import models

# Recreate tables to ensure clean state if run directly
Base.metadata.create_all(bind=engine)

DEFAULT_RECIPES = [
  { 
    "id": 'b-pollo', 
    "name": 'BARF Pollo Premium', 
    "category": 'barf', 
    "price": 4200, 
    "icon": '🍗', 
    "ingredients": 'Hueso de pollo triturado, carne magra de pollo, hígado de pollo, vísceras trituradas, espinaca fresca, zanahoria picada.',
    "ingredients_array": ['Hueso de pollo triturado', 'Carne magra de pollo', 'Hígado de pollo', 'Vísceras trituradas', 'Espinaca fresca', 'Zanahoria picada']
  },
  { 
    "id": 'b-vacuno', 
    "name": 'BARF Vacuno Tradicional', 
    "category": 'barf', 
    "price": 4200, 
    "icon": '🥩', 
    "ingredients": 'Carne magra de res, hueso blando de vacuno molido, hígado de res, bofe, riñón de res, manzana verde, zanahoria.',
    "ingredients_array": ['Carne magra de res', 'Hueso de vacuno molido', 'Hígado de res', 'Vísceras (bofe/riñón)', 'Manzana verde', 'Zanahoria']
  },
  { 
    "id": 'b-salmon', 
    "name": 'BARF Pavo & Salmón', 
    "category": 'barf', 
    "price": 4200, 
    "icon": '🐟', 
    "ingredients": 'Carne magra de pavo, filete de salmón, hueso de pavo triturado, hígado de pavo, acelga fresca, arándanos silvestres.',
    "ingredients_array": ['Carne magra de pavo', 'Filete de salmón', 'Hueso de pavo triturado', 'Hígado de pavo', 'Acelga fresca', 'Arándanos silvestres']
  },
  { 
    "id": 'c-pollo', 
    "name": 'Pollo Cocido al Vapor', 
    "category": 'cooked', 
    "price": 5200, 
    "icon": '🍲', 
    "ingredients": 'Pechuga de pollo cocida, trutro deshuesado, zapallo camote, zanahoria cocida, arroz integral cocido, aceite de oliva.',
    "ingredients_array": ['Pechuga de pollo cocida', 'Trutro de pollo cocido', 'Zapallo camote al vapor', 'Zanahoria cocida', 'Arroz integral cocido', 'Aceite de oliva']
  },
  { 
    "id": 'c-vacuno', 
    "name": 'Vacuno & Camote Cocido', 
    "category": 'cooked', 
    "price": 5200, 
    "icon": '🥘', 
    "ingredients": 'Posta de vacuno picada, camote cocido al vapor, espinaca al vapor, arvejas tiernas, hígado de res cocido.',
    "ingredients_array": ['Posta de vacuno picada', 'Camote al vapor', 'Espinaca al vapor', 'Arvejas tiernas', 'Hígado de res cocido']
  },
  { 
    "id": 'c-cerdo', 
    "name": 'Cerdo & Manzana Cocido', 
    "category": 'cooked', 
    "price": 5200, 
    "icon": '🍎', 
    "ingredients": 'Pulpa de cerdo cocida, manzana roja cocida, zanahoria, avena integral machacada, carbonato de calcio.',
    "ingredients_array": ['Pulpa de cerdo cocida', 'Manzana roja cocida', 'Zanahoria al vapor', 'Avena integral cocida', 'Carbonato de calcio']
  }
]

DEFAULT_SNACKS = [
  { "id": 's-patas', "name": 'Patas de Pollo Deshidratadas', "category": 'snack', "price": 4500, "icon": '🐾', "ingredients": 'Pack de 5 unidades. Calcio y colágeno natural que actúa como cepillo de dientes.', "unit": '5 uds' },
  { "id": 's-caldo', "name": 'Caldo de Huesos Concentrado', "category": 'snack', "price": 3800, "icon": '🍵', "ingredients": 'Botella de 500ml. Caldo cocinado por 24 hrs. Reparador intestinal y de articulaciones.', "unit": '500ml' },
  { "id": 's-colageno', "name": 'Calugas de Colágeno y Coco', "category": 'snack', "price": 5000, "icon": '🥥', "ingredients": 'Pote de 20 calugas masticables frías a base de caldo de patas y aceite de coco.', "unit": '20 uds' }
]

DEFAULT_PARAMS = {
  "barf_price_per_kg": 4200,
  "cooked_price_per_kg": 5200,
  "barf_adult_sedentary": 2.0,
  "barf_adult_normal": 2.5,
  "barf_adult_active": 3.0,
  "barf_adult_working": 3.5,
  "cooked_adult_sedentary": 3.0,
  "cooked_adult_normal": 3.5,
  "cooked_adult_active": 4.0,
  "cooked_adult_working": 4.5,
  "puppy_early": 8.0,
  "puppy_mid": 6.0,
  "puppy_late": 4.0
}

DEFAULT_TESTIMONIALS = [
  { 
    "id": 't-1', 
    "author": 'Camila Rojas', 
    "location": 'Providencia', 
    "dog_name": 'Mateo', 
    "photo_url": 'assets/logo.jpg', 
    "quote": 'El cambio en Mateo fue increíble. Tenía alergias terribles en la piel y se rascaba todo el día. Desde el primer mes con BARF de Origen Canino, su piel está sana, el pelo brilla y sus digestiones son perfectas. ¡Una maravilla!' 
  },
  { 
    "id": 't-2', 
    "author": 'Andrés Valenzuela', 
    "location": 'Las Condes', 
    "dog_name": 'Rocky', 
    "photo_url": 'assets/logo.jpg', 
    "quote": 'Estaba escéptico sobre la comida cruda, pero ver a Rocky comer con tanta felicidad me convenció. La porción viene exacta en bolsas al vacío, lo que facilita todo. Sus dientes están impecables y tiene una energía increíble.' 
  },
  { 
    "id": 't-3', 
    "author": 'María José Castro', 
    "location": 'Viña del Mar', 
    "dog_name": 'Luna', 
    "photo_url": 'assets/logo.jpg', 
    "quote": 'Luna sufría de problemas estomacales constantes con el alimento seco. Cambiamos a las recetas cocinadas de Origen Canino y el cambio fue instantáneo. La comida huele delicioso y le encanta. El servicio de entrega mensual es puntual.' 
  }
]

DEFAULT_FAQS = [
  { 
    "id": 'f-1', 
    "question": '¿Qué es la dieta BARF y cuáles son sus beneficios?', 
    "answer": 'La dieta BARF (Alimento Crudo Biológicamente Apropiado) consiste en alimentar a los perros con carne magra, huesos carnosos triturados, vísceras y vegetales crudos. Sus beneficios incluyen dientes limpios sin sarro, mejor aliento, digestiones más compactas y menos olorosas, pelaje brillante, mayor vitalidad y reducción drástica de alergias cutáneas.' 
  },
  { 
    "id": 'f-2', 
    "question": '¿Es seguro dar huesos a mi perro?', 
    "answer": 'Sí, siempre y cuando sean huesos carnosos crudos triturados o enteros (nunca cocidos, ya que la cocción los deshidrata y hace que se astillen). En Origen Canino trituramos finamente todos los huesos en nuestras fórmulas BARF para garantizar una seguridad del 100%, eliminando cualquier riesgo de atragantamiento o perforación.' 
  },
  { 
    "id": 'f-3', 
    "question": '¿Cuál es la diferencia entre la dieta BARF y la comida cocinada al vapor?', 
    "answer": 'La dieta BARF utiliza ingredientes 100% crudos para preservar todas las enzimas y bacterias benéficas intactas. La comida cocinada al vapor se cocina a baja temperatura para eliminar patógenos y facilitar la digestión, siendo ideal para perros senior, con estómagos sensibles o cuando los tutores prefieren no manipular carne cruda.' 
  },
  { 
    "id": 'f-4', 
    "question": '¿Cómo se realiza la transición de alimento seco (croquetas) a alimento natural?', 
    "answer": 'Recomendamos una transición gradual de 7 días. Los días 1 y 2, ofrece 75% de su alimento anterior y 25% del nuevo alimento natural (en platos separados, nunca mezclados en la misma porción). Los días 3 y 4, ofrece 50% y 50%. Los días 5 y 6, ofrece 75% de alimento natural y 25% anterior. El día 7, ya estará comiendo 100% Origen Canino.' 
  },
  { 
    "id": 'f-5', 
    "question": '¿Cómo se entregan y conservan las porciones mensuales?', 
    "answer": 'Entregamos el alimento en porciones diarias exactas envasadas al vacío y congeladas. Debes guardarlas en el congelador. Cada noche, saca la porción del día siguiente y déjala descongelar en el refrigerador. Al momento de servir, puedes entibiarla un poco (nunca usar microondas para la dieta BARF para no cocer los huesos triturados).' 
  },
  { 
    "id": 'f-6', 
    "question": '¿Puedo personalizar la comida si mi mascota tiene alergias o condiciones médicas?', 
    "answer": '¡Absolutamente! Utilizando nuestra App Móvil puedes crear el perfil de tu mascota e indicar qué ingredientes base deseas excluir (se tacharán de su receta) y qué superalimentos opcionales agregar (como chía o aceite de coco). Si tiene alguna condición médica compleja, puedes indicarlo en las observaciones y nuestro equipo formulará bajo supervisión veterinaria.' 
  },
  { 
    "id": 'f-7', 
    "question": '¿Cómo funciona la suscripción mensual y la forma de entrega?', 
    "answer": 'Al activar tu suscripción en la App Móvil con pago seguro, nuestro sistema programa la producción personalizada de tu mascota. Despachamos tus 30 porciones mensuales congeladas directamente a tu domicilio cada 30 días, asegurando que nunca te quedes sin comida. Puedes modificar, pausar o cancelar tu suscripción en cualquier momento.' 
  }
]

def seed_db():
    db = SessionLocal()
    
    print("Seeding parameters...")
    existing_params = db.query(models.Parameter).filter(models.Parameter.id == "default").first()
    if not existing_params:
        params = models.Parameter(id="default", **DEFAULT_PARAMS)
        db.add(params)
    else:
        for k, v in DEFAULT_PARAMS.items():
            setattr(existing_params, k, v)

    print("Seeding recipes...")
    for recipe_data in DEFAULT_RECIPES:
        existing = db.query(models.Recipe).filter(models.Recipe.id == recipe_data["id"]).first()
        if not existing:
            rec = models.Recipe(**recipe_data)
            db.add(rec)
        else:
            for k, v in recipe_data.items():
                setattr(existing, k, v)

    print("Seeding snacks...")
    for snack_data in DEFAULT_SNACKS:
        existing = db.query(models.Snack).filter(models.Snack.id == snack_data["id"]).first()
        if not existing:
            snack = models.Snack(**snack_data)
            db.add(snack)
        else:
            for k, v in snack_data.items():
                setattr(existing, k, v)

    print("Seeding testimonials...")
    for t_data in DEFAULT_TESTIMONIALS:
        existing = db.query(models.Testimonial).filter(models.Testimonial.id == t_data["id"]).first()
        if not existing:
            t = models.Testimonial(**t_data)
            db.add(t)
        else:
            for k, v in t_data.items():
                setattr(existing, k, v)

    print("Seeding FAQs...")
    for faq_data in DEFAULT_FAQS:
        existing = db.query(models.Faq).filter(models.Faq.id == faq_data["id"]).first()
        if not existing:
            f = models.Faq(**faq_data)
            db.add(f)
        else:
            for k, v in faq_data.items():
                setattr(existing, k, v)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
