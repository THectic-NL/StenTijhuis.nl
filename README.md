# StenTijhuis.nl

Broncode van mijn persoonlijke website (`stentijhuis.nl`).

## Inhoud

- `webroot/index.html`: hoofdpagina
- `webroot/404.html`: foutpagina
- `webroot/css/`: styling
- `webroot/js/`: front-end scripts
- `webroot/.well-known/`: security- en keybestanden

## Lokaal draaien

Met Docker Compose:

```bash
docker-compose up --build -d
```

Daarna: `http://localhost:8080`

## License

MIT, zie `LICENSE`.
