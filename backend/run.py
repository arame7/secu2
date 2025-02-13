
from app import create_app

# Créer l'application en utilisant la fonction de création
app = create_app()

if __name__ == "__main__":
    # Lancer l'application
    app.run(ssl_context=('cert.pem', 'key.pem'),debug=True)
