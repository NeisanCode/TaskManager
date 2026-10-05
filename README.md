# TaskManager

Application de gestion de tâches (consulter, créer, modifier, supprimer) réalisée dans le cadre d'une évaluation Full Stack.

- **Backend** : Spring Boot (REST API, PostgreSQL, Flyway, springdoc)
- **Frontend** : Angular + TailwindCSS
- **Base de données** : PostgreSQL

---

## Démarrage avec Docker (une seule commande)

Docker lance les trois services : PostgreSQL, le backend Spring Boot et le frontend Angular servi par nginx.

### Prérequis

La seule chose nécessaire est **Docker** :

- Docker Desktop (Windows / macOS), ou Docker Engine + le plugin Compose sur Linux
- Docker Compose v2+ (`docker compose version` doit afficher une version v2)

Aucun JDK, Node.js ni PostgreSQL n'est requis : tout est construit dans les images Docker.

### Lancer le projet

```bash
docker compose up -d --build
```

La première commande télécharge les images et compile le backend (Maven) et le frontend (Angular). Comptez quelques minutes. Les lancements suivants sont bien plus rapides.

Pour suivre le démarrage des services :

```bash
docker compose logs -f
```

### Adresses

| Service               | URL                                   | Remarque                                                                 |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| Application Angular   | http://localhost:4200                 | à utiliser pour tester l'application                                    |
| API REST              | http://localhost:8080/api/tasks       |                                                                          |
| Documentation Swagger | http://localhost:8080/swagger-ui.html |                                                                          |
| PostgreSQL            | `localhost:5433`                    | utilisateur`postgres`, mot de passe `postgres`, base `taskmanager` |

L'application Angular appelle l'API avec des URL relatives (`/api/tasks`), et nginx les transmet au conteneur backend. Le navigateur ne contacte donc qu'une seule origine, ce qui évite toute configuration CORS.

### Arrêter le projet

```bash
docker compose down
```

### Réinitialiser la base de données

```bash
docker compose down -v
```

Le volume PostgreSQL est supprimé : les données sont effacées et la base est recréée au prochain démarrage (le schéma est appliqué par les migrations Flyway).

---

## Lancer en local (sans Docker)

Cette méthode suppose PostgreSQL, un JDK et Node.js installés sur la machine. Elle est utile pour le développement, car le rechargement à chaud est disponible.

Les ports utilisés en local sont identiques à ceux publiés par Docker, donc **les deux modes ne peuvent pas tourner en même temps**. Si Docker tourne, arrêter les processus locaux (ou arrêter Docker) avant.

### 1. PostgreSQL

```bash
docker compose up -d db
```

Seul le service `db` est démarré. Il reste accessible sur le port `5433`.

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

L'API écoute sur http://localhost:8080. La configuration de connexion se trouve dans `backend/src/main/resources/application.properties`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

L'application est disponible sur http://localhost:4200. En développement, le fichier `frontend/proxy.conf.json` transmet les appels `/api` au backend sur le port `8080`.

### Tests

```bash
cd backend  && ./mvnw test    # tests du backend
cd frontend && npm test        # tests du frontend
```

Les tests ne sont pas exécutés pendant la construction de l'image Docker du backend, afin de garder le démarrage rapide.

---

## Choix techniques

- **Architecture backend en couches** : Controller → Service → Repository. Les exceptions sont gérées par un unique `@RestControllerAdvice`.
- **Migrations Flyway** : le schéma est décrit par des fichiers SQL versionnés, donc reproductible et versionné avec le code.
- **Validation Jakarta** : `@NotBlank` / `@NotNull` sur les requêtes. La mise à jour attend le corps complet de la tâche, ce qui est la raison du `GET` suivi d'un `PUT` lors du changement de statut.
- **Filtrage et tri côté serveur** : `GET /api/tasks` accepte `search`, `status`, `priority`, `sortBy` et `sortDir`. Le champ de tri est limité à une liste blanche, sinon l'API renvoie une erreur `400`.
- **Angular standalone et signals** : le projet n'utilise ni module NgModule ni zone.js. L'état affiché par les composants est donc géré avec des signals.
- **Conteneur non-root** : l'image du backend crée un utilisateur dédié et ne lance pas l'application en `root`.
- **nginx** : sert les fichiers statiques Angular, gère les routes Angular (`/tasks/1` doit renvoyer `index.html`) et fait suivre `/api` au backend.

## Bonus accompli

- Backend:
- Documentation Swagger UI (springdoc)
- Gestion avancée des erreurs (`@RestControllerAdvice`).

### Frontend:

- gestion avancée des erreurs sur chaque écran
- Etats de chargement
- Thème sombre.

### Infrastructure:

- Docker Compose pour toute la pile (PostgreSQL + backend + frontend), images multi-étapes non-root, rendu Angular et proxy API  via nginx.
