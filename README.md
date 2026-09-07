# Aanwezigheidssysteem

Een prototype voor het inchecken van studenten met een Honeywell-barcodescanner
(bijv. Genesis XP 7680G) en het beheren van studenten, groepen en dagoverzichten.


De database-instellingen komen uit de omgevingsvariabelen `DB_HOST`, `DB_NAME`,
`DB_USER` en `DB_PASSWORD`. Zonder deze variabelen worden de standaard XAMPP-
instellingen gebruikt.

2. Zorg dat de .NET 10 SDK en MySQL geïnstalleerd zijn.

## Hoe de scanner werkt

De Honeywell-scanner werkt als "keyboard wedge": hij doet zich voor als een
toetsenbord en "typt" de gescande barcode gevolgd door Enter. `index.php`
luistert globaal naar toetsaanslagen
(`document.addEventListener("keydown", ...)`), herkent het scanpatroon
(razendsnelle tekens gevolgd door Enter) en zoekt de student op aan de hand
van het gescande studentnummer.

  dotnet run
waar de scanner op is aangesloten, werkt dit zonder extra software of drivers.

Er staat ook een handmatig testveld op het scanstation, zodat je het systeem
kunt testen zonder fysiek te scannen.

## Projectstructuur

├── index.php                      Frontend en browserlogica
├── schema.sql                     MySQL-tabellen en voorbeelddata
4. Open `http://localhost:5000`
```

## Database

De ASP.NET Core-applicatie bestaat uit:

Dat maakt het mogelijk dat:

- Het scanstation en het docentendashboard dezelfde data zien, ook op
Program.cs                           REST-routes en applicatiestart
Services/AttendanceService.cs        Businesslogica en MySQL-operaties
Models/                              C#-datamodellen
index.html                           Frontend en scannerlogica
  verschillende apparaten
De database-instellingen staan in `appsettings.json` en kunnen via ASP.NET Core
configuration worden overschreven.
## Instellingen aanpassen

- **"Te laat"-grens**: pas `START_TIME_MINUTES` aan in `index.php`
  (standaard 08:45).
- **Scan-sleutel**: het systeem gebruikt op dit moment het **studentnummer**
  om een student te herkennen. Als jullie liever het **pasnummer** gebruiken
  (handig als een pas ooit vervangen wordt), pas dan het veld `studentnummer`
   aan naar `pasnummer` in `api.php` en `index.php`.

## XAMPP-instelling

- Zet in XAMPP de services **Apache** en **MySQL** aan.
- Import de SQL uit [schema.sql](schema.sql) via phpMyAdmin.
- Laat de backend draaien met de standaard MySQL-instellingen van XAMPP:
   - host: `localhost`
   - user: `root`
   - password: leeg
   - database: `aanwezigheid_systeem`
