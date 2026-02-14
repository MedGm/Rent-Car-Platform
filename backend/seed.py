from app import create_app, db
from app.models import User, Car, Booking, CalendarBlock, Article, Service
from werkzeug.security import generate_password_hash
from datetime import datetime, date, timedelta
import json

app = create_app()


def seed_data():
    with app.app_context():
        # ── Admin User ────────────────────────────────────────────
        if not User.query.filter_by(email='admin@rent.com').first():
            print("Creating admin user...")
            admin = User(
                username='admin',
                email='admin@rent.com',
                password_hash=generate_password_hash('admin123'),
                is_admin=True,
                phone='+212671920545'
            )
            db.session.add(admin)
            db.session.flush()

        # ── Cars ──────────────────────────────────────────────────
        if Car.query.count() == 0:
            print("Creating cars...")
            cars_data = [
                {
                    "name": "Dacia Logan",
                    "category": "Sedan",
                    "specs": {"seats": 5, "fuel": "Diesel", "transmission": "Manual"},
                    "images": [
                        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Dacia_Logo_2021.svg/200px-Dacia_Logo_2021.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Renault Clio 5",
                    "category": "Sedan",
                    "specs": {"seats": 5, "fuel": "Petrol", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1619767886558-efdc7b9af5a1?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Renault_2021.svg/200px-Renault_2021.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Peugeot 3008",
                    "category": "SUV",
                    "specs": {"seats": 5, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Peugeot_2021_Logo.svg/200px-Peugeot_2021_Logo.svg.png",
                    "is_active": True,
                },
                {
                    "name": "BMW X5 xDrive",
                    "category": "SUV",
                    "specs": {"seats": 7, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/200px-BMW.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Mercedes-Benz Classe C",
                    "category": "Luxury",
                    "specs": {"seats": 5, "fuel": "Petrol", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Audi A6 Quattro",
                    "category": "Luxury",
                    "specs": {"seats": 5, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Audi-Logo_2016.svg/200px-Audi-Logo_2016.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Volkswagen T-Roc",
                    "category": "SUV",
                    "specs": {"seats": 5, "fuel": "Petrol", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1625753783222-4ea1c3223e32?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Volkswagen_logo_2019.svg/200px-Volkswagen_logo_2019.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Hyundai Tucson",
                    "category": "SUV",
                    "specs": {"seats": 5, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Hyundai_Motor_Company_logo.svg/200px-Hyundai_Motor_Company_logo.svg.png",
                    "is_active": True,
                },
                {
                    "name": "Mercedes-Benz Vito Tourer",
                    "category": "Van",
                    "specs": {"seats": 9, "fuel": "Diesel", "transmission": "Automatic"},
                    "images": [
                        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80",
                    ],
                    "brand_logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Logo.svg/200px-Mercedes-Logo.svg.png",
                    "is_active": True,
                },
            ]

            cars = []
            for cd in cars_data:
                car = Car(
                    name=cd["name"],
                    category=cd["category"],
                    specs=cd["specs"],
                    images=cd["images"],
                    brand_logo=cd["brand_logo"],
                    is_active=cd["is_active"],
                )
                db.session.add(car)
                cars.append(car)
            db.session.flush()
            print(f"  Created {len(cars)} cars")

        # ── Bookings & Calendar Blocks ────────────────────────────
        if Booking.query.count() == 0:
            print("Creating bookings...")
            cars = Car.query.all()
            today = date.today()

            bookings_data = [
                # Past completed booking
                {
                    "car_idx": 0,
                    "start": today - timedelta(days=15),
                    "end": today - timedelta(days=10),
                    "status": "confirmed",
                    "customer_name": "Youssef El Amrani",
                    "customer_email": "youssef.amrani@gmail.com",
                    "customer_phone": "+212661234567",
                    "customer_details": {
                        "cin": "JB 504321",
                        "permis": "M-234567",
                        "address": "123 Bd Hassan II, Casablanca",
                        "city": "Casablanca",
                        "nationality": "Marocaine",
                        "birth_date": "1990-05-12",
                    },
                },
                # Active booking (ongoing)
                {
                    "car_idx": 3,
                    "start": today - timedelta(days=2),
                    "end": today + timedelta(days=5),
                    "status": "confirmed",
                    "customer_name": "Pierre Dupont",
                    "customer_email": "pierre.dupont@orange.fr",
                    "customer_phone": "+33612345678",
                    "customer_details": {
                        "cin": "FR-12345678",
                        "permis": "09AX12345",
                        "address": "45 Rue de Rivoli, Paris",
                        "city": "Paris",
                        "nationality": "Française",
                        "birth_date": "1985-08-22",
                    },
                },
                # Upcoming booking
                {
                    "car_idx": 4,
                    "start": today + timedelta(days=3),
                    "end": today + timedelta(days=10),
                    "status": "confirmed",
                    "customer_name": "Fatima Zahra Benali",
                    "customer_email": "fatima.benali@hotmail.com",
                    "customer_phone": "+212677889900",
                    "customer_details": {
                        "cin": "BK 789012",
                        "permis": "R-345678",
                        "address": "Hay Mohammadi, Agadir",
                        "city": "Agadir",
                        "nationality": "Marocaine",
                        "birth_date": "1992-11-03",
                    },
                },
                # Upcoming booking
                {
                    "car_idx": 1,
                    "start": today + timedelta(days=7),
                    "end": today + timedelta(days=14),
                    "status": "pending",
                    "customer_name": "John Smith",
                    "customer_email": "john.smith@gmail.com",
                    "customer_phone": "+447911123456",
                    "customer_details": {
                        "cin": "GB-98765432",
                        "permis": "SMITH906152J99",
                        "address": "10 Downing St, London",
                        "city": "London",
                        "nationality": "Britannique",
                        "birth_date": "1988-06-15",
                    },
                },
                # Far future booking
                {
                    "car_idx": 6,
                    "start": today + timedelta(days=20),
                    "end": today + timedelta(days=27),
                    "status": "pending",
                    "customer_name": "Ahmed Tazi",
                    "customer_email": "ahmed.tazi@yahoo.com",
                    "customer_phone": "+212655443322",
                    "customer_details": {
                        "cin": "SH 112233",
                        "permis": "A-567890",
                        "address": "Quartier Industriel, Marrakech",
                        "city": "Marrakech",
                        "nationality": "Marocaine",
                        "birth_date": "1995-02-28",
                    },
                },
                # Cancelled booking
                {
                    "car_idx": 2,
                    "start": today + timedelta(days=1),
                    "end": today + timedelta(days=4),
                    "status": "cancelled",
                    "customer_name": "Maria Garcia",
                    "customer_email": "maria.garcia@correo.es",
                    "customer_phone": "+34612345678",
                    "customer_details": {
                        "cin": "ES-X1234567Z",
                        "permis": "B-1234567",
                        "address": "Calle Mayor 5, Madrid",
                        "city": "Madrid",
                        "nationality": "Espagnole",
                        "birth_date": "1993-07-19",
                    },
                },
            ]

            for bd in bookings_data:
                car = cars[bd["car_idx"]] if bd["car_idx"] < len(cars) else cars[0]
                booking = Booking(
                    car_id=car.id,
                    start_date=bd["start"],
                    end_date=bd["end"],
                    status=bd["status"],
                    customer_name=bd["customer_name"],
                    customer_email=bd["customer_email"],
                    customer_phone=bd["customer_phone"],
                    customer_details=bd["customer_details"],
                )
                db.session.add(booking)

                # Create calendar block for non-cancelled bookings
                if bd["status"] != "cancelled":
                    block = CalendarBlock(
                        car_id=car.id,
                        start_date=bd["start"],
                        end_date=bd["end"],
                        reason="booking",
                    )
                    db.session.add(block)

            # Maintenance blocks
            maintenance_blocks = [
                {"car_idx": 5, "start": today + timedelta(days=1), "end": today + timedelta(days=3), "reason": "maintenance"},
                {"car_idx": 7, "start": today + timedelta(days=10), "end": today + timedelta(days=12), "reason": "maintenance"},
            ]
            for mb in maintenance_blocks:
                car = cars[mb["car_idx"]] if mb["car_idx"] < len(cars) else cars[0]
                block = CalendarBlock(
                    car_id=car.id,
                    start_date=mb["start"],
                    end_date=mb["end"],
                    reason=mb["reason"],
                )
                db.session.add(block)

            db.session.flush()
            print(f"  Created {len(bookings_data)} bookings + calendar blocks")

        # ── Articles ──────────────────────────────────────────────
        if Article.query.count() == 0:
            print("Creating articles...")
            articles_data = [
                {
                    "title": "Découvrir Agadir : Les 10 Incontournables",
                    "excerpt": "Agadir regorge de trésors cachés. Plages dorées, souks animés, et bien plus — voici les expériences à ne pas manquer lors de votre séjour.",
                    "content": (
                        "Agadir, joyau de la côte atlantique marocaine, offre une combinaison unique de plage, culture et aventure.\n\n"
                        "1. La Plage d'Agadir — Avec ses 10 km de sable fin et son soleil 300 jours par an, c'est le lieu idéal pour se détendre.\n\n"
                        "2. La Kasbah d'Agadir Oufella — Perchée sur la colline, elle offre une vue panoramique spectaculaire sur toute la baie.\n\n"
                        "3. Le Souk El Had — L'un des plus grands marchés du Maroc, avec plus de 3 000 boutiques proposant épices, artisanat et vêtements.\n\n"
                        "4. La Vallée des Oiseaux — Un parc paisible au cœur de la ville, parfait pour une promenade en famille.\n\n"
                        "5. Le Port de Pêche — Observez les pêcheurs ramener leur prise du jour et dégustez du poisson frais grillé sur place.\n\n"
                        "6. Taghazout — À 20 minutes au nord, ce village de surfeurs est un paradis pour les amateurs de vagues.\n\n"
                        "7. Paradise Valley — Une oasis naturelle avec des piscines d'eau turquoise nichées dans les montagnes de l'Atlas.\n\n"
                        "8. Le Jardin d'Olhão — Un jardin botanique méditerranéen situé dans le quartier historique de la ville.\n\n"
                        "9. Crocoparc — Un parc unique abritant plus de 300 crocodiles, idéal pour les familles.\n\n"
                        "10. Le Téléphérique d'Agadir — Pour une vue imprenable sur la ville et l'océan.\n\n"
                        "Pour explorer tous ces sites confortablement, la location de voiture reste le moyen de transport le plus pratique. "
                        "Chez MISTERS DRIVERS, nous vous proposons des véhicules adaptés à toutes vos aventures."
                    ),
                    "category": "Tourisme",
                    "image_url": "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 1, 15, 10, 0),
                },
                {
                    "title": "Guide Complet : Location de Voiture au Maroc",
                    "excerpt": "Tout ce que vous devez savoir avant de louer une voiture au Maroc — documents, assurances, conseils de conduite et pièges à éviter.",
                    "content": (
                        "Louer une voiture au Maroc est la meilleure façon de découvrir le pays à votre rythme. "
                        "Voici un guide complet pour une expérience sans stress.\n\n"
                        "DOCUMENTS NÉCESSAIRES\n"
                        "• Permis de conduire valide (international recommandé pour les non-francophones)\n"
                        "• Passeport ou CIN en cours de validité\n"
                        "• Carte bancaire pour la caution\n\n"
                        "ASSURANCES\n"
                        "L'assurance tous risques est fortement recommandée. Elle couvre les dommages au véhicule, "
                        "le vol, et la responsabilité civile. Chez MISTERS DRIVERS, l'assurance de base est incluse dans chaque location.\n\n"
                        "CONSEILS DE CONDUITE\n"
                        "• On roule à droite au Maroc\n"
                        "• Les autoroutes sont modernes et bien entretenues\n"
                        "• Attention aux ronds-points — la priorité est souvent aux véhicules déjà engagés\n"
                        "• En ville, restez vigilant face aux deux-roues et piétons\n"
                        "• Le carburant diesel est moins cher que l'essence\n\n"
                        "ITINÉRAIRES RECOMMANDÉS DEPUIS AGADIR\n"
                        "• Agadir → Essaouira (2h30) : route côtière magnifique\n"
                        "• Agadir → Marrakech (3h) : via l'autoroute ou le col du Tizi n'Test\n"
                        "• Agadir → Tiznit → Mirleft (1h30) : plages sauvages du sud\n"
                        "• Agadir → Paradise Valley (45 min) : escapade nature\n\n"
                        "Réservez votre véhicule à l'avance, surtout en haute saison (juin-septembre et décembre-janvier)."
                    ),
                    "category": "Conseils",
                    "image_url": "https://images.unsplash.com/photo-1449965408869-ebd13bc0f0c7?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 1, 28, 14, 30),
                },
                {
                    "title": "Road Trip : La Route des Kasbahs depuis Agadir",
                    "excerpt": "Un itinéraire de 5 jours à travers les paysages époustouflants du sud marocain, des gorges du Dadès aux dunes de Merzouga.",
                    "content": (
                        "Le sud du Maroc est un monde à part. Cet itinéraire depuis Agadir vous emmène à travers "
                        "des paysages lunaires, des kasbahs millénaires et des oasis verdoyantes.\n\n"
                        "JOUR 1 : AGADIR → OUARZAZATE (330 km)\n"
                        "Traversez le col du Tizi n'Test en admirant les panoramas de l'Anti-Atlas. "
                        "Arrivée à Ouarzazate, la « Hollywood du Maroc », avec ses studios de cinéma.\n\n"
                        "JOUR 2 : OUARZAZATE → GORGES DU DADÈS (110 km)\n"
                        "Visite de la Kasbah Aït Ben Haddou (UNESCO) le matin. Route vers les gorges du Dadès "
                        "en passant par la vallée des roses.\n\n"
                        "JOUR 3 : GORGES DU DADÈS → MERZOUGA (300 km)\n"
                        "Route spectaculaire via les gorges du Todra. Arrivée à Merzouga pour une nuit "
                        "inoubliable dans le désert de l'Erg Chebbi.\n\n"
                        "JOUR 4 : MERZOUGA → DRAA VALLEY (250 km)\n"
                        "Lever de soleil sur les dunes, puis route vers la vallée du Draa, "
                        "la plus longue oasis du Maroc avec ses palmiers à perte de vue.\n\n"
                        "JOUR 5 : DRAA VALLEY → AGADIR (350 km)\n"
                        "Retour vers Agadir via Tata et Tiznit, à travers l'Anti-Atlas.\n\n"
                        "VÉHICULE RECOMMANDÉ\n"
                        "Un SUV est idéal pour ce road trip. Le Peugeot 3008 ou le BMW X5 de notre flotte "
                        "offrent confort et robustesse pour les routes montagneuses."
                    ),
                    "category": "Road Trip",
                    "image_url": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 2, 5, 9, 0),
                },
                {
                    "title": "SUV vs Berline : Quel Véhicule Choisir au Maroc ?",
                    "excerpt": "Le choix du véhicule dépend de votre itinéraire. Voici notre guide pour faire le bon choix entre confort urbain et aventure tout-terrain.",
                    "content": (
                        "Au Maroc, le type de véhicule que vous choisissez peut transformer votre voyage. "
                        "Voici les avantages de chaque catégorie.\n\n"
                        "BERLINE (Dacia Logan, Renault Clio)\n"
                        "✅ Économique en carburant\n"
                        "✅ Facile à manœuvrer en ville\n"
                        "✅ Parfaite pour les autoroutes\n"
                        "❌ Limitée sur les pistes\n"
                        "→ Idéale pour : Agadir, Marrakech, Casablanca, trajets autoroutiers\n\n"
                        "SUV (Peugeot 3008, BMW X5, Hyundai Tucson)\n"
                        "✅ Confort sur routes secondaires\n"
                        "✅ Garde au sol élevée\n"
                        "✅ Espace de rangement généreux\n"
                        "❌ Consommation plus élevée\n"
                        "→ Idéal pour : Atlas, désert, route des kasbahs, Paradise Valley\n\n"
                        "LUXE (Mercedes Classe C, Audi A6)\n"
                        "✅ Confort premium\n"
                        "✅ Équipements haut de gamme\n"
                        "✅ Idéal pour les événements\n"
                        "→ Parfait pour : voyages d'affaires, mariages, transferts VIP\n\n"
                        "MINIVAN (Mercedes Vito)\n"
                        "✅ Jusqu'à 9 places\n"
                        "✅ Idéal pour les groupes et familles\n"
                        "→ Parfait pour : familles nombreuses, excursions de groupe\n\n"
                        "Chez MISTERS DRIVERS, notre équipe vous conseille le véhicule le mieux adapté à votre projet."
                    ),
                    "category": "Conseils",
                    "image_url": "https://images.unsplash.com/photo-1549317661-bd32c8ce0afe?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 2, 10, 11, 0),
                },
                {
                    "title": "Les Plus Belles Plages autour d'Agadir",
                    "excerpt": "D'Agadir à Sidi Ifni, la côte atlantique marocaine offre des plages paradisiaques accessibles en voiture de location.",
                    "content": (
                        "La région d'Agadir est bénie par des kilomètres de côtes spectaculaires. "
                        "Voici les plages à découvrir absolument.\n\n"
                        "PLAGE D'AGADIR\n"
                        "La plus célèbre : 10 km de sable doré, eau calme, restaurants et cafés en bord de mer. "
                        "Parfaite pour les familles.\n\n"
                        "TAGHAZOUT\n"
                        "À 20 km au nord d'Agadir. Paradis du surf avec des vagues régulières. "
                        "Ambiance bohème et couchers de soleil magiques.\n\n"
                        "PLAGE D'IMSOUANE\n"
                        "À 1h30 au nord. La plus longue vague droite d'Afrique. "
                        "Un village de pêcheurs authentique avec du poisson frais tous les jours.\n\n"
                        "LEGZIRA\n"
                        "À 2h30 au sud, près de Sidi Ifni. Célèbre pour ses arches rocheuses naturelles "
                        "et ses falaises ocre spectaculaires.\n\n"
                        "MIRLEFT\n"
                        "À 2h au sud. Plusieurs criques isolées entourées de falaises. "
                        "Parfait pour l'aventure et la tranquillité.\n\n"
                        "ASTUCE TRANSPORT\n"
                        "Toutes ces plages sont facilement accessibles en voiture. "
                        "Pour Imsouane et Legzira, prévoyez la journée complète. "
                        "Louez une Dacia Logan économique pour les plages proches, "
                        "ou un SUV pour atteindre les criques cachées."
                    ),
                    "category": "Tourisme",
                    "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 2, 12, 16, 0),
                },
                {
                    "title": "Transfert Aéroport Agadir : Tout Savoir",
                    "excerpt": "Comment organiser votre transfert depuis l'aéroport Al Massira d'Agadir ? Navette, taxi, ou location de voiture — on compare.",
                    "content": (
                        "L'aéroport Al Massira d'Agadir (AGA) se situe à environ 25 km du centre-ville. "
                        "Voici vos options de transfert.\n\n"
                        "TAXI\n"
                        "Prix : environ 200-300 MAD. Pratique mais négociation nécessaire. "
                        "Les taxis grands format peuvent accueillir jusqu'à 6 passagers.\n\n"
                        "NAVETTE HÔTEL\n"
                        "Certains hôtels proposent un service de navette gratuit ou payant. "
                        "À vérifier lors de la réservation.\n\n"
                        "LOCATION DE VOITURE\n"
                        "La solution la plus flexible. Récupérez votre véhicule directement à l'aéroport "
                        "et partez explorer la région en toute liberté.\n\n"
                        "Notre service chez MISTERS DRIVERS inclut la livraison du véhicule à l'aéroport. "
                        "Contactez-nous au 06 71 92 05 45 pour organiser votre accueil."
                    ),
                    "category": "Pratique",
                    "image_url": "https://images.unsplash.com/photo-1436491865332-7a61a109db05?auto=format&fit=crop&w=800&q=80",
                    "is_published": True,
                    "created_at": datetime(2026, 2, 14, 8, 0),
                },
            ]

            for ad in articles_data:
                article = Article(
                    title=ad["title"],
                    excerpt=ad["excerpt"],
                    content=ad["content"],
                    category=ad["category"],
                    image_url=ad["image_url"],
                    is_published=ad["is_published"],
                    created_at=ad["created_at"],
                    updated_at=ad["created_at"],
                )
                db.session.add(article)
            db.session.flush()
            print(f"  Created {len(articles_data)} articles")

        # ── Services ──────────────────────────────────────────────
        if Service.query.count() == 0:
            print("Creating services...")
            services_data = [
                {
                    "title": "Livraison à l'Aéroport",
                    "description": "Nous livrons votre véhicule directement à l'aéroport Al Massira d'Agadir. Accueil personnalisé à votre arrivée.",
                    "icon": "Plane",
                    "sort_order": 1,
                },
                {
                    "title": "Assistance 24h/24",
                    "description": "Notre équipe est disponible jour et nuit pour vous assister en cas de panne, accident ou tout autre besoin.",
                    "icon": "Clock",
                    "sort_order": 2,
                },
                {
                    "title": "Assurance Tous Risques",
                    "description": "Roulez l'esprit tranquille avec notre couverture complète incluant dommages, vol et responsabilité civile.",
                    "icon": "Shield",
                    "sort_order": 3,
                },
                {
                    "title": "Kilométrage Illimité",
                    "description": "Explorez tout le Maroc sans vous soucier des kilomètres. Aucun frais supplémentaire, quelle que soit la distance.",
                    "icon": "Gauge",
                    "sort_order": 4,
                },
                {
                    "title": "Chauffeur Privé",
                    "description": "Besoin d'un chauffeur ? Nos drivers professionnels vous accompagnent pour vos transferts et excursions.",
                    "icon": "UserCheck",
                    "sort_order": 5,
                },
                {
                    "title": "Siège Bébé Gratuit",
                    "description": "Voyagez en famille en toute sécurité. Siège bébé et rehausseur disponibles gratuitement sur demande.",
                    "icon": "Baby",
                    "sort_order": 6,
                },
            ]

            for sd in services_data:
                service = Service(
                    title=sd["title"],
                    description=sd["description"],
                    icon=sd["icon"],
                    is_active=True,
                    sort_order=sd["sort_order"],
                )
                db.session.add(service)
            db.session.flush()
            print(f"  Created {len(services_data)} services")

        # ── Commit everything ─────────────────────────────────────
        db.session.commit()
        print("\n✅ Database seeded successfully!")
        print(f"   Cars:     {Car.query.count()}")
        print(f"   Bookings: {Booking.query.count()}")
        print(f"   Articles: {Article.query.count()}")
        print(f"   Services: {Service.query.count()}")


if __name__ == '__main__':
    seed_data()
