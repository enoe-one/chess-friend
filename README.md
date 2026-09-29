# ♞ Chess-friend

Un site d'échecs multijoueur en 1 contre 1, statique et open source, sans backend à faire tourner soi-même : Firebase gère les comptes et le temps réel.

**[👉 Jouer maintenant](https://enoe-one.github.io/chess-friend/)** <!-- remplace ce lien par l'adresse de ton site une fois en ligne -->

## Fonctionnalités

- **Comptes** par email/mot de passe ou en un clic avec Google.
- **Bots** à 4 niveaux (Débutant, Facile, Moyen, Fort), min-max avec élagage alpha-bêta.
- **Défis en ligne** avec cadence au choix : Bullet (1 min), Blitz (3+2), 10 minutes, 1 heure.
- **Défis privés** envoyés à un ami, et **défis publics** visibles de tous les joueurs connectés.
- **Système d'amis** par code personnel à 4 chiffres.
- **Classement** du nombre de victoires entre joueurs (hors bots).
- **Promotion du pion au choix** (dame, tour, fou, cavalier) et **abandon**.
- **Horloges en temps réel**, avec perte au temps.
- **Analyse post-partie** avec Stockfish (chargé dans le navigateur) : chaque coup est étiqueté (brillant, meilleur coup, très bon coup, bon coup, coup raté, gaffe), avec relecture coup par coup.
- **Mini-jeu original : la dame cachée.** Chaque joueur désigne en secret un pion qui est en réalité une dame. Elle reste déguisée en pion tant qu'elle ne joue que des coups légaux pour un pion (avance d'une ou deux cases, prise en diagonale) ; tout autre coup la révèle.

## Stack technique

- **Frontend** : une seule page HTML/CSS/JS, sans framework ni étape de build.
- **Échecs** : [chess.js](https://github.com/jhlywa/chess.js) pour les règles et la validation des coups.
- **Backend** : [Firebase](https://firebase.google.com/) — Authentication (comptes) + Firestore (base de données temps réel).
- **Moteur d'analyse** : [Stockfish.js](https://github.com/nmrugg/stockfish.js), chargé à la demande depuis un CDN.
- **Hébergement** : n'importe quel hébergeur de site statique (GitHub Pages, Cloudflare Pages, Netlify…).

## Structure du dépôt

```
index.html          Page du site (structure + logique)
style.css           Apparence du site
config.js           Configuration Firebase (clés publiques du projet)
firestore.rules     Règles de sécurité de la base de données
PRESENTATION.md      Présentation du site pour les joueurs
```

## Installation (pour héberger ta propre instance)

1. **Crée un projet Firebase** sur [console.firebase.google.com](https://console.firebase.google.com).
2. **Active l'authentification** : Authentication → Sign-in method → active « E-mail/Mot de passe » et, si tu veux, « Google ».
3. **Crée une base Firestore** : Firestore Database → Créer une base → mode production, région en Europe.
4. **Publie les règles de sécurité** : colle le contenu de `firestore.rules` dans l'onglet Règles de Firestore, puis Publier.
5. **Récupère ta configuration** : Paramètres du projet → Vos applications → ajoute une application Web, copie `apiKey`, `authDomain`, `projectId` et `appId`.
6. **Renseigne `config.js`** avec ces 4 valeurs.
7. **Déploie** `index.html`, `style.css` et `config.js` sur GitHub Pages, Cloudflare Pages, ou tout autre hébergeur statique.
8. **Autorise ton domaine** : Authentication → Paramètres → Domaines autorisés → ajoute l'adresse de ton site.

Aucune étape ne nécessite de ligne de commande ni de compilation.

## Sécurité

- Les règles de `firestore.rules` limitent qui peut lire et écrire quoi (un joueur ne peut modifier que ses propres parties, son propre profil, etc.).
- La validation des coups se fait côté client (dans le navigateur), ce qui suffit pour un usage entre amis mais ne protège pas d'un joueur qui modifierait son propre client.
- La clé `apiKey` dans `config.js` est une clé publique Firebase, faite pour être exposée : ce n'est pas un secret, la sécurité réelle vient des règles Firestore.

## Limites connues

- Pas de vérification des coups côté serveur.
- Les horloges se basent sur l'heure de chaque appareil.
- Le mode « dame cachée » n'est pas compatible avec l'analyse post-partie (Stockfish ne connaît pas cette variante).
- Pas de proposition de nulle, ni d'historique des coups affiché pendant la partie (seulement à l'analyse).

## Contribuer

Le projet est ouvert aux contributions : idées, corrections de bugs, nouvelles fonctionnalités. Ouvre une *issue* pour en discuter, ou propose directement une *pull request*.

## Licence

Ce projet est open source.
