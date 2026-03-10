# Mon Vieux Grimoire - Projet de Notation de Livres

Ce projet est une application web full-stack développée dans le cadre de la formation OpenClassrooms. Il s'agit d'un site de partage et de notation de livres, utilisant la stack MERN (MongoDB, Express, React, Node.js).

---

## Architecture du Projet

Le projet se compose de deux parties distinctes qui communiquent via une API REST :
* **Front-end** : Application client développée en **React**.
* **Back-end** : Serveur API développé en **Node.js** avec le framework **Express**.
* **Base de données** : **MongoDB**.

---

## Sécurité et Bonnes Pratiques

Conformément aux exigences du projet, une attention particulière a été portée à la sécurité :

* **Variables d'environnement** : Utilisation du package `dotenv` pour externaliser les données sensibles.
* **Découplage** : L'URL de la base de données (contenant les identifiants) et la clé secrète du Token (JWT) ne sont plus écrites en dur dans le code source.
* **Protection Git** : Le fichier `.env` est listé dans le fichier `.gitignore` afin d'éviter toute exposition accidentelle sur des dépôts publics.
* **Authentification** : Utilisation de **JSON Web Token (JWT)** pour sécuriser les routes de création, modification et suppression.
* **Hachage** : Les mots de passe des utilisateurs sont sécurisés avec **bcrypt**.

---

## Installation et Lancement

### 1. Configuration du Back-end (Serveur)
Ouvrir un terminal dans le dossier backend.

Installer les dépendances :

Bash
npm install
npm install dotenv --legacy-peer-deps
Créer un fichier .env à la racine du dossier backend :

Plaintext
MONGO_URL=votre_url_mongodb_atlas
JWT_SECRET=votre_cle_secrete_jwt
Lancer le serveur :

Bash
Nodemon start
(Le serveur doit confirmer la connexion à MongoDB)


### 2. Configuration du Frontend
Ouvrir un nouveau terminal dans le dossier frontend.

Installer les dépendances :

Bash
npm install
Lancer le projet :

Bash
npm start

---

## Fonctionnalités de l'Application

Authentification : Inscription et connexion des utilisateurs.

Navigation : Visualisation de la liste des livres et des détails de chaque ouvrage.

Notation : Système de notation (rating) pour chaque livre.

Gestion du contenu : Ajout, modification et suppression de livres par leur propriétaire.

Optimisation : Redimensionnement automatique des images téléchargées.

Développeur
Projet réalisé par Yang - Parcours Développeur Web OpenClassrooms.