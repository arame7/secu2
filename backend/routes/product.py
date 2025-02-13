from datetime import datetime
import os
import uuid
from flask import Blueprint, jsonify, request, abort, send_from_directory
from flask_jwt_extended import get_jwt_identity, jwt_required
from models import Produit, Commentaire, Favori, Utilisateur, db

product_bp = Blueprint('product', __name__)
UPLOAD_FOLDER = 'uploads'

@product_bp.route('/produits', methods=['GET'])
def liste_produits():
    produits = Produit.query.all()
    return jsonify([produit.to_dict() for produit in produits])


@product_bp.route('/produit/<int:produit_id>', methods=['GET'])
def detail_produit(produit_id):
    produit = Produit.query.get_or_404(produit_id)
    return jsonify(produit.to_dict())

@product_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Générer un nom de fichier unique
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Retourner l'URL de l'image enregistrée
    return jsonify({'imageUrl': f'/uploads/{filename}'})


@product_bp.route('/static/uploads/<path:filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@product_bp.route('/ajouter_produit', methods=['POST'])
def ajouter_produit():
    data = request.json
    nom = data.get('nom')
    prix = data.get('prix')
    description = data.get('description')
    stock = data.get('stock')
    image_url = data.get('imageUrl')

    # Validation des données
    if not nom:
        return jsonify({'error': 'Le nom du produit est obligatoire'}), 400
    if not prix:
        return jsonify({'error': 'Le prix du produit est obligatoire'}), 400
    if not description:
        return jsonify({'error': 'La description du produit est obligatoire'}), 400
    if not stock:
        return jsonify({'error': 'Le stock du produit est obligatoire'}), 400
    if not image_url:
        return jsonify({'error': 'L\'image du produit est obligatoire'}), 400

    # Création du nouveau produit
    nouveau_produit = Produit(
        nom=nom,
        prix=prix,
        description=description,
        stock=stock,
        date_creation=datetime.utcnow(),
        image_url=image_url
    )
    db.session.add(nouveau_produit)
    db.session.commit()

    return jsonify(nouveau_produit.to_dict()), 201

@product_bp.route('/modifier_produit/<int:produit_id>', methods=['PUT'])
def modifier_produit(produit_id):
    produit = Produit.query.get_or_404(produit_id)
    data = request.json
    produit.nom = data.get('nom', produit.nom)
    produit.prix = data.get('prix', produit.prix)
    produit.description = data.get('description', produit.description)
    produit.stock = data.get('stock', produit.stock)
    produit.image_url = data.get('imageUrl', produit.image_url)

    db.session.commit()

    return jsonify(produit.to_dict())

@product_bp.route('/supprimer_produit/<int:produit_id>', methods=['DELETE'])
def supprimer_produit(produit_id):
    produit = Produit.query.get_or_404(produit_id)
    db.session.delete(produit)
    db.session.commit()

    return '', 204

@product_bp.route('/ajouter_commentaire/<int:produit_id>', methods=['POST'])
@jwt_required()
def ajouter_commentaire(produit_id):
    data = request.get_json()
    utilisateur_id = get_jwt_identity()
    utilisateur = Utilisateur.query.get(utilisateur_id)
    contenu = data.get('contenu')

    if not contenu:
        abort(400, description="Contenu du commentaire manquant")

    produit = Produit.query.get_or_404(produit_id)
    commentaire = Commentaire(utilisateur_id=utilisateur.id, produit_id=produit.id, contenu=contenu)
    db.session.add(commentaire)
    db.session.commit()

    return jsonify(commentaire.to_dict()), 201

@product_bp.route('/commentaires/<int:produit_id>', methods=['GET'])
def liste_commentaires(produit_id):
    produit = Produit.query.get_or_404(produit_id)
    commentaires = Commentaire.query.filter_by(produit_id=produit.id).all()
    return jsonify([commentaire.to_dict() for commentaire in commentaires])

@product_bp.route('/ajouter_favori/<int:produit_id>', methods=['POST'])
@jwt_required()
def ajouter_favori(produit_id):
    produit = Produit.query.get_or_404(produit_id)
    id = get_jwt_identity()
    current_user = Utilisateur.query.get(id)
    favori = Favori(utilisateur_id=current_user.id, produit_id=produit.id)
    db.session.add(favori)
    db.session.commit()

    return jsonify(favori.to_dict()), 201

@product_bp.route('/favoris', methods=['GET'])
@jwt_required()
def liste_favoris():
    current_user = Utilisateur.query.get(get_jwt_identity())
    favoris = Favori.query.filter_by(utilisateur_id=current_user.id).all()
    produits = Produit.query.filter_by(id = Favori.produit_id).all()
    return jsonify([favori.to_dict() for favori in produits])

@product_bp.route('/supprimer_favori/<int:favori_id>', methods=['DELETE'])
def supprimer_favori(favori_id):
    favori = Favori.query.get_or_404(favori_id)
    current_user = Utilisateur.query.get(get_jwt_identity())
    if favori.utilisateur_id != current_user.id:
        abort(403, description="Accès interdit")
    db.session.delete(favori)
    db.session.commit()

    return '', 204
