from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import CommandeProduit, Paiement, Commande, Panier, Utilisateur, db
from werkzeug.security import generate_password_hash


payment_bp = Blueprint('payment', __name__)


@payment_bp.route('/paiements', methods=['GET'])
def liste_paiements():
    paiements = Paiement.query.all()
    return jsonify([paiement.to_dict() for paiement in paiements])

@payment_bp.route('/paiement/<int:paiement_id>', methods=['GET'])
@jwt_required()
def detail_paiement(paiement_id):
    paiement = Paiement.query.get_or_404(paiement_id)
    current_user = Utilisateur.query.get(get_jwt_identity())
    if paiement.commande.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")
    return jsonify(paiement.to_dict())

@payment_bp.route('/effectuer_paiement', methods=['POST'])
@jwt_required()
def effectuer_paiement():
    data = request.get_json()
    selected_items = data.get('selected_items', [])
    total_prix = 0
    current_user = Utilisateur.query.get(get_jwt_identity())


    if current_user.is_authenticated:
        utilisateur_id = current_user.id
    else:
        utilisateur_id = None
        nom_utilisateur = data.get('nom_utilisateur')
        email = data.get('email')
        mot_de_passe = data.get('mot_de_passe')
        mot_de_passe_hash = generate_password_hash(mot_de_passe, method='sha256')
        nouvel_utilisateur = Utilisateur(nom_utilisateur=nom_utilisateur, email=email, mot_de_passe=mot_de_passe_hash)
        db.session.add(nouvel_utilisateur)
        db.session.commit()
        utilisateur_id = nouvel_utilisateur.id

    commande = Commande(
        utilisateur_id=utilisateur_id,
        nom_client=data.get('nom_client'),
        email_client=data.get('email_client'),
        tel_client=data.get('tel_client'),
        adresse_livraison=data.get('adresse_livraison'),
        total_prix=total_prix,
        statut='En attente'
    )
    db.session.add(commande)
    db.session.commit()

    for item_id in selected_items:
        panier_item = Panier.query.get_or_404(item_id)
        total_prix += panier_item.produit.prix * panier_item.quantite
        commande_produit = CommandeProduit(
            commande_id=commande.id,
            produit_id=panier_item.produit_id,
            quantite=panier_item.quantite,
            prix_unitaire=panier_item.produit.prix
        )
        db.session.add(commande_produit)
        db.session.delete(panier_item)

    commande.total_prix = total_prix
    db.session.commit()

    paiement = Paiement(
        commande_id=commande.id,
        montant=commande.total_prix,
        methode_paiement='Carte de crédit',
        statut='Complété'
    )
    db.session.add(paiement)
    db.session.commit()

    return jsonify(commande.to_dict()), 201

@payment_bp.route('/annuler_paiement/<int:paiement_id>', methods=['DELETE'])
@jwt_required()
def annuler_paiement(paiement_id):
    paiement = Paiement.query.get_or_404(paiement_id)
    current_user = Utilisateur.query.get(get_jwt_identity())
    if paiement.commande.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")
    paiement.statut = 'Annulé'
    db.session.commit()
    return '', 204
