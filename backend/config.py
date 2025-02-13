import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

def clean_int(value, default):
    try:
        return int(value.strip())
    except (ValueError, AttributeError):
        return default

class Config:
    # Clé secrète pour les sessions
    SECRET_KEY = os.getenv('SECRET_KEY')

    # Environnement de Flask (développement ou production)
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')

    # Configuration de la base de données
    DATABASE_TYPE = os.getenv('DATABASE_TYPE', 'postgresql')  # Par défaut : postgresql
    DATABASE_USER = os.getenv('DATABASE_USER', 'postgres')
    DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD', 'postgres')
    DATABASE_HOST = os.getenv('DATABASE_HOST', 'localhost')
    DATABASE_PORT = clean_int(os.getenv('DATABASE_PORT'), 5432)  # Par défaut : 5432 pour PostgreSQL
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'seculogi')

    # Construction de l'URI de la base de données
    SQLALCHEMY_DATABASE_URI = (
        f"{DATABASE_TYPE}+pg8000://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configuration du JWT
    JWT_SECRET_KEY = SECRET_KEY
    JWT_ALGORITHM = os.getenv('ALGORITHM', 'HS256')  # Par défaut : HS256

    # Configuration de Redis
    REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
    REDIS_PORT = clean_int(os.getenv('REDIS_PORT'), 6379)  # Par défaut : 6379
    # Configuration pour HTTPS
    SSL_CERT = os.getenv('SSL_CERT', 'cert.pem')
    SSL_KEY = os.getenv('SSL_KEY', 'key.pem')
    SSL_REDIRECT = os.getenv('SSL_REDIRECT', 'true').lower() in ['true', '1', 'yes']
     # ... Autres configurations
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 heure
