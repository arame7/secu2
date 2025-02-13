from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Utilisateur(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    nom_utilisateur = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    tel = db.Column(db.String(255), unique=True, nullable=True)
    adresse = db.Column(db.String(255), nullable=True)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    est_admin = db.Column(db.Boolean, default=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.mot_de_passe = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.mot_de_passe, password)

    def to_dict(self):
        return {
            'id': self.id,
            'nom_utilisateur': self.nom_utilisateur,
            'email': self.email,
            'tel': self.tel,
            'adresse': self.adresse,
            'est_admin': self.est_admin,
            'date_creation': self.date_creation.isoformat()
        }

class Produit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(255), nullable=False)
    prix = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    stock = db.Column(db.Integer, nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    image_url = db.Column(db.String(10000), nullable=True)  # Nouveau champ pour l'URL de l'image

    def to_dict(self):
        return {
            'id': self.id,
            'nom': self.nom,
            'prix': self.prix,
            'description': self.description,
            'stock': self.stock,
            'date_creation': self.date_creation.isoformat(),
            'image_url': self.image_url  # Inclure l'URL de l'image dans le dictionnaire
        }

class Panier(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    utilisateur = db.relationship('Utilisateur', backref=db.backref('paniers', lazy=True))
    produits = db.relationship('PanierProduit', backref=db.backref('panier', lazy=True), cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'utilisateur_id': self.utilisateur_id,
            'date_creation': self.date_creation.isoformat(),
            'produits': [produit.to_dict() for produit in self.produits]
        }

class PanierProduit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    panier_id = db.Column(db.Integer, db.ForeignKey('panier.id'), nullable=False)
    produit_id = db.Column(db.Integer, db.ForeignKey('produit.id'), nullable=False)
    quantite = db.Column(db.Integer, nullable=False)
    selectionne = db.Column(db.Boolean, default=True)
    date_ajout = db.Column(db.DateTime, default=datetime.utcnow)

    produit = db.relationship('Produit', backref=db.backref('paniers_produits', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'panier_id': self.panier_id,
            'produit_id': self.produit_id,
            'quantite': self.quantite,
            'selectionne': self.selectionne,
            'date_ajout': self.date_ajout.isoformat(),
            'produit': self.produit.to_dict()
        }

class Commande(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=True)
    nom_client = db.Column(db.String(100), nullable=True)
    email_client = db.Column(db.String(120), nullable=True)
    tel_client = db.Column(db.String(50), nullable=True)
    adresse_livraison = db.Column(db.String(255), nullable=False)
    total_prix = db.Column(db.Float, nullable=False)
    statut = db.Column(db.String(50), default="En attente")
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    utilisateur = db.relationship('Utilisateur', backref=db.backref('commandes', lazy=True))
    produits = db.relationship('CommandeProduit', backref=db.backref('commande', lazy=True), cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'utilisateur_id': self.utilisateur_id,
            'nom_client': self.nom_client,
            'email_client': self.email_client,
            'tel_client': self.tel_client,
            'adresse_livraison': self.adresse_livraison,
            'total_prix': self.total_prix,
            'statut': self.statut,
            'date_creation': self.date_creation.isoformat(),
            'produits': [produit.to_dict() for produit in self.produits]
        }

class CommandeProduit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    commande_id = db.Column(db.Integer, db.ForeignKey('commande.id'), nullable=False)
    produit_id = db.Column(db.Integer, db.ForeignKey('produit.id'), nullable=False)
    quantite = db.Column(db.Integer, nullable=False)
    prix_unitaire = db.Column(db.Float, nullable=False)

    produit = db.relationship('Produit', backref=db.backref('commandes_produits', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'commande_id': self.commande_id,
            'produit_id': self.produit_id,
            'quantite': self.quantite,
            'prix_unitaire': self.prix_unitaire,
            'produit': self.produit.to_dict()
        }

class Paiement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    commande_id = db.Column(db.Integer, db.ForeignKey('commande.id'), nullable=False)
    montant = db.Column(db.Float, nullable=False)
    methode_paiement = db.Column(db.String(50), nullable=False)
    statut = db.Column(db.String(50), default="En attente")
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    commande = db.relationship('Commande', backref=db.backref('paiements', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'commande_id': self.commande_id,
            'montant': self.montant,
            'methode_paiement': self.methode_paiement,
            'statut': self.statut,
            'date_creation': self.date_creation.isoformat()
        }

class Visite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date_visite = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'date_visite': self.date_visite.isoformat()
        }

class Commentaire(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    produit_id = db.Column(db.Integer, db.ForeignKey('produit.id'), nullable=False)
    contenu = db.Column(db.Text, nullable=False)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)

    utilisateur = db.relationship('Utilisateur', backref=db.backref('commentaires', lazy=True))
    produit = db.relationship('Produit', backref=db.backref('commentaires', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'utilisateur_id': self.utilisateur_id,
            'produit_id': self.produit_id,
            'contenu': self.contenu,
            'date_creation': self.date_creation.isoformat(),
            'utilisateur': self.utilisateur.to_dict(),
            'produit': self.produit.to_dict()
        }

class Favori(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    utilisateur_id = db.Column(db.Integer, db.ForeignKey('utilisateur.id'), nullable=False)
    produit_id = db.Column(db.Integer, db.ForeignKey('produit.id'), nullable=False)
    date_ajout = db.Column(db.DateTime, default=datetime.utcnow)

    utilisateur = db.relationship('Utilisateur', backref=db.backref('favoris', lazy=True))
    produit = db.relationship('Produit', backref=db.backref('favoris', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'utilisateur_id': self.utilisateur_id,
            'produit_id': self.produit_id,
            'date_ajout': self.date_ajout.isoformat(),
            'produit': self.produit.to_dict()
        }
