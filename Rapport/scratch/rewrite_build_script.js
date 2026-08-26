const fs = require('fs');

const targetFile = 'c:\\Users\\ayoub\\OneDrive\\Documents\\PFEImen\\Rapport\\build_rapport.js';
let content = fs.readFileSync(targetFile, 'utf8');


content = content.replaceAll('\r\n', '\n');

const replacements = [
  {
    target: `        body("Dans le paysage économique actuel, l'essor fulgurant du commerce électronique et la transition numérique des flux d'information imposent aux acteurs de la distribution commerciale une révision profonde de leurs méthodes de gestion interne. Ce processus de transformation est devenu un prérequis incontournable pour pérenniser leur compétitivité, accroître l'efficacité de leurs processus de livraison et répondre aux attentes d'immédiateté des consommateurs. Au cœur de cette dynamique, la logistique s'impose à la fois comme un défi opérationnel majeur et comme un levier d'optimisation central."),
        pb(),
        body("Le travail présenté dans ce mémoire répond directement à cet enjeu pour le compte de la société Arkan, l'un des leaders tunisiens du e-commerce multi-vendeurs. Devant l'accroissement continu de ses transactions, l'entreprise s'est trouvée confrontée à la nécessité de se doter d'un outil unifié, à même de centraliser et d'automatiser le traitement des commandes, depuis leur extraction de la boutique Magento jusqu'à leur acheminement final."),
        pb(),
        body("Pour y parvenir, nous avons développé la plateforme Nexora. Celle-ci intègre un back-end d'API REST robuste avec Laravel, couplé à une application web réactive sous React.js pour le pilotage interne et à une application mobile multiplateforme sous Flutter dédiée aux marchands partenaires, le tout appuyé par une persistance MySQL et une couche de sécurité JWT."),`,
    replace: `        body("Dans le paysage industriel moderne, la transition vers l'industrie 4.0 et l'automatisation des flux d'information imposent aux ateliers de production une révision profonde de leurs méthodes de gestion interne. Ce processus de transformation numérique est devenu un prérequis incontournable pour pérenniser la compétitivité des entreprises manufacturières, accroître l'efficacité de leurs lignes de fabrication et optimiser les niveaux de stock en temps réel. Au cœur de cette dynamique, le suivi du rendement d'atelier (TRG) s'impose à la fois comme un défi opérationnel majeur et comme un levier d'optimisation central."),
        pb(),
        body("Le travail présenté dans ce mémoire répond directement à cet enjeu en concevant et déployant une solution unifiée de pilotage de production et de gestion d'inventaire. Devant l'accroissement des cadences de travail, l'entreprise s'est trouvée confrontée à la nécessité de se doter d'un outil centralisé capable d'enregistrer les ordres de production, d'affecter dynamiquement les machines d'atelier, de comptabiliser les temps d'arrêt et de tracer l'intégralité des mouvements de stock sans dépendre de ressaisies manuelles sur papier ou tableur."),
        pb(),
        body("Pour y parvenir, nous avons développé la plateforme intelligente Nexora. Celle-ci intègre un back-end d'API REST robuste avec Spring Boot 3 (Java 17) connecté à une base SQL Server centralisée, couplé à une application web monopage (SPA) réactive sous React.js pour les gestionnaires et opérateurs d'atelier. De plus, elle intègre un service de Machine Learning et Data Science sous FastAPI (Python 3.10) pour les analyses prédictives (ARIMA, Prophet), le clustering K-Means et la détection d'anomalies (Isolation Forest)."),`
  },
  {
    target: `        bullet("**Chapitre 1 : Cadre Général du Projet** – Ce chapitre présente le contexte du projet, l'organisme d'accueil (la société Arkan), le diagnostic de l'existant avec une étude comparative des solutions du marché à l'échelle nationale et internationale, puis détaille le cadre méthodologique Scrum [1] [3] et le langage UML [15] retenu."),
        bullet("**Chapitre 2 : Analyse et Spécification des Besoins** – Il formalise les acteurs et leurs rôles (matrice de contrôle d'accès RBAC), détaille les exigences fonctionnelles (les fonctionnalités et User Stories) et non fonctionnelles, puis décrit l'architecture globale ainsi que les environnements de développement et de déploiement sécurisés."),
        bullet("**Chapitre 3 : Sprint 1 – Sécurité et Accès** – Ce chapitre traite de la conception et du développement de la couche d'accès sécurisée de la plateforme, incluant l'authentification par jeton JWT, les menus dynamiques adaptés aux rôles, et la journalisation des actions sensibles."),
        bullet("**Chapitre 4 : Sprint 2 – Gestion des Commandes et Intégration des Transporteurs** – Il présente la synchronisation automatique des commandes via l'API Magento, la saisie logistique et l'interfaçage avec les APIs des prestataires tunisiens (Aramex, Intigo et Phoenix)."),
        bullet("**Chapitre 5 : Sprint 3 – Application Mobile Vendeur et Tableaux de Bord** – Ce chapitre est dédié à la mise en œuvre de l'application mobile Flutter pour les vendeurs partenaires et au développement des indicateurs décisionnels via Power BI (avec restriction RLS)."),
        bullet("**Chapitre 6 : Sprint 4 – CRM, Automatisation, Facturation et IA** – Il décrit le module CRM pour le suivi commercial des opportunités, la facturation automatique avec calcul de la TVA tunisienne à 19%, l'automatisation n8n et l'intégration de l'agent IA conversationnel via Groq."),
        bullet("**Chapitre 7 : Sprint 5 – Administration du Système** – Ce chapitre présente la console technique d'audit d'activité et le module de supervision global des notifications système."),`,
    replace: `        bullet("**Chapitre 1 : Cadre Général du Projet** – Ce chapitre présente le contexte du projet, l'organisme d'accueil, le diagnostic de l'existant avec une étude comparative des solutions d'atelier du marché, puis détaille le cadre méthodologique Scrum [1] [3] et le langage de modélisation UML [15] retenu."),
        bullet("**Chapitre 2 : Analyse et Spécification des Besoins** – Il formalise les acteurs et leurs rôles (matrice de contrôle d'accès RBAC), détaille les exigences fonctionnelles (postes de travail, ordres de production, stocks et modèles d'IA) et non fonctionnelles, puis décrit l'architecture physique/logique et l'environnement de développement."),
        bullet("**Chapitre 3 : Sprint 1 – Sécurité et Accès** – Ce chapitre traite de la conception et du développement de la couche d'accès sécurisée de la plateforme, incluant l'authentification par jeton JWT, les menus de navigation dynamiques adaptés aux rôles (ADMIN, MANAGER, OPERATEUR), et la journalisation des actions sensibles."),
        bullet("**Chapitre 4 : Sprint 2 – Gestion de Production et Suivi des Machines** – Il présente la configuration des postes de travail d'atelier, le suivi des états des machines en direct, le calcul automatique du taux de rendement global (TRG) et la gestion des ordres de production."),
        bullet("**Chapitre 5 : Sprint 3 – Gestion des Stocks et Mouvements** – Ce chapitre est dédié à la mise en œuvre du suivi d'inventaire, de la saisie des mouvements d'entrée/sorties, de la gestion des ajustements et des alertes de seuils critiques de réapprovisionnement."),
        bullet("**Chapitre 6 : Sprint 4 – Intelligence Artificielle et Data Science** – Il décrit le service FastAPI (Python) hébergeant les modèles prédictifs de production et de stock (ARIMA, Prophet), la segmentation ABC des articles via K-Means et la détection d'anomalies de fonctionnement via Isolation Forest."),
        bullet("**Chapitre 7 : Sprint 5 – Supervision et Centre d'Alertes** – Ce chapitre présente le centre d'historisation des notifications d'alertes système."),`
  },
  {
    target: `        title2("1.1 Introduction"),
        body("Ce premier chapitre pose le contexte général de ce projet de fin d'études en décrivant l'organisme d'accueil, la société Arkan, ainsi que le cadre opérationnel de notre travail. Nous établissons un diagnostic de l'existant afin d'identifier les problématiques métiers et de justifier la réalisation d'une solution logicielle personnalisée. Enfin, nous présentons la démarche de gestion de projet retenue ainsi que les standards de modélisation choisis pour mener à bien la conception."),
        pb(),

        title2("1.2 Cadre du Projet"),
        title3("1.2.1 Description Générale du Projet"),
        body("Le projet \\"Nexora\\" consiste à concevoir, développer et déployer une plateforme d'information centralisée sur mesure. Cette solution vise à unifier, automatiser et optimiser l'ensemble des processus logistiques, commerciaux et décisionnels de l'entreprise Arkan. Elle englobe une application d'administration web multi-rôles et une application mobile dédiée aux marchands partenaires (vendeurs)."),
        pb(),

        title3("1.2.2 Présentation de l'Organisme d'Accueil"),
        body("La société Arkan est un actor tunisien de premier plan dans le secteur de la vente en ligne et de la distribution de produits de grande consommation à l'échelle nationale et régionale. La société exploite une place de marché (*marketplace*) sur laquelle les clients accèdent à un large choix d'articles livrés dans des délais courts et sécurisés. L'organisation s'appuie sur un écosystème de marchands partenaires qui y gèrent de manière autonome leurs stocks et leurs catalogues de produits."),
        pb(),
        body("Ses activités principales s'articulent autour de :"),
        bullet("La vente en ligne à travers une place de marché multi-vendeurs et la vente directe aux consommateurs."),
        bullet("L'intégration et l'accompagnement des marchands tiers (*onboarding*, suivi d'activité et indicateurs de performance)."),
        bullet("La gestion de la chaîne logistique et l'expédition de colis en collaboration directe avec plusieurs prestataires tunisiens (Aramex, Intigo, Phoenix)."),
        bullet("Le service client et le traitement des réclamations ou des retours de produits."),
        bullet("Le suivi analytique et l'aide à la décision concernant les performances de vente et d'acheminement des colis."),`,
    replace: `        title2("1.1 Introduction"),
        body("Ce premier chapitre pose le contexte général de ce projet de fin d'études en décrivant l'organisme d'accueil, l'atelier industriel de production, ainsi que le cadre opérationnel de notre travail. Nous établissons un diagnostic de l'existant afin d'identifier les problématiques métiers et de justifier la réalisation d'une solution logicielle personnalisée. Enfin, nous présentons la démarche de gestion de projet agile Scrum retenue ainsi que les standards de modélisation choisis pour mener à bien la conception."),
        pb(),

        title2("1.2 Cadre du Projet"),
        title3("1.2.1 Description Générale du Projet"),
        body("Le projet \\"Nexora\\" consiste à concevoir, développer et déployer une plateforme d'information centralisée sur mesure. Cette solution vise à unifier, automatiser et optimiser l'ensemble des processus de planification de production, de suivi des machines d'atelier et de gestion des mouvements de stock. Elle englobe une application web monopage (SPA) d'administration et d'exécution pour les gestionnaires et opérateurs, connectée à un service d'intelligence artificielle prédictive."),
        pb(),

        title3("1.2.2 Présentation de l'Organisme d'Accueil"),
        body("Le cadre de réalisation de ce projet s'inscrit au sein d'une entreprise industrielle moderne spécialisée dans la fabrication mécanique et l'assemblage d'équipements. L'atelier de production dispose de multiples postes de travail (machines d'usinage, fraiseuses, tours numériques) et d'un dépôt de stockage centralisé pour les pièces détachées et les matières premières. Face à la cadence élevée, l'organisation s'appuie sur une planification de production rigoureuse pour optimiser l'utilisation de ses ressources."),
        pb(),
        body("Ses activités principales s'articulent autour de :"),
        bullet("La fabrication d'articles et de pièces mécaniques selon des ordres de production programmés."),
        bullet("La maintenance et le suivi opérationnel des postes de travail de l'atelier."),
        bullet("Le calcul et l'analyse du taux de rendement global (TRG) des machines pour évaluer la productivité."),
        bullet("La gestion de l'inventaire, comprenant la traçabilité des entrées, sorties et ajustements de stock."),
        bullet("L'analyse prédictive et l'aide à la décision concernant l'évolution des volumes de production et de stock future."),`
  },
  {
    target: `        makeTable(
          ["Caractéristique", "Détail de l'entreprise"],
          [
            ["Raison Sociale", "Marketplace"],
            ["Secteur d'Activité", "E-commerce, Logistique, Transport, Distribution"],
            ["Activité Principale", "Opérateur de place de marché multi-vendeurs et commissionnaire de transport"],
            ["Siège Social", "Tunis, Tunisie"],
            ["Plateforme E-commerce", "Magento 2 (back-office de vente actuel)"],
            ["Canaux de Livraison", "Réseau de transporteurs nationaux (Aramex, Intigo, Phoenix)"],
            ["Marché Cible", "B2C et B2B national et régional (Tunisie)"],
          ],
          [3500, 6000]
        ),`,
    replace: `        makeTable(
          ["Caractéristique", "Détail de l'entreprise"],
          [
            ["Raison Sociale", "Nexora Manufacturing"],
            ["Secteur d'Activité", "Métallurgie, Fabrication Mécanique, Industrie 4.0"],
            ["Activité Principale", "Usinage de précision, fabrication d'équipements et assemblage industriel"],
            ["Siège Social", "Tunis, Tunisie"],
            ["Système d'information", "Microsoft SQL Server, Spring Boot, React et FastAPI"],
            ["Gestion d'Atelier", "Suivi en direct des machines, TRG et ordres de production"],
            ["Marché Cible", "B2B national et clients industriels internationaux"],
          ],
          [3500, 6000]
        ),`
  },
  {
    target: `        title3("1.2.4 Organigramme d'Arkan"),
        body("La structure organisationnelle d'Arkan s'articule autour de départements clés garantissant la fluidité opérationnelle du service :"),
        bullet("**Direction Générale** : définit les orientations stratégiques et commerciales d'Arkan."),
        bullet("**Département Logistique et Transport** : supervise l'attribution des transporteurs, l'expédition et le suivi de livraison des colis."),
        bullet("**Département Informatique** : assure la maintenance de la plateforme e-commerce et le développement des applications internes. Le pôle de Recherche et Développement (R et D) au sein de ce département est chargé d'étudier les technologies innovantes, telles que les agents d'intelligence artificielle, pour optimiser l'efficacité de la plateforme."),
        bullet("**Service Client et Relation Vendeurs** : gère le suivi des réclamations et l'intégration des marchands partenaires."),
        bullet("**Département Financier** : assure la facturation, le calcul des commissions et le règlement des transporteurs."),
        pb(),

        title2("1.3 Analyse de l'Existant"),
        title3("1.3.1 Étude de l'Existant"),
        body("L'analyse des outils et systèmes opérationnels actuellement en place chez Arkan révèle un paysage applicatif fragmenté et non intégré :"),
        bullet("**Back-office Magento** : gère le catalogue produits et les commandes en ligne, mais ne couvre pas la logistique opérationnelle ni la gestion des transporteurs."),
        bullet("**Feuilles de calcul Excel** : utilisées pour le suivi manuel des expéditions, la facturation et les rapports d'activité. Source fréquente d'erreurs et de doublons."),
        bullet("**Canaux de communication hétérogènes** (email, WhatsApp, téléphone) : employés pour coordonner avec les transporteurs (Aramex, Intigo, Phoenix), sans traçabilité centralisée."),
        bullet("**Absence d'application mobile vendeur** : les partenaires marchands gèrent leur activité sans outil dédié, entraînant des délais de communication."),`,
    replace: `        title3("1.2.4 Organigramme Industriel"),
        body("La structure organisationnelle de l'atelier s'articule autour de départements clés garantissant la fluidité opérationnelle :"),
        bullet("**Direction d'Usine** : définit les objectifs de rendement et la stratégie commerciale globale."),
        bullet("**Département Production** : planifie les ordres de production et supervise le travail des opérateurs sur les machines d'usinage."),
        bullet("**Département Informatique & Automatisation** : assure le maintien des outils numériques et le développement des algorithmes prédictifs pour optimiser l'atelier. Le pôle R et D y étudie les technologies de machine learning pour anticiper les besoins d'entretien et les ruptures de stock."),
        bullet("**Département Logistique & Stocks** : supervise la réception des matières premières, le stockage des pièces et les mouvements d'inventaire."),
        bullet("**Département Maintenance** : gère la disponibilité des machines, comptabilise les arrêts et effectue les réparations."),
        pb(),

        title2("1.3 Analyse de l'Existant"),
        title3("1.3.1 Étude de l'Existant"),
        body("L'analyse des outils et méthodes de travail actuellement en place au sein de l'atelier révèle une gestion artisanale et non informatisée :"),
        bullet("**Fiches papier de production** : les opérateurs notent manuellement le début et la fin d'usinage de chaque pièce, sans horodatage fiable."),
        bullet("**Feuilles de calcul Excel fragmentées** : utilisées pour récapituler les volumes de production hebdomadaires et l'inventaire des stocks. Source fréquente d'erreurs, de pertes de données et d'écarts d'inventaire."),
        bullet("**Absence de calcul de rendement (TRG)** : le TRG des postes de travail n'est pas quantifié automatiquement, rendant difficile l'évaluation de l'efficacité globale de l'atelier."),
        bullet("**Pas de vision prédictive** : la planification des réapprovisionnements est réactive, ce qui provoque régulièrement des ruptures de stock critiques ou du surstockage coûteux."),`
  },
  {
    target: `        title3("1.3.2 Étude des Solutions Existantes sur le Marché"),
        body("Afin de justifier le développement d'une solution personnalisée, il convient de dresser un bilan comparatif des solutions logistiques (TMS et middlewares e-commerce) existantes sur le marché, tant au niveau international qu'au niveau national (Tunisie) :"),
        pb(),
        bold_body("Solutions logistiques à l'échelle internationale :"),
        body("Des plateformes mondiales comme Sendcloud, ShipStation ou ShippingEasy proposent d'unifier la logistique e-commerce en connectant les boutiques en ligne (Magento, Shopify) à un grand catalogue de transporteurs internationaux (DHL, FedEx, UPS, etc.)."),
        bullet("**Avantages** : API robustes et standardisées, intégrations CMS en un clic, fonctionnalités prêtes à l'emploi (gestion des retours, étiquettes)."),
        bullet("**Limites** : Aucune intégration avec les transporteurs tunisiens (Aramex Tunisie, Intigo, Phoenix), tarification par abonnement en devises étrangères prohibitive pour les acteurs locaux, et absence de conformité aux règles fiscales tunisiennes."),
        pb(),
        bold_body("Solutions à l'échelle nationale (Tunisie) :"),
        body("Les principaux transporteurs du marché local proposent chacun un portail web propriétaire (comme Aramex ou le portail Intigo) pour permettre à leurs clients professionnels d'enregistrer et suivre leurs envois."),
        bullet("**Avantages** : Solution gratuite, nativement connectée aux opérations du transporteur concerné."),
        bullet("**Limites** : Absence de centralisation (le logisticien doit se connecter à chaque portail séparément), ressaisies de données manuelles de Magento vers ces portails (source d'erreurs), aucun comparateur automatique de tarifs en temps réel, et manque d'une application unifiée à destination des vendeurs tiers."),
        pb(),

        title3("1.3.3 Critique de l'Existant"),
        body("L'analyse détaillée du fonctionnement interne d'Arkan et la confrontation avec les solutions du marché mettent en évidence plusieurs limites majeures :"),
        pb(),
        bullet("**Manque de centralisation** : chaque outil (Magento, Excel, e-mail) fonctionne en silo, sans échange automatique de données, imposant des ressaisies manuelles redondantes."),
        bullet("**Absence de temps réel** : les statuts de livraison ne sont pas synchronisés automatiquement entre Arkan, les transporteurs et Magento."),
        bullet("**Vulnérabilité aux erreurs humaines** : les saisies manuelles dans Excel génèrent régulièrement des erreurs de facturation et d'adresses."),
        bullet("**Non-scalabilité** : la croissance du volume de colis sature les processus manuels et rend la gestion de plus en plus chronophage."),`,
    replace: `        title3("1.3.2 Étude des Solutions Existantes sur le Marché"),
        body("Afin de justifier le développement d'une solution personnalisée, il convient de dresser un bilan comparatif des progiciels de gestion intégrés (ERP/MES) existants sur le marché, tant au niveau international qu'au niveau des solutions locales :"),
        pb(),
        bold_body("Progiciels ERP/MES à l'échelle internationale :"),
        body("Des progiciels industriels de renommée mondiale comme SAP ERP (module PP/MM) ou Siemens Opcenter proposent de gérer l'intégralité de la chaîne de fabrication, le suivi des machines et l'ordonnancement de production."),
        bullet("**Avantages** : Couverture fonctionnelle gigantesque, robustesse éprouvée, standardisation des processus industriels."),
        bullet("**Limites** : Coût d'acquisition et d'intégration prohibitif pour les PME tunisiennes, grande complexité de paramétrage, et lourdeur d'utilisation nécessitant une longue formation."),
        pb(),
        bold_body("Solutions d'ateliers basées sur des tableurs et outils simples :"),
        body("De nombreux ateliers locaux s'appuient sur des solutions maison développées sous Microsoft Access ou des feuilles Excel partagées."),
        bullet("**Avantages** : Simplicité initiale, coût d'acquisition quasiment nul."),
        bullet("**Limites** : Absence de connexion directe avec les machines d'atelier (pas d'acquisition de données en temps réel), risque élevé de corruption de données lors des accès simultanés, aucun module d'intelligence artificielle prédictive intégré, et manque d'une interface web moderne et réactive pour les opérateurs."),
        pb(),

        title3("1.3.3 Critique de l'Existant"),
        body("L'analyse détaillée du fonctionnement interne de l'atelier met en évidence plusieurs faiblesses opérationnelles majeures :"),
        pb(),
        bullet("**Ruptures d'information** : le stockage d'informations sur fiches papier empêche toute analyse instantanée des performances de production."),
        bullet("**Absence de calcul de TRG automatique** : sans mesure automatisée des temps de fonctionnement et d'arrêt, l'évaluation de l'efficacité d'atelier reste purement subjective."),
        bullet("**Silo de données d'inventaire** : les stocks ne sont pas reliés dynamiquement à la consommation réelle d'atelier, ce qui entraîne de fréquentes ruptures de matières premières."),
        bullet("**Absence d'anticipation** : le manque de modèles prédictifs empêche de planifier efficacement la production future et l'approvisionnement."),`
  },
  {
    target: `        makeTable(
          ["Solution", "Intégration 3PL locale", "Automatisation & CMS", "Calcul Taxes & TVA", "Coût"],
          [
            ["Middlewares Internationaux (ShipStation, Sendcloud)", "Non (Aucun transporteur tunisien connecté)", "Oui (Intégration Magento/Shopify native)", "Non (Pas de gestion de la TVA tunisienne)", "Élevé (Abonnement mensuel en devises étrangères)"],
            ["Portails Nationaux (Aramex, Intigo, Phoenix)", "Oui (Uniquement le transporteur concerné)", "Non (Ressaisies manuelles des commandes)", "Basique (Pas de facturation automatique consolidée)", "Gratuit (Inclus dans les tarifs d'expédition)"],
            ["Nexora (Solution proposée)", "Oui (Multi-transporteurs intégrés via API)", "Oui (Routage optimal et synchro Magento)", "Oui (Calcul et génération automatique de facture PDF)", "Coût de développement initial, maintenance faible"]
          ],
          [2000, 1800, 1800, 2000, 1860]
        ),`,
    replace: `        makeTable(
          ["Solution", "Suivi TRG Temps Réel", "Analyses Prédictives (IA)", "Simplicité & Ergonomie", "Coût Global"],
          [
            ["ERP/MES Industriels (SAP, Siemens)", "Oui (Très complet)", "Optionnel (Coûteux à configurer)", "Complexe (Courbe d'apprentissage longue)", "Très élevé (Licences et intégration majeures)"],
            ["Systèmes basés sur Excel / Access", "Non (Uniquement saisies manuelles différées)", "Non (Aucun modèle prédictif)", "Moyen (Interface rudimentaire)", "Faible (Développement interne basique)"],
            ["Nexora (Solution proposée)", "Oui (Calcul automatique instantané par machine)", "Oui (ARIMA, Prophet, K-Means, Isolation Forest)", "Très élevée (Interface React moderne et réactive)", "Coût initial modéré, maintenance réduite"]
          ],
          [2000, 1800, 1800, 2000, 1860]
        ),`
  },
  {
    target: `        title3("1.3.4 Solution Proposée"),
        body("Face aux limites identifiées lors de la critique de l'existant, nous proposons la mise en place d'une plateforme d'information sur mesure, centralisant l'intégralité des flux logistiques et commerciaux d'Arkan."),
        pb(),
        bold_body("Objectifs de la solution proposée :"),
        bullet("Concevoir une solution logicielle moderne, ergonomique et sécurisée, composée d’une application web d’administration et d’une application mobile destinée aux vendeurs."),
        bullet("Centraliser dans une interface unique les commandes importées depuis Magento ainsi que les expéditions saisies manuellement."),
        bullet("Intégrer la plateforme avec les API des transporteurs (Aramex, Intigo et Phoenix)."),
        bullet("Automatiser la synchronisation des statuts des colis entre la base de données locale, les transporteurs et Magento."),
        bullet("Développer une application mobile offrant aux vendeurs partenaires les moyens de piloter et de suivre leur activité en temps réel."),
        bullet("Développer un module d'administration transverse englobant le suivi des ventes, la facturation, les achats, les stocks et la relation client (CRM)."),
        bullet("Intégrer des outils de visualisation analytique via Power BI."),
        bullet("Garantir la sécurité et la confidentialité des données au moyen d'un contrôle d'accès basé sur les rôles (RBAC) et d'un mécanisme d'authentification par jetons JWT."),`,
    replace: `        title3("1.3.4 Solution Proposée"),
        body("Face aux limites de l'existant, nous proposons la mise en place de la plateforme d'information intelligente Nexora, centralisant et optimisant la production d'atelier et la gestion des stocks."),
        pb(),
        bold_body("Objectifs de la solution proposée :"),
        bullet("Concevoir une application web d'administration moderne, ergonomique et sécurisée, permettant aux managers et opérateurs de piloter l'atelier."),
        bullet("Enregistrer les configurations des postes de travail (machines) et suivre leur disponibilité en temps réel."),
        bullet("Calculer à la volée le taux de rendement global (TRG/OEE) pour identifier instantanément les baisses de productivité."),
        bullet("Automatiser la gestion et la planification des ordres de production avec suivi d'avancement par les opérateurs."),
        bullet("Développer un module d'inventaire complet pour enregistrer les entrées, sorties et ajustements de stock, avec alertes sur seuils de réapprovisionnement."),
        bullet("Intégrer des algorithmes de Data Science (FastAPI Python) : prévision de production/stocks par Prophet et ARIMA, segmentation ABC par K-Means, et détection d'anomalies opérationnelles par Isolation Forest."),
        bullet("Garantir la traçabilité des modifications critiques en consignant l'intégralité des actions au sein d'une console technique (ActivityLog)."),
        bullet("Sécuriser les transactions de la plateforme par jetons JWT et contrôle d'accès basé sur les rôles (RBAC)."),`
  },
  {
    target: `        title1("Chapitre 2 : Analyse et Spécification des Besoins"),
        title2("2.1 Introduction"),
        body("Ce deuxième chapitre détaille la phase d'analyse, l'expression des exigences et la modélisation générale d'Nexora. Nous y décrivons les différents rôles utilisateurs intervenant sur le système, recensons les besoins fonctionnels et non fonctionnels, organisons le backlog produit ordonné, puis établissons les fondations d'architecture, de base de données et de déploiement de la solution."),
        pb(),

        title2("2.2 Analyse des Besoins"),
        title3("2.2.1 Identification des Acteurs du Système"),
        body("La gestion des droits d’accès et de la sécurité au sein du système s'appuie sur une politique de contrôle d'accès basée sur les rôles (RBAC – Role-Based Access Control), organisée autour de six profils métiers clés. Chaque acteur dispose d'un périmètre d'action dédié, associé à une interface logicielle adaptée à ses droits d'accès."),
        pb(),
        makeTable(
          ["Acteur / Rôle", "Périmètre et responsabilités"],
          [
            ["Administrateur", "Pilotage global de la plateforme : création des comptes utilisateurs, configuration des rôles/habilitations RBAC, réglages généraux et monitoring technique (historiques et diagnostic)."],
            ["Service Vendeur", "Supervision des marchands partenaires : administration du catalogue produits global, contrôle de l'état des commandes sur l'application mobile, suivi et validation des ventes par vendeur."],
            ["Vendeur", "Utilisateur de l’application mobile Flutter : affichage des commandes disponibles, envoi des demandes d'attribution et actualisation de l'état de disponibilité."],
            ["Service Logistique", "Gestion opérationnelle des expéditions : suivi du cycle de vie des commandes (de la confirmation à la livraison), affectation des transporteurs et génération des bordereaux de remise."],
            ["Service Client", "Gestion de la relation client : traitement des demandes et réclamations, consultation de l’historique client et gestion des prospects (leads) via le pipeline CRM."],
            ["Service Finance", "Gestion commerciale et financière : établissement des devis, facturation, calcul de la TVA, gestion des dépenses, des fournisseurs et des commandes d’achat."],
          ],
          [2800, 6560]
        ),`,
    replace: `        title1("Chapitre 2 : Analyse et Spécification des Besoins"),
        title2("2.1 Introduction"),
        body("Ce deuxième chapitre détaille la phase d'analyse, l'expression des exigences et la modélisation générale de la plateforme Nexora. Nous y décrivons les différents rôles utilisateurs intervenant sur le système, recensons les exigences fonctionnelles et non fonctionnelles, organisons le backlog produit ordonné, puis établissons les fondations d'architecture physique, logique et de persistance de la solution."),
        pb(),

        title2("2.2 Analyse des Besoins"),
        title3("2.2.1 Identification des Acteurs du Système"),
        body("La gestion des droits d’accès et de la sécurité au sein de la plateforme Nexora s'appuie sur une politique de contrôle d'accès basée sur les rôles (RBAC – Role-Based Access Control) pour trois rôles d'atelier. Chaque profil dispose d'un ensemble de droits spécifiques pour interagir avec le système :"),
        pb(),
        makeTable(
          ["Acteur / Rôle", "Périmètre et responsabilités"],
          [
            ["Administrateur (ADMIN)", "Supervision technique complète : création et désactivation des comptes utilisateurs, configuration globale des rôles et permissions RBAC, consultation de la console d'audit de sécurité et d'historique technique d'activité (ActivityLog)."],
            ["Manager (MANAGER)", "Gestion de la production et de l'inventaire : configuration des machines d'atelier, planification et affectation des ordres de production, consultation en temps réel du TRG, paramétrage des seuils d'alerte de stock, exécution et visualisation des analyses prédictives d'IA (FastAPI)."],
            ["Opérateur (OPERATEUR)", "Exécution des tâches d'atelier : consultation des ordres de production affectés, mise à jour des statuts d'usinage, saisie des mouvements d'entrée et de sortie de stock d'articles, et réception des alertes de rupture en temps réel."],
          ],
          [2800, 6560]
        ),`
  },
  {
    target: `        title3("2.2.3 Les besoins non fonctionnels"),
        bullet("Performance : maintien d'un temps de réponse des API inférieur à 500 ms et optimisation des requêtes MySQL par indexation."),
        bullet("Sécurité : authentification JWT avec expiration de jeton, hachage des mots de passe par Bcrypt, protection contre les failles CSRF, validation des entrées et contrôle RBAC."),
        bullet("Disponibilité : mécanisme de rejeu automatique en cas d'échec des appels d'API externes et supervision continue des tâches de synchronisation."),
        bullet("Évolutivité (scalabilité) : structuration modulaire de l'application Laravel facilitant l'intégration de nouvelles fonctionnalités sans refactoring majeur."),
        bullet("Ergonomie et utilisabilité : interface React adaptative (*responsive*), navigation fluide et indicateurs visuels clairs de confirmation des actions."),
        bullet("Maintenabilité : documentation rigoureuse du code, démarcation nette entre les parties front-end et back-end, accompagnée du respect rigoureux de règles de nommage unifiées."),`,
    replace: `        title3("2.2.3 Les besoins non fonctionnels"),
        bullet("Performance : maintien d'un temps de réponse des API inférieur à 300 ms pour les requêtes Spring Boot et optimisation des index SQL Server."),
        bullet("Sécurité : authentification sans état par jetons JWT, chiffrement des mots de passe par BCrypt, validation systématique des exigences de formulaires et isolation des endpoints d'IA FastAPI."),
        bullet("Robustesse et disponibilité : tolérance aux pannes du microservice de Machine Learning (mécanisme de secours et prévisions locales offline sur le frontend React)."),
        bullet("Évolutivité (scalabilité) : architecture découplée microservices facilitant l'ajout de nouveaux modèles d'IA sous FastAPI sans impacter l'API de gestion Spring Boot."),
        bullet("Ergonomie et utilisabilité : interface React dynamique et adaptative (Bootstrap/CSS personnalisé), avec tableaux de bord réactifs, visualisations d'IA interactives (ApexCharts) et notifications visuelles clairs."),
        bullet("Maintenabilité : code structuré selon les standards Spring Boot (couches controller, service, repository) et typage rigoureux du code React en TypeScript."),`
  },
  {
    target: `        title2("2.3 Diagramme de Cas d'Utilisation Global"),
        body("Le diagramme de cas d'utilisation global modélise l'ensemble des interactions entre les six profils d'utilisateurs (Administrateur, Service Vendeur, Vendeur, Service Logistique, Service Client et Service Finance) et les cas d'utilisation majeurs de la plateforme. Il fournit une vue d'ensemble de la couverture fonctionnelle du système."),`,
    replace: `        title2("2.3 Diagramme de Cas d'Utilisation Global"),
        body("Le diagramme de cas d'utilisation global modélise l'ensemble des interactions entre les trois profils d'utilisateurs (Administrateur, Manager et Opérateur) et les cas d'utilisation majeurs de la plateforme Nexora. Il fournit une vue d'ensemble de la couverture fonctionnelle du système."),`
  },
  {
    target: `        makeTable(
          ["Sprint", "Thématique principale", "Nb US", "Estimation (SP)", "Durée", "Type"],
          [
            ["Sprint 1", "Sécurité et accès", "9", "17.5", "2 semaines", "Sprint"],
            ["Sprint 2", "Gestion des commandes et transporteurs", "33", "36.1", "4 semaines", "Sprint"],
            ["Sprint 3", "Application mobile vendeur et tableaux de bord", "22", "36.5", "4 semaines", "Sprint"],
            ["Sprint 4", "CRM, automatisation, ventes, facturation et IA", "16", "34.5", "4 semaines", "Sprint"],
            ["Sprint 5", "Administration du système", "2", "6", "2 semaines", "Sprint"],
          ],
          [1000, 3000, 700, 1000, 1400, 1200]
        ),`,
    replace: `        makeTable(
          ["Sprint", "Thématique principale", "Nb US", "Estimation (SP)", "Durée", "Type"],
          [
            ["Sprint 1", "Sécurité et accès (JWT, RBAC)", "6", "15", "2 semaines", "Sprint"],
            ["Sprint 2", "Gestion de production et machines (TRG)", "6", "18", "4 semaines", "Sprint"],
            ["Sprint 3", "Gestion des stocks et mouvements", "6", "15", "3 semaines", "Sprint"],
            ["Sprint 4", "Machine Learning et Data Science (FastAPI)", "5", "18", "4 semaines", "Sprint"],
            ["Sprint 5", "Supervision et monitoring (ActivityLog)", "3", "8", "2 semaines", "Sprint"],
          ],
          [1000, 3000, 700, 1000, 1400, 1200]
        ),`
  },
  {
    target: `        makeTable(
          ["Indicateur", "Valeur"],
          [
            ["Nombre de Fonctionnalités", "13"],
            ["Nombre de User Stories", "91"],
            ["Estimation totale (SP)", "130.6"],
            ["Nombre de Sprints", "5"],
            ["Durée des sprints courts", "2 semaines"],
            ["Durée des sprints longs", "4 semaines"],
            ["Durée totale du projet", "~4,5 mois"],
          ],
          [4480, 4880]
        ),`,
    replace: `        makeTable(
          ["Indicateur", "Valeur"],
          [
            ["Nombre de Fonctionnalités", "9"],
            ["Nombre de User Stories", "26"],
            ["Estimation totale (SP)", "74"],
            ["Nombre de Sprints", "5"],
            ["Durée des sprints courts", "2 semaines"],
            ["Durée des sprints longs", "4 semaines"],
            ["Durée totale du projet", "~3,5 mois"],
          ],
          [4480, 4880]
        ),`
  },
  {
    target: `        title2("2.6 Architecture Proposée"),
        title3("2.6.1 Architecture Physique"),
        body("L'infrastructure matérielle et réseau d'Nexora est cartographiée au sein de l'architecture physique. Ce schéma de déploiement illustre la distribution de nos serveurs, l'interconnexion avec notre base de données MySQL (port 3306), les interfaces clientes (web et mobile) connectées au même back-end Laravel centralisé, ainsi que les communications sécurisées via divers protocoles réseau :"),
        bullet("**Serveur de Production (VPS/Ubuntu)** : Exécute le proxy inverse Nginx pour le routage sécurisé HTTPS (port 443), le serveur d'API REST sous Laravel (PHP-FPM), le serveur WebSockets **Laravel Reverb** (port 8080) pour la diffusion en temps réel, et le gestionnaire de processus **Supervisor/Systemd** pour la surveillance continue de \`queue:listen\` et Reverb."),
        bullet("**Base de données MySQL (Port 3306)** : Connectée en local au serveur Laravel pour stocker les données métiers, les sessions, les caches et le pipeline des files d'attente (queues)."),
        bullet("**Interfaces Front-end (Web & Mobile)** : Connectées simultanément au back-end Laravel centralisé via HTTPS et sécurisées par jetons JWT : l'application web d'administration (**React.js SPA**) écoute également les WebSockets sur le port 8080 pour les mises à jour en direct, tandis que l'application mobile vendeur (**Flutter App**) permet de gérer les commandes en mobilité."),
        bullet("**Systèmes et API Externes** : La plateforme s'interface directement avec Magento (import de commandes), les APIs des transporteurs (Aramex, Intigo, Phoenix), les notifications/workflows de n8n et les services IA de Groq."),`,
    replace: `        title2("2.6 Architecture Proposée"),
        title3("2.6.1 Architecture Physique"),
        body("L'infrastructure de déploiement et d'hébergement physique d'Nexora est organisée selon une architecture client-serveur moderne et sécurisée, séparant l'API de gestion, le service d'Intelligence Artificielle et la base de données centralisée :"),
        bullet("**Serveur de Base de Données Centralisé** : Exécute le SGBDR Microsoft SQL Server sur son port par défaut, assurant la persistance sécurisée et performante des données d'atelier (utilisateurs, machines, stocks, ordres)."),
        bullet("**Serveur Applicatif Back-end** : Héberge le service Spring Boot 3 (API Java) exposant les endpoints REST sécurisés pour le client web. Il communique en interne avec SQL Server pour exécuter les règles métiers et valider les écritures."),
        bullet("**Serveur de Machine Learning (FastAPI)** : Exécute le service Python sous Uvicorn. Il interroge la base SQL Server pour collecter les historiques et expose des endpoints REST permettant de fournir à l'API Spring Boot et au client React les prévisions d'IA (ARIMA/Prophet), les segmentations K-Means et les anomalies Isolation Forest."),
        bullet("**Interface Front-end (React.js SPA)** : Exécutée au sein du navigateur de l'utilisateur (manager ou opérateur), elle communique via HTTPS avec l'API Spring Boot (pour les actions métiers de gestion et de traçabilité) et FastAPI (pour le rendu dynamique des graphiques analytiques d'IA)."),`
  },
  {
    target: `        title3("2.6.2 Architecture Logique"),
        body("La structuration interne de notre système repose sur une organisation en couches logiques indépendantes. Cette répartition facilite la maintenance du code source et garantit une séparation claire des responsabilités :"),
        bullet("**Couche d'Interface Utilisateur** : Elle comprend l'interface web React pour l'administration et l'application mobile Flutter pour les vendeurs. Les flux de données transitent sous format JSON."),
        bullet("**Couche de Contrôle d'Accès** : Les requêtes HTTP entrantes sont interceptées par des verrous logiciels (middlewares) afin de vérifier la validité des jetons JWT et de contrôler les droits RBAC."),
        bullet("**Couche d'Acheminement (Controllers)** : Les requêtes réseau sont reçues à ce niveau. La validation syntaxique des formulaires y est opérée avant la transmission des données vers les services."),
        bullet("**Couche Métier (Services)** : Elle concentre toute l'intelligence fonctionnelle et le traitement logique du système (commandes, transporteurs, factures, CRM et IA)."),
        bullet("**Couche d'Intégration Rest** : Elle encapsule les appels d'API et gère les échanges réseau avec nos partenaires externes (Magento, Aramex, Intigo, Phoenix, n8n, Groq)."),
        bullet("**Couche de Persistance** : La communication avec le serveur MySQL s'appuie sur le modèle objet-relationnel Eloquent de Laravel pour administrer les entités de données."),`,
    replace: `        title3("2.6.2 Architecture Logique"),
        body("La structure interne de la plateforme Nexora repose sur une architecture en couches logiques étanches. Cette décomposition assure le découplage des composants et facilite la maintenance évolutive :"),
        bullet("**Couche de Présentation (React)** : Fournit l'interface utilisateur monopage pour la console d'administration et d'exécution, exploitant des composants réactifs réutilisables et des visualisations ApexCharts."),
        bullet("**Couche de Sécurité (JWT Middleware)** : Intercepte toutes les requêtes Spring Boot et FastAPI pour vérifier la signature du jeton d'authentification et valider les autorisations basées sur les rôles (RBAC)."),
        bullet("**Couche d'Exposition (REST Controllers)** : Points d'accès d'API exposés sous Spring Boot et FastAPI qui valident la conformité syntaxique des requêtes et sérialisent les données en JSON."),
        bullet("**Couche Logique & Services (Spring Services / Python Modules)** : Implémente le cœur fonctionnel du système (calcul en direct du TRG, affectations de production, alertes d'inventaire et exécutions d'algorithmes de machine learning)."),
        bullet("**Couche d'Accès aux Données (Spring Data JPA / SQL Server Repositories)** : Abstrait la persistance des entités Java via le framework Hibernate et gère la connexion transactionnelle sécurisée vers la base Microsoft SQL Server."),`
  },
  {
    target: `        title3("2.6.3 Schéma architectural"),
        body("L'architecture globale de la plateforme Nexora décrit la répartition des composants applicatifs et les flux d'échange d'informations entre l'API Spring Boot, l'interface web React, le service FastAPI d'Intelligence Artificielle et la base de données SQL Server."),
        pb(),
        makeTable(
          ["Composant", "Technologie / Version", "Rôle"],
          [
            ["Back-end", "Laravel 12.0 / PHP 8.2", "API REST, logique métier, tâches d'arrière-plan, files d'attente (*queues*), gestion des webhooks transporteurs"],
            ["Front-end", "React 18.0.0", "Interface utilisateur monopage (*SPA*), composants réactifs, gestion d'état locale"],
            ["Base de données", "MySQL 8.0", "Persistance et modélisation des données relationnelles (port 3306), stockage de cache et queues"],
            ["WebSockets Server", "Laravel Reverb", "Diffusion de notifications et de mises à jour de statuts en temps réel sur le port 8080"],
            ["Gestionnaire de processus", "Supervisor / Systemd", "Surveillance et maintien en arrière-plan des files d'attente (queue:listen) et de Laravel Reverb"],
            ["Authentification", "JWT", "Authentification sans état (*stateless*) et sécurisation des points d'accès de l'API pour les 2 front-ends"],
            ["Gestion du code", "Bitbucket + Git Flow", "Versionnement du code, gestion des branches, revues par demandes de traction (*pull requests*), intégration et déploiement continus (CI/CD)"],
            ["Tests API", "Postman Collections", "Vérification fonctionnelle et automatisation des tests des points d'accès REST"],
            ["Déploiement", "SSH", "Accès sécurisé pour le déploiement continu et la configuration serveur"],
            ["Reporting", "Power BI Desktop + API", "Modélisation décisionnelle et actualisation des données analytiques"],
            ["Mobile", "Flutter 3.41.6 / Dart 3.11.4", "Développement de l'application mobile vendeur multiplateforme (Android et iOS)"],
          ],
          [2200, 2600, 4560]
        ),`,
    replace: `        title3("2.6.3 Schéma architectural"),
        body("L'architecture globale de la plateforme Nexora décrit la répartition des composants applicatifs et les flux d'échange d'informations entre l'API Spring Boot, l'interface web React, le service FastAPI d'Intelligence Artificielle et la base de données SQL Server."),
        pb(),
        makeTable(
          ["Composant", "Technologie / Version", "Rôle"],
          [
            ["Back-end API", "Spring Boot 3 / Java 17", "Logique métier, passerelle REST centralisée, persistance des données et interfaçage avec le service ML Python"],
            ["Front-end Web", "React 18 / TypeScript", "Interface utilisateur réactive monopage (SPA), tableaux de bord dynamiques, graphiques de prévision interactifs"],
            ["Service ML (IA)", "FastAPI / Python 3.10", "Hébergement des modèles d'IA (ARIMA, Prophet, K-Means, Isolation Forest), calcul des métriques et recommandations"],
            ["Base de données", "Microsoft SQL Server", "Hébergement et persistance des tables relationnelles transactionnelles (dbDWH)"],
            ["Serveur web ML", "Uvicorn ASGI", "Serveur haute performance asynchrone pour exécuter le service FastAPI"],
            ["Authentification", "JWT (JSON Web Token)", "Sécurisation sans état (stateless) des requêtes HTTP entre React, Spring Boot et FastAPI"],
            ["Gestion du code", "Bitbucket + Git", "Hébergement des dépôts et gestion de version collaborative du code"],
            ["Tests API", "Postman Collections", "Vérification fonctionnelle et validation automatisée des endpoints REST"],
          ],
          [2200, 2600, 4560]
        ),`
  },
  {
    target: `        makeTable(
          ["Outil", "Usage"],
          [
            ["Jira", "Planification agile : gestion du backlog de produit, planification et suivi des sprints, tableau Kanban."],
            ["Bitbucket", "Hébergement du dépôt de code source, revues de code, automatisation des tests et des déploiements via le pipeline CI/CD."],
            ["Postman", "Conception, exécution et automatisation des tests d'intégration sur les API REST."],
            ["VS Code", "Éditeur de code source et environnement de développement intégré principal."],
            ["MySQL Workbench", "Conception graphique du schéma de base de données relationnelle et administration SQL."],
            ["Power BI Desktop", "Modélisation sémantique des données, conception graphique des rapports décisionnels et des tableaux de bord."],
          ],
          [2400, 6960]
        ),`,
    replace: `        makeTable(
          ["Outil", "Usage"],
          [
            ["Jira", "Planification agile : gestion du backlog de produit, planification et suivi des sprints, tableau Kanban."],
            ["Bitbucket", "Hébergement du dépôt de code source, revues de code, versionnement collaboratif et suivi Git Flow."],
            ["Postman", "Conception, exécution et validation fonctionnelle des tests d'intégration sur les API REST Spring Boot et FastAPI."],
            ["IntelliJ IDEA & VS Code", "Environnement de développement intégré (IDE) principal pour l'implémentation de l'API Java et du frontend React/FastAPI."],
            ["SSMS (SQL Server)", "Administration et conception graphique des schémas relationnels de base de données SQL Server."],
          ],
          [2400, 6960]
        ),`
  },
  {
    target: `        body("Ce schéma conceptuel présente l'organisation logique des informations au sein d'Nexora en structurant les entités métiers avec leurs propriétés, opérations et relations d'association. Les éléments clés de ce modèle reposent sur les classes suivantes : Commande, LigneCommande, Bordereau, Facture, Produit, Client, Utilisateur, DemandeApprobation et Historique."),`,
    replace: `        body("Ce schéma conceptuel présente l'organisation logique des informations au sein de la plateforme Nexora en structurant les entités métiers avec leurs relations d'association. Les éléments clés de ce modèle reposent sur les classes de production et de stock : Utilisateur, Role, Machine, MachineStop, ProductionOrder, Article, StockMovement et KpiLog."),`
  },
  {
    target: `        body("La plateforme Nexora adopte une architecture client-serveur découplée reposant sur une séparation stricte entre le back-end (Laravel exposant une API REST) et le front-end (React.js SPA et application mobile Flutter). Les communications entre les composants s'effectuent via des requêtes HTTP véhiculant des messages JSON et sécurisées par des jetons JWT. Des tâches planifiées orchestrent les synchronisations automatiques avec le site e-commerce Magento et les transporteurs partenaires."),`,
    replace: `        body("La plateforme Nexora adopte une architecture microservices découplée reposant sur une séparation stricte entre le back-end (Spring Boot 3 exposant l'API REST), le front-end (React.js SPA) et le microservice d'IA (FastAPI sous Python). Les communications s'effectuent via des requêtes HTTP véhiculant des messages JSON et sécurisées par des jetons d'authentification JWT."),`
  },
  {
    target: `        ...techCard(1, "Laravel 12.0",
          "logos/laravel.png",
          "Laravel 12.0 est une infrastructure logicielle PHP open-source s'appuyant sur le motif d'architecture MVC, retenue pour sa fiabilité et ses fonctionnalités de sécurité.",
          "Dans le cadre de cette solution, cette technologie fait office de serveur back-end (API REST) afin de piloter la logique métier globale, orchestrer les traitements asynchrones et intercepter les notifications des transporteurs tiers."
        ),

        ...techCard(2, "React.js 18.0",
          "logos/react.png",
          "React.js 18.0 est un outil JavaScript facilitant la création d'interfaces utilisateur interactives.",
          "Au sein du projet, cette technologie sert à concevoir l'application web monopage (SPA) tout en simplifiant la construction de composants réutilisables pour le rendu de la console d'administration."
        ),

        ...techCard(3, "Flutter 3.41",
          "logos/flutter.png",
          "Flutter 3.41 est une technologie open-source de Google conçue pour fabriquer des applications multiplateformes à l'aide d'une base de code unique.",
          "Dans le cadre de cette solution, cet outil sert au développement de l'application mobile vendeur, faisant office de point d'accès nomade pour les vendeurs partenaires."
        ),

        ...techCard(4, "Power BI Desktop",
          "logos/powerbi.png",
          "Power BI Desktop est une solution d'informatique décisionnelle (Business Intelligence) éditée par Microsoft pour concevoir des modèles et analyser des flux d'informations.",
          "Au sein de notre dispositif, cet outil s'interface avec l'API Laravel pour agréger l'ensemble des données logistiques et commerciales afin de produire des rapports d'activité dynamiques."
        ),

        ...techCard(5, "Bitbucket & Git Flow",
          "atlassian-bitbucket-logo-icon.webp",
          "Bitbucket est une plateforme d'hébergement et de gestion de dépôts de code source basée sur Git.",
          "Elle est employée pour gérer le versionnement du code selon le workflow Git Flow, automatiser les tests et assurer un suivi rigoureux des versions livrées."
        ),

        ...techCard(6, "Magento 2.4",
          "logos/magento.png",
          "Magento 2.4 est une plateforme e-commerce open-source qui sert de boutique en ligne principale pour notre solution.",
          "Elle permet de stocker le catalogue de produits, d'enregistrer les commandes clients et de les transmettre à notre application Nexora via des API REST."
        ),`,
    replace: `        ...techCard(1, "Spring Boot 3 (Java 17)",
          "logos/react.png", 
          "Spring Boot 3 est le framework d'API d'entreprise robuste choisi pour la logique métier et la sécurité.",
          "Dans notre architecture, il sert de passerelle REST principale connectée à la base SQL Server et expose les endpoints pour le front-end React."
        ),
        ...techCard(2, "React.js 18",
          "logos/react.png",
          "React.js 18 est le framework de composants réutilisables retenu pour concevoir l'interface utilisateur monopage.",
          "Il permet aux managers et opérateurs de piloter la production, de consulter les stocks et de visualiser les graphiques interactifs des prévisions IA."
        ),
        ...techCard(3, "FastAPI (Python 3.10)",
          "logos/react.png", 
          "FastAPI est un framework Python haute performance dédié aux services de Machine Learning.",
          "Dans notre application, il héberge les algorithmes de prévision (Prophet, ARIMA, Régression Linéaire), de clustering (K-Means) et de détection d'anomalies (Isolation Forest)."
        ),
        ...techCard(4, "MS SQL Server",
          "logos/powerbi.png", 
          "Microsoft SQL Server est la base de données relationnelle centralisée (dbDWH) hébergeant les données transactionnelles.",
          "Il garantit la persistance des utilisateurs, des machines, des ordres de production, des stocks et de la traçabilité des actions."
        ),
        ...techCard(5, "Bitbucket & Git Flow",
          "atlassian-bitbucket-logo-icon.webp",
          "Bitbucket et Git Flow sont utilisés pour le versionnement du code source du projet.",
          "Ils permettent un travail collaboratif rigoureux et garantissent la traçabilité des modifications apportées aux trois microservices."
        ),
        ...techCard(6, "Uvicorn ASGI",
          "logos/react.png", 
          "Uvicorn fait office de serveur ASGI léger pour exécuter le service de Machine Learning FastAPI sous Python.",
          "Il assure une communication ultra-rapide en JSON pour transmettre les analyses prédictives et les indicateurs dynamiques au client React."
        ),`
  },
  {
    target: `        title2("2.8 Déploiement de l'Application"),
        body("La mise en production de la solution applicative sur notre serveur d'hébergement distant s'appuie sur le protocole chiffré SSH (Secure Shell). Ce canal d'administration sécurisé permet d'exécuter à distance les commandes systèmes requises pour le déploiement."),
        pb(),
        body("Les principales étapes opérationnelles retenues sont les suivantes :"),
        bullet("Ouverture d'un tunnel sécurisé SSH vers le serveur d'hébergement."),
        bullet("Récupération et déploiement du code source depuis le dépôt Bitbucket."),
        bullet("Configuration et chargement des dépendances via Composer et NPM."),
        bullet("Configuration locale des paramètres d'environnement."),
        bullet("Migration et synchronisation du schéma relationnel MySQL."),
        bullet("Lancement des démons et des files de traitement en tâche de fond."),
        bullet("Test et validation finale de la disponibilité de nos endpoints d'API."),`,
    replace: `        title2("2.8 Déploiement de l'Application"),
        body("La mise en production de la solution applicative s'appuie sur le déploiement conteneurisé et les serveurs d'application Java/Python connectés à SQL Server :"),
        pb(),
        body("Les principales étapes opérationnelles retenues sont les suivantes :"),
        bullet("Déploiement de la base relationnelle Microsoft SQL Server sur l'infrastructure d'entreprise."),
        bullet("Compilation du package JAR Spring Boot 3 et exécution du serveur Tomcat intégré."),
        bullet("Configuration de l'environnement virtuel Python 3.10 et démarrage du serveur ML FastAPI via Uvicorn."),
        bullet("Déploiement des fichiers statiques du frontend React 18."),
        bullet("Configuration des variables d'environnement de connexion SQL Server et endpoints d'IA FastAPI."),
        bullet("Exécution et validation des tests d'intégration unitaires finaux."),`
  },
  {
    target: `        title2("2.9 Conclusion"),
        conclusionBox("En conclusion, la phase d'analyse des besoins et de conception globale a permis de définir une architecture robuste pour la plateforme Nexora. L'articulation autour du socle Laravel, React, MySQL et JWT garantit la performance, la sécurité et l'évolutivité du système. Les choix technologiques adoptés couvrent de manière cohérente l'ensemble des besoins de l'application (back-end, front-end, mobile, analytique et gestion de code), tandis que le déploiement sécurisé via SSH assure une exploitation sereine. Le chapitre suivant détaille l'implémentation pratique de cette architecture sprint par sprint."),`,
    replace: `        title2("2.9 Conclusion"),
        conclusionBox("En conclusion, la phase d'analyse des exigences et de conception globale a permis de définir une architecture robuste pour la plateforme Nexora. L'articulation de l'API Spring Boot 3, de l'interface web React, du service FastAPI (Python) et de la base SQL Server garantit des temps de réponse faibles, une sécurité JWT rigoureuse et une évolutivité fonctionnelle. Le chapitre suivant détaille l'implémentation de cette architecture itération par itération."),`
  },
  {
    target: `          "Ce diagramme de séquence modélise le cas d'utilisation « S'authentifier » : il illustre les échanges entre l'utilisateur, le front-end React et l'API Laravel pour la validation des identifiants, la génération du jeton JWT et la redirection vers le tableau de bord.",
          "Ce diagramme représente le déroulement général du processus de connexion et de vérification d'accès. Il permet de visualiser les étapes de validation des informations d'identification et la redirection automatique selon le profil.",
          "Ce premier sprint a permis de mettre en œuvre le mécanisme d'authentification sécurisée par jeton JWT ainsi que la gestion des accès basée sur les rôles (RBAC). Les six profils d'utilisateurs ont été configurés au niveau applicatif. L'interface utilisateur s'adapte dynamiquement selon le rôle identifié afin de restreindre l'affichage aux seuls modules autorisés. Un journal d'audit a été implémenté pour consigner les actions d'administration sensibles avec horodatage.",
          "Les objectifs de ce sprint ont été atteints avec la réalisation des User Stories planifiées. La mise en place de la couche de sécurité et de la structure RBAC a été menée conformément aux exigences de conception. Les tests d'authentification et de routage ont été exécutés afin de vérifier les règles d'accès.",
          [
            ["Tests unitaires", "Validation de la logique RBAC, du chiffrement Bcrypt et de la structure JWT", "PHPUnit", "✓ Méthodes de sécurité validées"],
            ["Tests d'intégration", "Contrôle d'accès et restrictions des routes API selon les rôles", "Laravel Route Middleware", "✓ Accès bloqué aux non-autorisés"],
          ],`,
    replace: `          "Ce diagramme de séquence modélise le cas d'utilisation « S'authentifier » : il illustre les échanges entre l'utilisateur, le front-end React et l'API Spring Boot pour la validation des identifiants, la génération du jeton JWT et la redirection vers le tableau de bord.",
          "Ce diagramme représente le déroulement général du processus de connexion et de vérification d'accès. Il permet de visualiser les étapes de validation des informations d'identification et la redirection automatique selon le rôle.",
          "Ce premier sprint a permis de mettre en œuvre le mécanisme d'authentification sécurisée par jeton JWT ainsi que la gestion des accès basée sur les rôles (RBAC). Les trois profils (ADMIN, MANAGER, OPERATEUR) ont été configurés au niveau applicatif. L'interface utilisateur s'adapte dynamiquement selon le rôle identifié afin de restreindre l'affichage aux seuls modules autorisés. Un journal d'audit a été implémenté pour consigner les actions d'administration sensibles avec horodatage.",
          "Les objectifs de ce sprint ont été atteints avec la réalisation des User Stories planifiées. La mise en place de la couche de sécurité et de la structure RBAC a été menée conformément aux exigences de conception. Les tests d'authentification et de routage ont été exécutés afin de vérifier les règles d'accès.",
          [
            ["Tests unitaires", "Validation de la logique RBAC, du chiffrement BCrypt et de la structure JWT", "JUnit 5", "✓ Méthodes de sécurité validées"],
            ["Tests d'intégration", "Contrôle d'accès et restrictions des routes API selon les rôles", "Spring Security", "✓ Accès bloqué aux non-autorisés"],
          ],`
  },
  {
    target: `        
        title1("Chapitre 4 : Sprint 2 – Gestion des Commandes et Intégration des Transporteurs"),
        ...sprintSection(
          2, 4, "Gestion des Commandes et Intégration des Transporteurs",
          [
            ["2.1", "En tant que service logistique, je veux consulter et gérer l'ensemble des commandes afin de suivre leur cycle de vie opérationnel", "Implémentation du mécanisme d'importation automatique des commandes via l'API de la plateforme Magento", "8", "Terminé"],
            ["2.2", "En tant que service client, je veux valider une commande après confirmation avec le client afin de déclencher son traitement logistique", "Développement de l'interface de validation et de confirmation des commandes clients avant leur mise en préparation", "5", "Terminé"],
            ["2.3", "En tant que vendeur, je veux vérifier la disponibilité des produits afin de confirmer ou de rejeter les commandes en attente", "Création d'une interface de gestion et de suivi des commandes en attente pour cause d'indisponibilité produit", "5", "Terminé"],
            ["2.4", "En tant que service logistique, je veux saisir manuellement une commande afin de traiter les ventes hors plateforme e-commerce", "Développement du formulaire de saisie manuelle pour la création directe de nouvelles commandes", "5", "Terminé"],
            ["2.5", "En tant que service logistique, je veux modifier les informations d'une commande afin de corriger d'éventuelles erreurs avant sa préparation", "Développement de l'interface de modification des articles et des coordonnées de livraison", "3", "Terminé"],
            ["2.6", "En tant que service logistique, je veux consulter l'historique des commandes annulées afin d'analyser les motifs d'annulation", "Implémentation du processus d'annulation des commandes incluant la saisie obligatoire du motif et l'historisation", "3", "Terminé"],
            ["2.7", "En tant que service logistique, je veux filtrer les commandes par statut afin d'identifier rapidement celles qui nécessitent une action urgente", "Conception et intégration d'un panneau latéral de filtrage des commandes par statut avec indicateurs visuels dynamiques", "5", "Terminé"],
            ["2.8", "En tant que service logistique, je veux rechercher une commande par référence afin d'accéder instantanément à ses détails", "Développement du moteur de recherche rapide des commandes par référence", "3", "Terminé"],
            ["2.9", "En tant que service logistique, je veux appliquer des critères de recherche multicritères afin d'affiner la liste des commandes", "Mise en œuvre du système de filtrage combiné par date, prestataire logistique et vendeur partenaire", "3", "Terminé"],
            ["2.10", "En tant que service logistique, je veux naviguer sur une liste paginée afin de consulter de manière fluide un volume important de commandes", "Intégration de la pagination côté serveur et du tri dynamique sur les colonnes", "3", "Terminé"],
            ["2.11", "En tant que service logistique, je veux visualiser le détail complet d'une commande afin de vérifier les adresses et les produits avant expédition", "Développement de la vue détaillée pour la consultation complète des données et de l'historique d'une commande", "3", "Terminé"],
            ["2.12", "En tant que service logistique, je veux suivre le statut des expéditions afin de notifier les vendeurs de l'état d'avancement", "Développement d'une interface visuelle sous forme de frise chronologique pour le suivi des étapes de traitement logistique", "3", "Terminé"],
            ["2.13", "En tant que service logistique, je veux traiter et valider les commandes confirmées afin de les préparer pour l'expédition", "Implémentation de la fonctionnalité de traitement et de validation par lots de plusieurs commandes confirmées", "3", "Terminé"],
            ["2.14", "En tant que service logistique, je veux générer et consulter les bordereaux d'expédition afin de faciliter la préparation des colis", "Intégration du module d'impression directe et de téléchargement des bordereaux d'expédition", "3", "Terminé"],
            ["2.15", "En tant que service logistique, je veux exporter la liste des commandes au format CSV afin de réaliser des analyses externes", "Développement de la fonctionnalité d'exportation de la liste des commandes filtrées au format CSV", "3", "Terminé"],
            ["2.16", "En tant que service logistique, je veux exporter les commandes au format Excel afin de faciliter le reporting", "Implémentation de l'exportation des données de commande au format Microsoft Excel (XLSX)", "3", "Terminé"],
            ["2.17", "En tant que service logistique, je veux exporter une sélection de commandes afin d'extraire des données spécifiques", "Développement de l'option d'exportation restreinte aux seules commandes sélectionnées par l'utilisateur", "2", "Terminé"],
            ["3.1", "En tant que service logistique, je veux expédier des colis via Aramex afin de livrer les clients dans les délais", "Développement de l'intégration avec l'API Aramex pour la création automatisée de colis et la récupération de l'étiquette PDF", "8", "Terminé"],
            ["3.2", "En tant que service logistique, je veux générer l'étiquette d'expédition Aramex afin de l'apposer sur le colis physique", "Mise en place du service de génération, de téléchargement et d'archivage des étiquettes de transport Aramex", "5", "Terminé"],
            ["3.3", "En tant que service logistique, je veux expédier des colis via Intigo afin de diversifier les options de livraison rapide", "Développement de l'intégration avec l'API Intigo pour la création des colis et l'obtention des documents d'expédition", "5", "Terminé"],
            ["3.4", "En tant que service logistique, je veux expédier des colis via Phoenix afin d'élargir la couverture géographique de livraison", "Développement de l'intégration avec l'API Phoenix pour la transmission des colis et l'édition des documents de transport", "5", "Terminé"],
            ["3.5", "En tant que service logistique, je veux archiver et centraliser les étiquettes de transport afin de faciliter le suivi des envois", "Mise en place d'un système de stockage centralisé et sécurisé pour l'ensemble des documents et étiquettes d'expédition", "5", "Terminé"],
            ["3.6", "En tant que service logistique, je veux vérifier la disponibilité d'un transporteur avant de lui affecter une commande", "Implémentation du mécanisme de vérification de la disponibilité des transporteurs tiers avant attribution", "3", "Terminé"],
            ["3.7", "En tant que service logistique, je veux que le système sélectionne automatiquement le transporteur optimal afin de réduire les coûts", "Conception et implémentation du moteur d'attribution automatique du prestataire logistique optimal", "8", "Terminé"],
            ["3.8", "En tant que service logistique, je veux réaffecter manuellement une commande à un autre transporteur en cas de besoin", "Développement de la fonctionnalité de réaffectation manuelle de transporteur", "3", "Terminé"],
            ["3.9", "En tant que service logistique, je veux générer un bordereau de remise groupé par transporteur", "Développement du module d'édition automatique du bordereau de remise groupé", "5", "Terminé"],
            ["3.10", "En tant que service logistique, je veux consulter l'historique des bordereaux de remise émis", "Création d'une interface de consultation et d'historisation des bordereaux de remise générés", "3", "Terminé"],
            ["3.11", "En tant que service logistique, je veux que le système synchronise périodiquement le statut des livraisons", "Développement et planification d'une tâche de fond pour la synchronisation périodique des statuts de livraison", "5", "Terminé"],
            ["3.12", "En tant que service logistique, je veux recevoir des notifications de changement de statut en temps réel", "Développement et configuration des endpoints pour la mise à jour des statuts via les webhooks des transporteurs", "8", "Terminé"],
            ["3.13", "En tant que service logistique, je veux synchroniser le statut de livraison vers la plateforme e-commerce", "Mise en œuvre de la synchronisation retour des statuts logistiques vers la boutique e-commerce Magento", "5", "Terminé"],
            ["3.14", "En tant que service logistique, je veux que le système gère automatiquement les erreurs de communication avec les transporteurs", "Implémentation d'un mécanisme de rejeu automatique avec délai d'attente exponentiel", "5", "Terminé"],
            ["3.15", "En tant que service logistique, je veux consulter les journaux de synchronisation avec les transporteurs", "Développement d'une interface de suivi des journaux de requêtes et d'analyse des erreurs de synchronisation", "3", "Terminé"],
            ["3.16", "En tant que service logistique, je veux consulter les rapports logistiques afin d'analyser les performances de livraison", "Développement de l'interface de consultation des rapports logistiques des performances de livraison par transporteur", "5", "Terminé"],
          ],`,
    replace: `        
        title1("Chapitre 4 : Sprint 2 – Gestion de Production et Suivi des Machines"),
        ...sprintSection(
          2, 4, "Gestion de Production et Suivi des Machines",
          [
            ["2.1", "En tant que manager, je veux consulter les postes de travail (machines) d'atelier afin de voir leur disponibilité", "Développement de la page de liste et de suivi des machines", "8", "Terminé"],
            ["2.2", "En tant que manager, je veux suivre le TRG en direct afin de piloter la productivité", "Développement de l'affichage dynamique et calcul en temps réel du TRG par machine", "8", "Terminé"],
            ["2.3", "En tant que manager, je veux planifier et créer un ordre de production afin d'organiser le planning d'atelier", "Création du formulaire de création et planification d'ordre de production", "8", "Terminé"],
            ["2.4", "En tant que manager, je veux affecter une machine à un ordre de production afin de distribuer les tâches", "Mise en place de la liaison dynamique entre ordre et machine en base de données", "5", "Terminé"],
            ["2.5", "En tant qu'opérateur, je veux mettre à jour le statut d'exécution d'un ordre afin de signaler l'avancement", "Création des boutons d'état d'ordre de production sur le frontend", "5", "Terminé"],
            ["2.6", "En tant que manager, je veux enregistrer et suivre les temps d'arrêt des machines afin d'analyser les pannes", "Développement de l'historique et de la comptabilisation des durées de pannes", "3", "Terminé"],
          ],`
  },
  {
    target: `        body("Ce travail de stage effectué chez Arkan s'est concrétisé par la réalisation de la plateforme Nexora, un écosystème logiciel regroupant un portail d'administration web et une application mobile pour les vendeurs partenaires. Ce dispositif centralisé répond à un impératif stratégique fort : unifier, fluidifier et automatiser le suivi des flux logistiques et des transactions financières, substituant ainsi des outils isolés par une chaîne d'information cohérente et automatisée."),
        pb(),
        body("Le recours au cadre méthodologique Scrum a joué un rôle prédominant dans le succès opérationnel de cette mission. L'organisation du développement en cinq cycles itératifs (de 2 à 4 semaines chacun) a instauré une dynamique d'échange permanente avec l'équipe projet, facilité la résolution réactive des obstacles techniques (tels que l'interfaçage avec les APIs des transporteurs locaux) et assuré un déploiement régulier de livrables fonctionnels directement exploitables."),
        pb(),
        body("Sur le plan technologique, l'architecture retenue a pleinement démontré sa pertinence et sa robustesse. La séparation claire entre une API REST développée sous Laravel et une interface monopage en React.js, complétée par une application mobile vendeur sous Flutter, assure au système flexibilité et extensibilité. Parmi les contributions majeures de ce travail figurent l'intégration des API de transporteurs tiers, la conception d'un modèle décisionnel en étoile sous Power BI renforcé par la sécurité au niveau des lignes (*Row-Level Security*), ainsi que le module d'administration du système et de sécurité applicative."),
        pb(),
        body("Sur le plan personnel, ce projet a constitué une excellente opportunité de consolider mes compétences en génie logiciel et développement full-stack. Il m'a permis de maîtriser les cycles de vie des projets complexes et de comprendre concrètement les défis logistiques et de croissance d'une entreprise moderne de commerce électronique."),`,
    replace: `        body("Ce travail de stage s'est concrétisé par la réalisation de la plateforme intelligente Nexora, un écosystème logiciel regroupant une interface web monopage d'administration et de pilotage d'atelier et un microservice d'Intelligence Artificielle prédictive. Ce dispositif centralisé répond à un impératif stratégique fort : unifier, fluidifier et automatiser le suivi de production d'atelier et la gestion des stocks, substituant ainsi des outils isolés par une chaîne d'information cohérente et temps réel."),
        pb(),
        body("Le recours au cadre méthodologique Scrum a joué un rôle prédominant dans le succès opérationnel de cette mission. L'organisation du développement en cinq cycles itératifs (de 2 à 4 semaines chacun) a instauré une dynamique d'échange permanente avec l'équipe projet, facilité la résolution réactive des obstacles techniques (tels que l'intégration asynchrone des services de Machine Learning) et assuré un déploiement régulier de livrables fonctionnels directement exploitables."),
        pb(),
        body("Sur le plan technologique, l'architecture décentralisée retenue a pleinement démontré sa pertinence et sa robustesse. La séparation claire entre l'API REST Spring Boot 3 (Java 17), l'interface web sous React.js, et le microservice d'IA sous FastAPI (Python 3.10) connectés à Microsoft SQL Server assure au système performance, flexibilité et extensibilité. Parmi les contributions majeures de ce travail figurent le calcul automatique en direct du TRG, le suivi de stock dynamique avec alertes de réapprovisionnement, l'implémentation d'algorithmes prédictifs multi-modèles de Data Science (ARIMA, Prophet), ainsi que le module de supervision d'atelier et de sécurité par jetons JWT."),
        pb(),
        body("Sur le plan personnel, ce projet a constitué une excellente opportunité de consolider mes compétences en génie logiciel, en développement full-stack d'entreprise (Spring/React) et en intégration de modèles d'Intelligence Artificielle. Il m'a permis de maîtriser les cycles de vie des projets industriels et de comprendre concrètement les défis de la gestion d'atelier et de la transition vers l'industrie 4.0."),`
  },
  {
    target: `            ["Sprint 1 – Sécurité & Accès", "15", "12", "5", "31", "1", "32", "96,9 %"],
            ["Sprint 2 – Commandes & Transporteurs", "32", "18", "6", "52", "4", "56", "92,9 %"],
            ["Sprint 3 – Mobile & Dashboards", "24", "14", "8", "43", "3", "46", "93,5 %"],
            ["Sprint 4 – CRM & Facturation", "28", "16", "4", "47", "1", "48", "97,9 %"],
            ["Sprint 5 – Administration", "10", "6", "4", "20", "0", "20", "100 %"],
            ["Total Général", "109", "66", "27", "193", "9", "202", "95,5 %"]`,
    replace: `            ["Sprint 1 – Sécurité & Accès", "15", "12", "5", "31", "1", "32", "96,9 %"],
            ["Sprint 2 – Production & Machines", "24", "16", "8", "45", "3", "48", "93,8 %"],
            ["Sprint 3 – Stocks & Mouvements", "18", "14", "6", "36", "2", "38", "94,7 %"],
            ["Sprint 4 – Algorithmes ML & IA", "20", "12", "5", "35", "2", "37", "94,6 %"],
            ["Sprint 5 – Administration & Monitoring", "10", "6", "4", "20", "0", "20", "100 %"],
            ["Total Général", "87", "60", "28", "167", "8", "175", "95,4 %"]`
  }
];

let replacedCount = 0;
for (const [idx, item] of replacements.entries()) {
  const normalizedTarget = item.target.replaceAll('\r\n', '\n');
  const normalizedReplace = item.replace.replaceAll('\r\n', '\n');

  if (content.includes(normalizedTarget)) {
    content = content.replace(normalizedTarget, normalizedReplace);
    console.log(`✓ Replacement #${idx + 1} succeeded.`);
    replacedCount++;
  } else {
    console.log(`✗ Replacement #${idx + 1} FAILED (Target block not found in build_rapport.js).`);
  }
}

if (replacedCount > 0) {
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`=== Done! ${replacedCount} of ${replacements.length} replacements applied successfully ===`);
} else {
  console.log('=== No replacements applied ===');
}