---
name: "Brainstorming Session — Track My Box"
date: "2026-03-16"
user: "Adelboudalha"
session_topic: "Application Expo Track My Box — Gestion intelligente de cartons de déménagement"
session_goals: "Définir toutes les fonctionnalités de l'app, explorer les cas d'usage, construire une roadmap v1/v2/v3"
selected_approach: "ai-recommended"
techniques_used: ["SCAMPER", "What If Scenarios", "Cross-Pollination"]
total_ideas: 63
stepsCompleted: [1, 2, 3, 4]
workflow_completed: true
---

# Brainstorming Session — Track My Box
**Date :** 16 mars 2026
**Facilitateur :** Claude (BMAD Brainstorming)
**Participant :** Adelboudalha

---

## Session Overview

**Sujet :** Track My Box — Application mobile Expo pour la gestion intelligente de cartons de déménagement via QR codes, photos d'articles, impression de stickers et collaboration familiale.

**Objectifs :**
- Enrichir les fonctionnalités core de l'application
- Explorer les cas d'usage au-delà du déménagement
- Construire une roadmap claire v1 / v2 / v3

**Contraintes définies en session :**
- Pas de NFC (achat matériel supplémentaire) → v2 éventuelle
- Pas d'IA de reconnaissance d'objets (coût API + imprécision) → écarté
- Simplicité maximale : navigation rapide, onboarding en 30 secondes
- Support obligatoire mini imprimante **Kawai MX06** (Bluetooth Low Energy)
- QR Code ou code-barres comme identifiant principal

**Techniques utilisées :** SCAMPER · What If Scenarios · Cross-Pollination

---

## Concept de l'Application

Track My Box est une application mobile Expo permettant de :
1. Photographier les articles et les associer à un conteneur (carton, sac, valise...)
2. Générer un QR code ou code-barres unique par conteneur
3. Imprimer un sticker visuel via mini imprimante Bluetooth (Kawai MX06) ou export PDF
4. Scanner le sticker pour voir instantanément le contenu complet
5. Gérer un déménagement complet avec checklist, rôles, alertes et rapports
6. Fonctionner en mode offline total avec sync cloud optionnelle

---

## Toutes les Idées — Par Technique

### 🅢 SUBSTITUTE — Substituer

**[S #1] QR-or-Bar Flexibility**
*Concept :* L'utilisateur choisit à la création du conteneur : QR code ou code-barres 1D. Le QR stocke plus d'informations (URL de la fiche), le code-barres est plus rapide à scanner avec certains lecteurs.
*Nouveauté :* Double format selon le matériel disponible chez l'utilisateur.
*Statut :* ✅ V1

**[S #2] Universal Print Adapter**
*Concept :* Le sticker généré s'adapte au format choisi — de l'étiquette mini imprimante thermique jusqu'au A4 découpable avec plusieurs stickers par page (A4, A3, A6...).
*Nouveauté :* Zéro friction pour les non-équipés mini imprimante.
*Statut :* ✅ V1

**[S #3] Visual Thermal Sticker**
*Concept :* Le sticker imprimé contient le QR code + une icône vectorielle de la pièce (🛋️ salon, 🍼 chambre bébé, 🍳 cuisine...) placée au centre ou à côté du QR. Optimisé noir & blanc pour impression thermique — icônes simples, contrastées, lisibles en petit format.
*Nouveauté :* L'imprimante thermique n'imprime pas de couleur → on compense par des icônes fortes et reconnaissables qui suffisent à identifier la pièce d'un coup d'œil, sans même scanner.
*Statut :* ✅ V1

**[S #4] Human-Readable Sticker**
*Concept :* Sous le QR code, on imprime automatiquement le nom de la pièce, le numéro du conteneur, et les 2-3 premiers articles du contenu en texte lisible. Le QR donne accès au détail complet.
*Nouveauté :* L'app fonctionne même pour les personnes qui n'ont pas de smartphone — le sticker seul est déjà utile.
*Statut :* ✅ V1

---

### 🅒 COMBINE — Combiner

**[C #1] Objets en Garde / Dépôt Tiers**
*Concept :* Une section séparée "Objets de quelqu'un d'autre" — on note le propriétaire (Maman, Beau-frère, Voisin...), la description de l'objet/sac, et une date de restitution optionnelle. Ces objets apparaissent dans un onglet distinct avec un badge "🔖 Pas à moi".
*Nouveauté :* Évite les confusions familiales — "c'est à qui ce sac ?" devient une question résolue en 2 secondes.
*Statut :* ✅ V1

**[C #2] Dépôt + Notification de Restitution**
*Concept :* Quand on enregistre un objet en garde, on peut définir une date ou un événement. L'app envoie une notification push à J-1 et le jour J : "📦 Rappel : 2 sacs de ta mère à restituer".
*Nouveauté :* Combinaison dépôt temporaire + notifications push → zéro oubli, même 3 semaines après.
*Statut :* ✅ V1

**[C #3] Carton + Priorité de Déballage**
*Concept :* Chaque conteneur reçoit une priorité : 🔴 Urgent (déballer jour 1 — médicaments, chargeurs...), 🟡 Cette semaine, 🟢 Pas pressé. La checklist de déchargement trie automatiquement par priorité.
*Nouveauté :* Combine inventaire + logistique temporelle. Le déménageur sait dans quel ordre décharger.
*Statut :* ✅ V1

**[C #4] Carton + Poids Estimé**
*Concept :* L'utilisateur coche Lourd / Moyen / Léger à la création. Information utile pour le chargement du camion.
*Nouveauté :* Combine inventaire + logistique physique de transport.
*Statut :* 🔜 V2 (optionnel)

**[C #5] Pièces + Progression Visuelle**
*Concept :* Vue "Maison de destination" — chaque pièce affiche une barre de progression (🛋️ Salon : 5/8 cartons déposés). En scannant chaque carton à l'arrivée, la progression se met à jour en temps réel, visible par tous les membres connectés.
*Nouveauté :* Combine plan de maison + checklist + partage temps réel.
*Statut :* ✅ V1

**[C #6] Photo de la Pile dans le Camion**
*Concept :* En plus des photos des articles à l'intérieur, on peut prendre une photo de l'extérieur du carton dans le camion (position dans la pile). Optionnel.
*Nouveauté :* Combine position physique + inventaire numérique.
*Statut :* 🔜 V2 (optionnel)

---

### 🅐 ADAPT — Adapter

**[A #1] Zone de Chargement Camion**
*Concept :* Inspiré d'Amazon Warehouse. Le camion devient une grille (Gauche/Droite, Avant/Arrière, Haut/Bas). On assigne une zone au carton en 2 taps au chargement.
*Nouveauté :* Logistique professionnelle adaptée au particulier — sans complexité.
*Statut :* 🔜 V2

**[A #2] Collections / Tags**
*Concept :* Inspiré de Spotify. On crée des collections thématiques de conteneurs : "Affaires fragiles", "Priorité déballage", "Affaires d'été". Un carton peut appartenir à plusieurs collections simultanément.
*Nouveauté :* Système de tags flexible — un carton peut croiser plusieurs dimensions d'organisation.
*Statut :* 🔜 V2

**[A #3] Guidage vers la Pièce Destination**
*Concept :* Après avoir scanné un conteneur à l'arrivée, l'app indique "Ce carton va dans : 🍼 Chambre bébé — 2ème étage, 1ère porte à gauche" avec la description que l'utilisateur a définie.
*Nouveauté :* Adapter le guidage GPS au guidage physique dans une maison.
*Statut :* 🔜 V2

**[A #4] Statuts Kanban**
*Concept :* Inspiré de Trello. Chaque conteneur a un statut visuel : 📦 Emballé → 🚚 Dans le camion → 🏠 Déposé → 📂 Débállé. Scan ou glissement pour changer le statut.
*Nouveauté :* Workflow Kanban adapté à la logistique physique — vision globale du déménagement.
*Statut :* ✅ V1

**[A #5] Alertes Intelligentes Contextuelles**
*Concept :* Inspiré de Waze. Notifications proactives selon l'avancement : "🔴 3 cartons urgents pas encore scannés", "⚠️ Carton fragile détecté — manipuler avec soin", "✅ Déménagement terminé à 94%".
*Nouveauté :* Alertes trafic adaptées à la logistique de déménagement.
*Statut :* 🔜 V2

**[A #6] Accès Temporaire Déménageur**
*Concept :* Inspiré du check-in hôtel. On génère un accès temporaire QR pour un déménageur ou ami — il peut scanner et mettre à jour les statuts, mais pas modifier le contenu. Accès expiré après la journée.
*Nouveauté :* Accès limité dans le temps pour les non-membres de la famille.
*Statut :* 🔜 V2

**[A #7] Progressive Feature Unlocking**
*Concept :* L'app démarre en mode "Essentiel" — ultra simple, 3 actions max. Dans les paramètres, l'utilisateur active les modules avancés : Gestion des pièces, Checklist, Dépôt tiers, Priorités, Statuts Kanban... Chaque module activé = nouvelle section qui apparaît.
*Nouveauté :* L'app s'adapte au niveau de l'utilisateur. Onboarding en 30 secondes garanti.
*Statut :* ✅ V1

---

### 🅜 MODIFY / MAGNIFY — Modifier / Amplifier

**[M #1] QR Code Vivant**
*Concept :* Le QR code imprimé pointe vers une référence unique (URL ou ID) liée à la liste d'articles en base de données locale ou cloud. Si on ajoute un article après l'impression, la fiche est déjà à jour. Jamais besoin de réimprimer le sticker.
*Nouveauté :* Le QR code n'est plus une photo figée — c'est un lien permanent vers l'état actuel du conteneur.
*Statut :* ✅ V1 (architecture fondamentale)

**[M #2] Rôles dans le Déménagement**
*Concept :* On crée un "Déménagement" avec des rôles : 👑 Chef (tout modifier), 📦 Chargeur (ajouter cartons), ✅ Déchargeur (scanner à l'arrivée), 👁️ Observateur (voir uniquement).
*Nouveauté :* Le partage devient une vraie coordination d'équipe avec permissions granulaires.
*Statut :* ✅ V1

**[M #3] Journal de Déménagement PDF**
*Concept :* Chaque action est horodatée et loggée. À la fin, on génère un résumé PDF : "Déménagement du 15 mars — 47 cartons, 6h12 de déchargement, 0 carton perdu." Souvenir ou preuve pour un déménagement professionnel.
*Nouveauté :* L'activité de déménagement devient un document traçable.
*Statut :* 🔜 V2

**[M #4] Mode Déménagement Actif**
*Concept :* En appuyant sur "Démarrer le déménagement", l'app passe en mode actif — écran allumé, scanner toujours prêt, notifications temps réel pour tous les membres. Quand tout est scanné, notification collective "🎉 Déménagement terminé !"
*Nouveauté :* Un mode dédié qui transforme l'app en vrai outil de coordination le jour J.
*Statut :* ✅ V1

**[M #5] Sticker Multi-Langue**
*Concept :* Le nom de la pièce peut être généré en 2 langues sur le sticker. "Salon / Living Room". Configurable dans les paramètres.
*Nouveauté :* Utile pour les expatriés ou déménagements internationaux.
*Statut :* 🔜 V2

**[M #6] Sync Intelligente Silencieuse**
*Concept :* En mode offline, tout fonctionne normalement. Dès qu'il y a du réseau, la sync se fait en arrière-plan silencieusement. Un indicateur discret affiche "✅ Synchronisé" ou "📶 3 actions en file".
*Nouveauté :* L'offline est transparent — même dans une cave sans réseau.
*Statut :* ✅ V1

---

### 🅟 PUT TO OTHER USES — Utiliser autrement

**[P #1] Garde-Meuble / Box de Stockage**
*Concept :* Même logique que le déménagement — des cartons dans un box loué. Scanner pour retrouver ses affaires d'hiver ou décos de Noël sans tout déballer.
*Statut :* 🚀 V3

**[P #2] Cave / Grenier / Débarras**
*Concept :* Inventaire permanent de la maison — "c'est dans le carton 4 du grenier, rayon 2". L'app devient utile 365 jours par an.
*Statut :* 🚀 V3

**[P #3] Déménagement Professionnel / Entreprise**
*Concept :* Entreprise déménageant ses bureaux — archives, matériel informatique, mobilier. Responsable crée le déménagement, assigne des équipes par étage, génère des rapports.
*Statut :* 🔜 V2 (base du mode pro)

**[P #4] Prêt d'Objets entre Amis**
*Concept :* "J'ai prêté ma perceuse à Karim en novembre". Boîte virtuelle par personne, date de prêt, rappel push de restitution.
*Statut :* 🚀 V3

**[P #5] Valises de Voyage**
*Concept :* Avant un voyage, on photographie le contenu de chaque valise. À l'hôtel, on sait dans quelle valise est le chargeur. Le QR sticker devient une étiquette bagage intelligente.
*Statut :* 🚀 V3

**[P #6] Don / Vide-Grenier**
*Concept :* On prépare des cartons pour donner ou vendre. On photographie chaque article avec un prix estimé. On partage la liste avec acheteurs potentiels avant le vide-grenier.
*Statut :* 🚀 V3

**[P #7] Héritage / Succession**
*Concept :* Inventorier les objets d'un proche décédé, assigner des objets aux membres de la famille, documenter ce qui va où.
*Statut :* 🚀 V3

**[P #8] Déménagement Étudiant Annuel**
*Concept :* Les étudiants déménagent chaque année. Ils gardent leurs cartons — même QR code, contenu mis à jour. "Carton Cuisine Étudiant" devient permanent d'une année à l'autre.
*Statut :* 🚀 V3

---

### 🅔 ELIMINATE — Éliminer les frictions

**[E #1] Pas de Compte Obligatoire**
*Concept :* L'app fonctionne immédiatement sans compte — mode local complet. La création de compte n'est demandée que pour le partage familial ou la sync cloud. Zéro barrière à l'entrée.
*Statut :* ✅ V1

**[E #2] Suggestions Rapides + Saisie Manuelle**
*Concept :* Photo → champ texte avec suggestions (Vêtements, Livres, Vaisselle, Câbles, Jouets...). Un tap suffit pour les articles communs. La saisie manuelle reste toujours disponible.
*Statut :* ✅ V1

**[E #3] Double Mode Navigation**
*Concept :* Quand on est sur le Wi-Fi de sa maison, l'app propose une vue liste de tous les conteneurs (navigation directe). Le scan reste disponible à tout moment pour accéder à un carton spécifique. Les deux modes coexistent.
*Statut :* ✅ V1

**[E #4] Onboarding Progressif**
*Concept :* Pas d'onboarding de 10 écrans. Un seul bouton au démarrage : "+ Créer mon premier carton". Les pièces, paramètres et modules avancés se configurent au fur et à mesure du besoin.
*Statut :* ✅ V1

**[E #5] Jamais Réimprimer un Sticker**
*Concept :* Grâce au QR Vivant (M#1), le contenu peut être modifié indéfiniment sans jamais réimprimer. Le QR colle une fois pour toujours.
*Statut :* ✅ V1 (découle de l'architecture QR Vivant)

**[E #6] Types de Conteneurs Universels**
*Concept :* Au lieu de "carton" uniquement, le type de conteneur est sélectionnable en 1 tap : 📦 Carton, 🛍️ Grand sac, 🧳 Valise, 📫 Boîte, 🗂️ Dossier, 🛒 Sachet. L'icône du sticker change selon le type.
*Statut :* ✅ V1

**[E #7] Alerte Carton Perdu**
*Concept :* Vue "Conteneurs non scannés à l'arrivée" en rouge. Notification automatique si un conteneur n'a pas été scanné après 24h du début du déchargement.
*Statut :* ✅ V1

---

### 🅡 REVERSE — Inverser

**[R #1] Commencer par la Destination (Optionnel)**
*Concept :* Option de commencer par configurer la maison de destination — ses pièces, priorités. Ensuite on emballe en sachant déjà où chaque chose va atterrir.
*Statut :* 🔜 V2 (optionnel utilisateur)

**[R #2] Stickers pour les Pièces de la Maison (Optionnel)**
*Concept :* L'utilisateur peut imprimer un QR sticker pour chaque pièce de la maison de destination (collé sur la porte). Optionnel — si l'utilisateur le veut.
*Statut :* 🔜 V2 (optionnel)

**[R #3] Focus sur ce qui Manque**
*Concept :* Au lieu d'afficher "32 cartons scannés ✅", l'app affiche en permanence "⚠️ 4 cartons pas encore arrivés" avec leur contenu. L'attention va naturellement vers l'incomplet.
*Statut :* ✅ V1

**[R #4] Mode Déballage Inversé**
*Concept :* On scanne le carton à l'arrivée et on note les articles au fur et à mesure qu'on les sort. L'inventaire se construit au déballage plutôt qu'à l'emballage. Pour les utilisateurs qui découvrent l'app après le déménagement.
*Statut :* ✅ V1

**[R #5] Chatbot Recherche Naturelle**
*Concept :* Mini chatbot avec clé API OpenAI légère. L'utilisateur tape "où est mon chargeur MacBook ?" → le chatbot accède à l'inventaire complet (titres + images) et répond "📦 Carton 7 — Salon, Grande valise noire". Interface chat simple et intuitive.
*Statut :* 🔜 V2

---

### 💡 WHAT IF — Et si...

**[W #1] Résumé Vocal Mains Libres**
*Concept :* À l'ouverture d'une fiche carton, un résumé vocal se génère depuis les articles enregistrés — "Ce carton contient 12 articles du salon : des livres, une lampe et des câbles." Lecture audio mains libres pendant qu'on porte des cartons.
*Statut :* 🔜 V2

**[W #2] Scan Simultané — Détection de Conflit**
*Concept :* Deux personnes scannent le même carton simultanément → l'app détecte le conflit et affiche "⚠️ Ahmed scanne aussi ce carton". Synchronisation des actions en temps réel.
*Statut :* 🔜 V2

**[W #3] Prédiction Proactive**
*Concept :* L'app apprend les habitudes — "Adel cherche souvent ses câbles le premier soir". Elle suggère proactivement : "🔍 Tu cherches peut-être tes chargeurs ? → Carton 3".
*Statut :* 🔜 V2

**[W #5] Lien de Partage Temporaire**
*Concept :* On génère un lien de partage temporaire (24h) vers la fiche d'un carton. Envoyé par WhatsApp, le destinataire voit le contenu sans avoir l'app, sans compte.
*Statut :* ✅ V1

**[W #7] Import depuis Liste Existante**
*Concept :* Import depuis Notes iPhone, Excel, Google Sheets, Notion. Si l'utilisateur a déjà une liste d'articles quelque part, on la colle dans l'app et elle crée les cartons automatiquement. Zéro resaisie.
*Statut :* ✅ V1

**[W #8] Rapport de Santé Final**
*Concept :* À la fin du déménagement, l'app génère un bilan complet : nombre de cartons, articles, temps total, cartons par pièce, objets en garde, objets prêtés. Partageable en PDF ou lien. "🎉 Déménagement terminé en 4h32 — 47 cartons, 0 perdu."
*Statut :* ✅ V1

---

### 🌍 CROSS-POLLINATION — Inspiration croisée

**[X #1] Shazam pour Objets**
*Concept :* Pointer la caméra vers un objet → l'app suggère automatiquement une catégorie et un nom depuis votre propre historique d'articles déjà enregistrés. "Tu as déjà enregistré un objet similaire : Lampe de salon." Un tap pour confirmer.
*Nouveauté :* Reconnaissance basée sur l'historique personnel — zéro coût API, zéro erreur d'IA générique.
*Statut :* 🔜 V2

**[X #4] Galerie Photo par Carton**
*Concept :* Inspiré d'iCloud Photos. Chaque conteneur a sa galerie photo avec zoom, swipe entre articles, possibilité de commenter une photo spécifique. "Cette lampe → fragile, bulle d'air insuffisante."
*Nouveauté :* L'inventaire devient visuel et agréable à consulter — pas juste une liste froide.
*Statut :* ✅ V1

**[X #8] Marketplace Surplus**
*Concept :* Inspiré de Vinted. En préparant ses cartons, l'utilisateur marque certains articles "À donner" ou "À vendre". L'app génère une liste partageable — amis ou voisins peuvent réserver avant le vide-grenier.
*Nouveauté :* Le tri pré-déménagement devient une opportunité sociale.
*Statut :* 🚀 V3

---

## Roadmap — Priorisation

### ✅ V1 — ESSENTIEL (Lancer l'app)

**🏗️ Architecture & Fondations**
- [ ] Pas de compte obligatoire — mode local complet d'emblée
- [ ] Onboarding progressif — 1 bouton "Créer mon premier carton"
- [ ] Modules activables/désactivables dans les paramètres
- [ ] Architecture QR Vivant — ID unique lié à la base de données (locale ou cloud)
- [ ] Sync intelligente silencieuse offline/online avec indicateur discret
- [ ] Gestion de l'appareil Bluetooth enregistré — pairing persistant Kawai MX06 via BLE, reconnexion automatique

**📦 Gestion des Conteneurs**
- [ ] Types de conteneurs : 📦 Carton, 🛍️ Sac, 🧳 Valise, 📫 Boîte, 🗂️ Dossier, 🛒 Sachet
- [ ] Galerie photo par conteneur (zoom, swipe, commentaires)
- [ ] Suggestions rapides d'articles + saisie manuelle toujours disponible
- [ ] Priorité de déballage : 🔴 Urgent / 🟡 Cette semaine / 🟢 Pas pressé
- [ ] Statuts Kanban : 📦 Emballé → 🚚 Camion → 🏠 Déposé → 📂 Débállé
- [ ] Objets en garde (propriétaire, description, date restitution)

**🏠 Organisation par Espaces**
- [ ] Configuration des pièces de la maison (salon, cuisine, chambres, salle à manger...)
- [ ] Assignation d'un conteneur à une ou plusieurs pièces
- [ ] Un conteneur peut contenir des articles de pièces différentes
- [ ] Progression visuelle par pièce (barre en temps réel)
- [ ] Focus "Ce qui manque" — vue conteneurs non scannés en évidence

**🖨️ Impression & Stickers**
- [ ] Support natif Kawai MX06 Bluetooth Low Energy — pairing et impression directe
- [ ] Sticker thermique N&B — icône vectorielle pièce + QR code
- [ ] Sticker lisible humain — nom pièce + numéro + 2-3 premiers articles en texte
- [ ] Export PDF multi-formats (A4, A3, A6...) pour imprimante standard
- [ ] QR ou Code-barres au choix de l'utilisateur

**📱 Navigation & Scan**
- [ ] Double mode — vue liste (Wi-Fi maison) + scan QR direct vers conteneur
- [ ] Mode déballage inversé — documenter les articles en les sortant

**👥 Collaboration & Partage**
- [ ] Rôles : 👑 Chef / 📦 Chargeur / ✅ Déchargeur / 👁️ Observateur
- [ ] Lien de partage temporaire 24h (sans app, sans compte)
- [ ] Import depuis liste existante (Notes, Excel, Google Sheets)

**🔔 Alertes & Mode Actif**
- [ ] Mode Déménagement Actif — scanner prêt, notification collective à la fin
- [ ] Alerte conteneur perdu — notification si non scanné après 24h
- [ ] Notification push restitution objet en garde (J-1 + Jour J)

**📄 Rapport**
- [ ] Rapport de santé final — PDF bilan complet du déménagement

---

### 🔜 V2 — AVANCÉ (Après lancement)

- [ ] 🤖 Chatbot OpenAI recherche naturelle — "où est mon chargeur ?" → carton + photo
- [ ] Prédiction proactive depuis l'historique de recherche
- [ ] Shazam perso — suggestions depuis son propre historique d'articles
- [ ] Collections / Tags — un carton dans plusieurs collections simultanément
- [ ] Accès temporaire déménageur pro — QR check-in, accès expiré après la journée
- [ ] Résumé vocal mains libres du contenu d'un conteneur
- [ ] Scan simultané — détection de conflit en temps réel
- [ ] Photo de la pile dans le camion (optionnel)
- [ ] QR stickers optionnels pour les pièces de la maison de destination
- [ ] Commencer par configurer la maison de destination (optionnel)
- [ ] Zone de chargement camion simplifiée (Avant/Arrière, Haut/Bas)
- [ ] Guidage vers la pièce destination au scan
- [ ] Alertes intelligentes contextuelles (style Waze)
- [ ] Sticker bi-langue (ex: Salon / Living Room)
- [ ] Mode déménageur professionnel — client observe, prestataire opère
- [ ] Journal de déménagement PDF horodaté
- [ ] Valeur assurée des articles par conteneur (document en cas de litige)
- [ ] NFC tags (optionnel, pour utilisateurs équipés)

---

### 🚀 V3 — CAS D'USAGE ÉTENDUS (Expansion)

- [ ] Garde-meuble / Box de stockage
- [ ] Cave / Grenier / Débarras — inventaire permanent de la maison
- [ ] Prêt d'objets entre amis (boîte virtuelle par personne + rappels)
- [ ] Valises de voyage — étiquette bagage intelligente
- [ ] Don / Vide-grenier — liste partageable avec prix estimés
- [ ] Marketplace surplus — "À donner / À vendre" pendant le tri
- [ ] Héritage / Succession — inventaire et assignation familiale
- [ ] Déménagement étudiant annuel — cartons réutilisés, QR permanent
- [ ] Déménagement d'entreprise — B2B, gestion par étage et équipe
- [ ] Historique de tous les déménagements — retrouver un article d'un ancien déménagement

---

## Insights Clés de Session

### Ce que cette session a révélé

1. **Track My Box est plus qu'une app de déménagement** — c'est un gestionnaire universel de conteneurs physiques. Le déménagement est le déclencheur, le stockage long terme est le marché récurrent.

2. **Le QR Vivant est l'architecture clé** — tout repose sur ce principe : un identifiant permanent lié à une fiche dynamique. Jamais besoin de réimprimer, jamais de donnée figée.

3. **La simplicité est la feature principale** — Progressive Feature Unlocking + onboarding en 1 bouton + pas de compte obligatoire. L'utilisateur pressé le jour du déménagement doit être opérationnel en 30 secondes.

4. **Le sticker est une interface physique** — même sans smartphone, le sticker doit être informatif. Icône + texte lisible + QR = 3 niveaux d'information sur un seul sticker thermique.

5. **Le chatbot OpenAI (V2) est un différenciateur fort** — recherche en langage naturel sur son propre inventaire. Simple à implémenter, très puissant en usage quotidien.

### Décisions de Design Prises en Session

| Décision | Raison |
|----------|--------|
| QR Code prioritaire sur NFC | NFC = achat matériel supplémentaire, friction inutile |
| Pas d'IA de reconnaissance | Coût API + imprécision → remplacé par Shazam perso (V2) |
| Modules activables | Simplicité pour débutant, puissance pour expert |
| Support Kawai MX06 obligatoire | Imprimante de l'utilisateur, BLE natif Expo |
| PDF multi-formats en V1 | Accessibilité maximale sans imprimante spéciale |
| Chatbot OpenAI en V2 | Feature forte mais dépendance API → après validation du core |

---

## Synthèse Chiffrée

| Métrique | Valeur |
|----------|--------|
| Idées générées | 63 |
| Techniques utilisées | 3 (SCAMPER, What If, Cross-Pollination) |
| Features V1 | ~30 |
| Features V2 | ~17 |
| Features V3 / Extensions | ~10 cas d'usage |
| Durée de session | ~45 minutes |

---

*Document généré le 16 mars 2026 — Session BMAD Brainstorming — Track My Box*
