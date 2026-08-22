
<p align="center">
<img src="client/public/logo.png" alt="logo" width="240">
</p>

# Lecheeeeckers  

A 4-player checkers online game/web app, with all the rules of traditional checkers + some other fancy stuff

# Demo
You can check out the live demo [here](https://the-sofishticated-man.gitub.io/4-player-checkers)


## Tech Stack
**Shared**: Typscript, Socket.IO

**Client:** React, Tailwind, dnd-kit

**Server:** Node, Express

## Run Locally
#### Prerequisites:
- Nodejs 24 or later
- Docker
- Docker Compose



Clone the project

```bash
  git clone https://github.com/The-Sofishticated-Man/4-player-checkers.git
```

Go to the project directory

```bash
  cd 4-player-checkers
```

Install All dependencies

```bash
  cd server; npm i
  cd ../client; npm i
```

Start the environment using docker compose

```bash
  # from root directory
  docker compose up
```
or run each process independantly

```bash
  cd client
  npm run dev
```

```bash
  cd server
  npm run dev:sandbox # for sandbox mode
  npm run dev:strict # for strict mode
```

## Sandbox Environment
By default, running the projet locally using docker automatically enables sandbox mode, which lets you test features and mechanics without strict validation.

In sandbox mode:

- game starts with 1 connected player
- move validation and turn ownership checks are bypassed on the server
- a dev-only `debug-set-state` socket event is available

The client also shows a `Dev Sandbox` panel in Vite dev mode on the board page
with quick actions to reset the board, force turn, and load test scenarios.

## Roadmap
I wanted to add these features but unfortunately I'm out of time, if you want to contribute I'd appreciate starting with these.

- [ ] Improve the UI
- [ ] Add a game options menu for custom games (OP kings, breathing room, backward capture without promotion, etc...)
- [ ] User management and elo-based matchmaking system.
- [ ] More themes for board and pieces.
- [ ] Spectator Mode.
- [ ] RESPONSIVE RESPONSIVE RESPONSIVE (I suck at mobile). 

## 🤝 Contributing
Contributions are welcome. If you want to improve this game, here's how to get started.

    1. Fork the repo
    2. Create a feature branch (`git checkout -b feature/your-feature`)
    3. Commit your changes (`git commit -m 'Add your feature'`)
    4. Push to the branch (`git push origin feature/your-feature`)
    5. Open a Pull Request
## License
This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/)

