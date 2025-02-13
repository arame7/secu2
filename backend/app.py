from fileinput import filename
from flask import Flask, jsonify, redirect, send_from_directory
from flask import request
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from models import db
from models import Visite
from routes import user, cart, product, order,payment

# Initialiser les extensions
migrate = Migrate()

def create_app():
    app = Flask(__name__, static_folder='uploads')

    # Charger les variables d'environnement depuis le fichier .env
    load_dotenv()

    # Configurer l'application à partir de la classe Config
    app.config.from_object('config.Config')

    # Initialiser les extensions
    db.init_app(app)
    migrate.init_app(app, db)
    # Configurer le jwtmanager
    JWTManager(app)



    #activer le cors
    CORS(app)
    
    # routes foe app

    @app.before_request
    def enregistrer_visite():
        if request.endpoint and not request.endpoint.startswith('static'):
            visite = Visite()
            db.session.add(visite)
            db.session.commit()
    
    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.static_folder, filename)
     #Rediriger automatiquement HTTP vers HTTPS
    @app.before_request
    def redirect_to_https():
        if not request.is_secure and app.config['SSL_REDIRECT']:
            return redirect(request.url.replace("http://", "https://"))
    

    # Enregistrer les Blueprints
    app.register_blueprint(user.user_bp, url_prefix='/abc/user')
    app.register_blueprint(product.product_bp, url_prefix='/abc/products')
    app.register_blueprint(cart.cart_bp, url_prefix='/abc/cart')
    app.register_blueprint(order.order_bp, url_prefix='/abc/orders')
    app.register_blueprint(payment.payment_bp, url_prefix='/abc/payments')
    






    

    

    return app
