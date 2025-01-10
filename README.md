# Mindflowy: let it go

![Image](./diagrams/Mindflowy_logo_500.png)

## What is this?
A personal project for learning AdonisJS, creating a notebook app that mimics some basic, desirable features of the existing, published app, Workflowy.
Essentially, a list/note app, organized by notebooks, where any note can have a parent note and a previous sibling note.
The heavy-lifting is on the frontend (sorting through notes and organizing them) while the backend is stress free.

## Can I try it out?
It is still being developed. At the moment, you can only try out the backend/API.
First, set your .env file modelled after the .env.example file.

Then:
```
cp compose.development.yaml compose.yaml
docker compose up --build -d
docker exec -it mindflowy-notes-api sh
 > node ace migration:fresh
 > exit
```

Then you can open Insomnia and import the [Insomnia JSON](./Insomnia_v4.json).
You can also view the database with Adminer at <http://localhost:8080>; you will need:
- the name of the database docker container (see compose.yaml)
- username: `$DB_USER` from .env
- password: `$DB_PASSWORD` from .env
- database: `$DB_DATABASE` from .env

When you're done playing, just `docker compose down`. You might want to delete the volume that docker created as well as the build.

### What are the routes/resources?
They are outlined [here in a table](./diagrams/Routes%20&%20Resources.md).

### ER diagram
![Image](./diagrams/Mindflowy%20ER.drawio.png)

## Can I run tests?
Yes. Set your .env based on the env.example file.
- SESSION_DRIVER: set to `memory` instead of `cookie`
- NODE_ENV: set to `test` instead of `development` or `production`
- SUPERUSERS: be sure to have at least one (fake) email address here

Now:
```
cp compose.development.yaml compose.yaml
docker compose up --build -d
docker exec -it mindflowy-notes-api sh
 > node ace test
 > (CTRL+C if it hangs)
 > exit
docker compose down
```

## What's to come?
- a frontend!
  - draggable notes: dragging a note from one location to another causes a couple API calls (parent, sibling)
    - React-draggable?
  - PWA installable with stored session
  - login via e-mail
    - maybe even login via GPG-signed challenge
- deployment: CI/CD pipeline
- demo mode for anyone who signs up
- version 1.0.0 (semantic)
