# Aanwezigheidssysteem

Een eenvoudige REST API met een webpagina voor het inchecken van studenten. De API gebruikt Node.js, Express, TypeScript en MySQL.

## Starten

1. Installeer Node.js 20 of hoger en MySQL.
2. Maak de database en tabellen aan door `schema.sql` uit te voeren in MySQL.
3. Maak een bestand `.env` in de projectmap:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=aanwezigheid_systeem
PORT=3001
```

4. Installeer packages en start de app:

```powershell
npm install
npm run dev
```

Open daarna `http://localhost:3001`. De interactieve API-documentatie staat op `http://localhost:3001/docs`.

## Architectuur

Een request gaat steeds door dezelfde vier lagen:

```text
Route -> Controller -> Service -> Database
```

- `src/server.ts`: Express-server, middleware, Swagger en foutafhandeling.
- `src/utils/`: gedeelde hulpmiddelen zoals database, router en validatie.
- `src/utils/routing.ts`: centrale plek waar controllers worden geregistreerd.
- `src/modules/attendance-module/controllers/`: HTTP-routes.
- `src/modules/attendance-module/dto/`: controleert binnenkomende JSON-data.
- `src/modules/attendance-module/services/`: businesslogica en SQL-queries.
- `src/modules/attendance-module/models/`: vorm van studenten, groepen en check-ins.

## REST endpoints

De endpoints staan onder `/api/v1/attendance`:

- `GET /state`: studenten, groepen en check-ins van vandaag.
- `POST /scan`: check een student in met `{ "code": "252272" }`.
- `GET /students`: alle studenten.
- `GET /students/:id`: een student.
- `POST /students`: student toevoegen.
- `PUT /students/:id`: student wijzigen.
- `DELETE /students/:id`: student verwijderen.
- `GET /groups`: alle groepen.
- `POST /groups`: groep toevoegen.
- `DELETE /groups/:name`: groep verwijderen.

De frontend gebruikt deze endpoints. Een barcodescanner werkt als toetsenbord: hij typt het studentnummer en drukt daarna op Enter.
