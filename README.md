# Aanwezigheidssysteem

Een eenvoudige PHP-webapp voor het inchecken van studenten. De app gebruikt PHP, PDO en MySQL.

## Starten

1. Installeer XAMPP of PHP en MySQL.
2. Maak de database en tabellen aan door `schema.sql` uit te voeren in MySQL.
3. Start de PHP-server vanuit deze map:

```powershell
C:\xampp\php\php.exe -S localhost:8000 -t .
```

Open daarna `http://localhost:8000`.

## Simpele structuur

- `index.php`: pagina en formulieren.
- `classes/Database.php`: MySQL-verbinding.
- `classes/Attendance.php`: studenten, groepen en check-ins.
- `classes/App.php`: verwerkt formulieren.
- `style.css`: alle opmaak.
- `schema.sql`: database en voorbeelddata.

Een barcodescanner werkt als toetsenbord: hij typt het studentnummer en verstuurt het formulier.
