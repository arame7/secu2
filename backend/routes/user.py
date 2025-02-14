from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import JWTManager, create_access_token, get_jwt, get_jwt_identity, jwt_required
from models import Favori, Panier, Utilisateur, Produit, Commande, Visite, CommandeProduit, db
from sqlalchemy import func

user_bp = Blueprint('user', __name__)
blacklist = set()

@user_bp.route('/inscription', methods=['POST'])
def inscription():
    data = request.get_json()
    nom_utilisateur = data.get('nom_utilisateur')
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')
    tel = data.get('tel')
    adresse = data.get('adresse')

    if not nom_utilisateur or not email or not mot_de_passe:
        abort(400, description="Données manquantes")

    if Utilisateur.query.filter_by(email=email).first():
        abort(400, description="Email déjà utilisé")

    nouvel_utilisateur = Utilisateur(nom_utilisateur=nom_utilisateur, email=email, tel=tel, adresse=adresse)
    nouvel_utilisateur.set_password(mot_de_passe)
    db.session.add(nouvel_utilisateur)
    db.session.commit()

    # Créer un panier vide pour l'utilisateur
    panier = Panier(utilisateur_id=nouvel_utilisateur.id)
    db.session.add(panier)
    db.session.commit()

    return jsonify(nouvel_utilisateur.to_dict()), 201

@user_bp.route('/connexion', methods=['POST'])
def connexion():
    data = request.get_json()
    email = data.get('email')
    mot_de_passe = data.get('mot_de_passe')

    if not email or not mot_de_passe:
        abort(400, description="Données manquantes")

    utilisateur = Utilisateur.query.filter_by(email=email).first()
    if utilisateur and utilisateur.check_password(mot_de_passe):
        access_token = create_access_token(identity=str(utilisateur.id))
        return jsonify(access_token=access_token, est_admin=utilisateur.est_admin), 200
    else:
        abort(401, description="Email ou mot de passe incorrect")

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def deconnexion():
    # Obtenir le JTI du token
    jti = get_jwt()["jti"]

    # Ajouter le JTI à la blacklist
    blacklist.add(jti)

    return jsonify({"msg": "Déconnexion réussie"}), 200

@user_bp.route('/profil', methods=['GET'])
@jwt_required()
def profil():
    utilisateur_id = get_jwt_identity()
    utilisateur = Utilisateur.query.get(utilisateur_id)

    return jsonify(utilisateur.to_dict())

@user_bp.route('/modifier_profil', methods=['PUT'])
@jwt_required()
def modifier_profil():
    data = request.get_json()
    utilisateur_id = get_jwt_identity()
    utilisateur = Utilisateur.query.get(utilisateur_id)
    utilisateur.nom_utilisateur = data.get('nom_utilisateur', utilisateur.nom_utilisateur)
    utilisateur.email = data.get('email', utilisateur.email)
    utilisateur.tel = data.get('tel', utilisateur.tel)
    utilisateur.adresse = data.get('adresse', utilisateur.adresse)

    if 'mot_de_passe' in data:
        utilisateur.set_password(data['mot_de_passe'])

    db.session.commit()
    return jsonify(utilisateur.to_dict())

@user_bp.route('/supprimer_compte', methods=['DELETE'])
@jwt_required()
def supprimer_compte():
    utilisateur = Utilisateur.query.get(get_jwt_identity())

    # Supprimer les favoris de l'utilisateur
    favoris = Favori.query.filter_by(utilisateur_id=utilisateur.id).all()
    for favori in favoris:
        db.session.delete(favori)

    # Supprimer les commandes de l'utilisateur
    commandes = Commande.query.filter_by(utilisateur_id=utilisateur.id).all()
    for commande in commandes:
        commande_produits = CommandeProduit.query.filter_by(commande_id=commande.id).all()
        for commande_produit in commande_produits:
            db.session.delete(commande_produit)
        db.session.delete(commande)

    # Supprimer le panier de l'utilisateur
    panier = Panier.query.filter_by(utilisateur_id=utilisateur.id).first()
    if panier:
        db.session.delete(panier)

    db.session.delete(utilisateur)
    db.session.commit()

    return '', 204

@user_bp.route('/stats', methods=['GET'])
def statistiques():
    nombre_utilisateurs = Utilisateur.query.count()
    nombre_produits = Produit.query.count()
    nombre_commandes = Commande.query.count()
    nombre_visites = Visite.query.count()

    produits_les_plus_commandes = (
        db.session.query(Produit.id, Produit.nom, func.sum(CommandeProduit.quantite).label('total_quantite'))
        .join(CommandeProduit, Produit.id == CommandeProduit.produit_id)
        .group_by(Produit.id)
        .order_by(func.sum(CommandeProduit.quantite).desc())
        .limit(5)
        .all()
    )

    meilleurs_clients = (
        db.session.query(Utilisateur.id, Utilisateur.nom_utilisateur, func.sum(Commande.total_prix).label('total_depense'))
        .join(Commande, Utilisateur.id == Commande.utilisateur_id)
        .group_by(Utilisateur.id)
        .order_by(func.sum(Commande.total_prix).desc())
        .limit(5)
        .all()
    )

    statistiques = {
        'nombre_utilisateurs': nombre_utilisateurs,
        'nombre_produits': nombre_produits,
        'nombre_commandes': nombre_commandes,
        'nombre_visites': nombre_visites,
        'produits_les_plus_commandes': [
            {'id': p.id, 'nom': p.nom, 'total_quantite': total_quantite}
            for p, total_quantite in produits_les_plus_commandes
        ],
        'meilleurs_clients': [
            {'id': c.id, 'nom_utilisateur': c.nom_utilisateur, 'total_depense': total_depense}
            for c, total_depense in meilleurs_clients
        ]
    }
    return jsonify(statistiques)

# Récupérer tous les utilisateurs
@user_bp.route('/', methods=['GET'])
def get_utilisateurs():
    utilisateurs = Utilisateur.query.all()
    return jsonify([u.to_dict() for u in utilisateurs])

# Récupérer un utilisateur par son id
@user_bp.route('/<int:id>', methods=['GET'])
def get_utilisateur(id):
    utilisateur = Utilisateur.query.get_or_404(id)
    return jsonify(utilisateur.to_dict())

# Modifier un utilisateur
@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_utilisateur(id):
    utilisateur = Utilisateur.query.get_or_404(id)
    data = request.get_json()

    utilisateur.nom_utilisateur = data.get('nom_utilisateur', utilisateur.nom_utilisateur)
    utilisateur.email = data.get('email', utilisateur.email)
    utilisateur.tel = data.get('tel', utilisateur.tel)
    utilisateur.adresse = data.get('adresse', utilisateur.adresse)
    utilisateur.est_admin = data.get('est_admin', utilisateur.est_admin)

    if 'mot_de_passe' in data:
        utilisateur.set_password(data['mot_de_passe'])

    db.session.commit()
    return jsonify(utilisateur.to_dict())

# Supprimer un utilisateur
@user_bp.route('/<int:id>', methods=['DELETE'])
def delete_utilisateur(id):
    utilisateur = Utilisateur.query.get_or_404(id)

    # Supprimer les favoris de l'utilisateur
    favoris = Favori.query.filter_by(utilisateur_id=utilisateur.id).all()
    for favori in favoris:
        db.session.delete(favori)

    # Supprimer les commandes de l'utilisateur
    commandes = Commande.query.filter_by(utilisateur_id=utilisateur.id).all()
    for commande in commandes:
        commande_produits = CommandeProduit.query.filter_by(commande_id=commande.id).all()
        for commande_produit in commande_produits:
            db.session.delete(commande_produit)
        db.session.delete(commande)

    # Supprimer le panier de l'utilisateur
    panier = Panier.query.filter_by(utilisateur_id=utilisateur.id).first()
    if panier:
        db.session.delete(panier)

    db.session.delete(utilisateur)
    db.session.commit()

    return '', 204
