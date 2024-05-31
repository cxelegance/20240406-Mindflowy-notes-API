# Routes & Resources

| Method | URI                  | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | /                    | A helpful greeting                        |
| POST   | /mindstack           | Create a mindstack                        |
| GET    | /mindstack/:id/notes | Get all notes for specific mindstack      |
| GET    | /mindstack/:id       | Get specific mindstack                    |
| PUT    | /mindstack/:id/notes | Replace all notes in a specific mindstack |
| PUT    | /mindstack/:id       | Update a specific mindstack               |
| DELETE | /mindstack/:id/notes | Delete all notes in a specific mindstack  |
| DELETE | /mindstack/:id       | Delete a specific mindstack               |
| POST   | /note                | Create a note                             |
| GET    | /note/:id            | Get a specific note                       |
| PUT    | /note/:id            | Update a specific note                    |
| DELETE | /note/:id            | Delete a specific note                    |
| POST   | /user/               | Create a new user                         |
| GET    | /user/:id/minstacks  | Get all mindstacks for a specific user    |
| GET    | /user/:id            | Get a specific user                       |
| PUT    | /user/:id            | Update a specific user                    |
| DELETE | /user/:id            | Delete a specific user                    |
