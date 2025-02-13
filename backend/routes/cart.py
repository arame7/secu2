from flask import Blueprint, jsonify, request, abort
from models import Panier, PanierProduit, Produit, Utilisateur, Commande, CommandeProduit, Paiement, db
from flask_jwt_extended import get_jwt_identity, jwt_required
from datetime import datetime

cart_bp = Blueprint('cart', __name__)
order_bp = Blueprint('order', __name__)
payment_bp = Blueprint('payment', __name__)

# Route pour récupérer le panier d'un utilisateur connecté
@cart_bp.route('/panier', methods=['GET'])
@jwt_required()
def get_panier():
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    panier = Panier.query.filter_by(utilisateur_id=current_user.id).first()
    if not panier:
        return jsonify({'items': [], 'total_prix': 0})

    panier_items = PanierProduit.query.filter_by(panier_id=panier.id).all()
    total_prix = sum(item.produit.prix * item.quantite for item in panier_items)

    return jsonify({
        'items': [item.to_dict() for item in panier_items],
        'total_prix': total_prix
    })

# Route pour ajouter un produit au panier
@cart_bp.route('/ajouter_au_panier/<int:produit_id>', methods=['POST'])
@jwt_required()
def ajouter_au_panier(produit_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    produit = Produit.query.get_or_404(produit_id)
    data = request.get_json()
    quantite = data.get('quantite', 1)

    if quantite <= 0:
        abort(400, description="Quantité invalide")

    panier = Panier.query.filter_by(utilisateur_id=current_user.id).first()
    if not panier:
        panier = Panier(utilisateur_id=current_user.id)
        db.session.add(panier)
        db.session.commit()

    panier_item = PanierProduit.query.filter_by(panier_id=panier.id, produit_id=produit.id).first()
    if panier_item:
        panier_item.quantite += quantite
    else:
        panier_item = PanierProduit(panier_id=panier.id, produit_id=produit.id, quantite=quantite)
        db.session.add(panier_item)

    db.session.commit()
    return jsonify(panier_item.to_dict()), 201

# Route pour supprimer un produit du panier
@cart_bp.route('/supprimer_du_panier/<int:panier_produit_id>', methods=['DELETE'])
@jwt_required()
def supprimer_du_panier(panier_produit_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    panier_item = PanierProduit.query.get_or_404(panier_produit_id)
    if panier_item.panier.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")

    db.session.delete(panier_item)
    db.session.commit()

    return jsonify({"message": "Produit supprimé du panier"}), 200

# Route pour modifier la quantité d'un produit du panier
@cart_bp.route('/modifier_quantite_panier/<int:panier_produit_id>', methods=['PUT'])
@jwt_required()
def modifier_quantite_panier(panier_produit_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    data = request.get_json()
    nouvelle_quantite = data.get('quantite')

    if nouvelle_quantite is None or nouvelle_quantite <= 0:
        abort(400, description="Quantité invalide")

    panier_item = PanierProduit.query.get_or_404(panier_produit_id)
    if panier_item.panier.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")

    panier_item.quantite = nouvelle_quantite
    db.session.commit()

    return jsonify(panier_item.to_dict()), 200

# Route pour créer une commande à partir du panier
@cart_bp.route('/creer_commande', methods=['POST'])
@jwt_required()
def creer_commande():
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")
    if not current_user.adresse:
        abort(400, description="L'adresse de livraison est requise")

    panier = Panier.query.filter_by(utilisateur_id=current_user.id).first()
    if not panier:
        abort(404, description="Panier non trouvé")

    panier_items = PanierProduit.query.filter_by(panier_id=panier.id).all()
    if not panier_items:
        abort(400, description="Le panier est vide")

    total_prix = sum(item.produit.prix * item.quantite for item in panier_items)


    commande = Commande(
        utilisateur_id=current_user.id,
        nom_client=current_user.nom_utilisateur,
        email_client=current_user.email,
        tel_client=current_user.tel,
        adresse_livraison=current_user.adresse, 
        total_prix=total_prix,
        statut='En attente'
    )
    db.session.add(commande)
    db.session.commit()

    for item in panier_items:
        commande_produit = CommandeProduit(
            commande_id=commande.id,
            produit_id=item.produit_id,
            quantite=item.quantite,
            prix_unitaire=item.produit.prix
        )
        db.session.add(commande_produit)

    db.session.delete(panier)
    db.session.commit()

    return jsonify(commande.to_dict()), 201


# Route pour gérer le paiement
@cart_bp.route('/effectuer_paiement/<int:commande_id>', methods=['POST'])
@jwt_required()
def effectuer_paiement(commande_id):
    current_user = Utilisateur.query.get(get_jwt_identity())
    if not current_user:
        abort(404, description="Utilisateur non trouvé")

    commande = Commande.query.get_or_404(commande_id)
    if commande.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")

    data = request.get_json()
    methode_paiement = data.get('methode_paiement')
    montant = data.get('montant')

    if not methode_paiement or not montant:
        abort(400, description="Données de paiement invalides")

    paiement = Paiement(
        commande_id=commande.id,
        montant=montant,
        methode_paiement=methode_paiement,
        statut='Completée'
    )
    db.session.add(paiement)
    commande.statut = 'Payée'
    db.session.commit()

    return jsonify(paiement.to_dict()), 201
