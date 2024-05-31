# Routes & Resources
## Table
| Method | URI                 | Description                              |
| ------ | ------------------- | ---------------------------------------- |
| GET    | /                   | A helpful greeting                       |
| POST   | /notebook           | Create a notebook                        |
| GET    | /notebook/:id/notes | Get all notes for specific notebook      |
| GET    | /notebook/:id       | Get specific notebook                    |
| PUT    | /notebook/:id/notes | Replace all notes in a specific notebook |
| PUT    | /notebook/:id       | Update a specific notebook               |
| DELETE | /notebook/:id/notes | Delete all notes in a specific notebook  |
| DELETE | /notebook/:id       | Delete a specific notebook               |
| POST   | /note               | Create a note                            |
| GET    | /note/:id           | Get a specific note                      |
| PUT    | /note/:id           | Update a specific note                   |
| DELETE | /note/:id           | Delete a specific note                   |
| POST   | /user/              | Create a new user                        |
| GET    | /user/:id/minstacks | Get all notebooks for a specific user    |
| GET    | /user/:id           | Get a specific user                      |
| PUT    | /user/:id           | Update a specific user                   |
| DELETE | /user/:id           | Delete a specific user                   |
