# Bijdragen

Een bug gevonden of een verbetering in gedachten? Issues en pull requests zijn
welkom.

## Lokaal draaien

Dit is een platte statische site: geen Hugo, geen build. `webroot/` is precies
wat er op de CDN komt te staan.

```bash
cd webroot
python3 -m http.server 8000
```

De site staat dan op <http://localhost:8000>.

## Voor je een PR opent

- Bekijk de pagina op een breed **én** een smal scherm, en in licht en donker.
- Alle paden in `webroot/` zijn relatief aan de root van de site. Een link die
  lokaal werkt maar met `../` begint, werkt op de CDN vaak niet.
- De OpenPGP-sleutel wordt tijdens de deploy naar het WKD-pad gekopieerd; pas
  die niet met de hand op twee plekken aan.

## Commitberichten

Dit project gebruikt [Conventional Commits](https://www.conventionalcommits.org/).

**Vorm:**

```text
<type>: <korte omschrijving>
```

**Types:**

| Type | Wanneer |
| --- | --- |
| `feat` | Nieuwe pagina, sectie of functionaliteit |
| `fix` | Bugfix — kapotte layout, verkeerde configuratie, renderfout |
| `docs` | README, CONTRIBUTING of andere metabestanden |
| `chore` | Onderhoud — dependencies, CI/CD, configuratie |
| `style` | Opmaak, witruimte, typefouten |
| `refactor` | Herstructurering zonder gedragsverandering |
| `content` | Bestaande pagina-inhoud bijwerken of verbeteren |
| `revert` | Een eerdere commit terugdraaien |

**Regels:**

- Type en omschrijving in kleine letters
- Onderwerpregel onder de 72 tekens
- Geen punt aan het eind
- Gebiedende wijs ("add", "fix", "update" — niet "added", "fixed", "updated")

## Pull requests

- PR-titels volgen dezelfde conventie als hierboven. De controle
  "Conventional commit title" kijkt daarop en is verplicht.
- Eén logische wijziging per PR
- Richt de PR op `main`
- De PR-template vult zichzelf deels aan: het vinkje voor de titel en het
  opruimen van de niet-gekozen types gebeurt automatisch.
