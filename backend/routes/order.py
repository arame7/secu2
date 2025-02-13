from flask import Blueprint, jsonify, request, abort
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Commande, CommandeProduit, Panier, Utilisateur, db

order_bp = Blueprint('order', __name__)

# Route to get the list of pending orders for a user
@order_bp.route('/commandes_en_attente', methods=['GET'])
@jwt_required()
def get_commandes_en_attente():
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    commandes = Commande.query.filter_by(utilisateur_id=current_user.id, statut='En attente').all()
    return jsonify([commande.to_dict() for commande in commandes]), 200

@order_bp.route('/commandes', methods=['GET'])
@jwt_required()
def liste_commandes():
    current_user = Utilisateur.query.get(get_jwt_identity())
    commandes = Commande.query.filter_by(utilisateur_id=current_user.id).all()
    return jsonify([commande.to_dict() for commande in commandes])

@order_bp.route('/commande/<int:commande_id>', methods=['GET'])
@jwt_required()
def detail_commande(commande_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    commande = Commande.query.get_or_404(commande_id)
    if commande.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")
    return jsonify(commande.to_dict())

@order_bp.route('/creer_commande', methods=['POST'])
@jwt_required()
def creer_commande():
    data = request.get_json()
    selected_items = data.get('selected_items', [])
    total_prix = 0
    current_user = Utilisateur.query.get(get_jwt_identity())

    commande = Commande(
        utilisateur_id=current_user.id,
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
        if panier_item.utilisateur_id != current_user.id:
            abort(403, description="Accès interdit")
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

    return jsonify(commande.to_dict()), 201

@order_bp.route('/annuler_commande/<int:commande_id>', methods=['DELETE'])
@jwt_required()
def annuler_commande(commande_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    commande = Commande.query.get_or_404(commande_id)
    if commande.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")
    commande.statut = 'Annulée'
    db.session.commit()
    return '', 204

#all commandes

@order_bp.route('/commandes_admin', methods=['GET'])
def liste_commandes_admin():
    commandes = Commande.query.all()
    return jsonify([commande.to_dict() for commande in commandes])


@order_bp.route('/derniere_commande', methods=['GET'])
@jwt_required()
def derniere_commande():
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    derniere_commande = Commande.query.filter_by(utilisateur_id=current_user.id).order_by(Commande.date_creation.desc()).first()
    if not derniere_commande:
        abort(404, description="Aucune commande trouvée")

    return jsonify(derniere_commande.to_dict())