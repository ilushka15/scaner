<?php

declare(strict_types=1);

require_once __DIR__ . '/classes/Database.php';
require_once __DIR__ . '/classes/Attendance.php';
require_once __DIR__ . '/classes/App.php';

$app = new App(new Attendance(new Database()));
$data = $app->run();
$state = $data['state'];
$page = $data['page'];
$date = $data['date'];
$message = $data['message'];

function e(string|int|null $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function findCheckin(array $checkins, string $number): ?array
{
    foreach ($checkins as $checkin) {
        if ($checkin['studentnummer'] === $number) return $checkin;
    }
    return null;
}
?>
<!doctype html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aanwezig</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="shell">
    <header class="header">
        <a class="brand" href="index.php"><span class="brand-mark">A</span>Aanwezig</a>
        <nav>
            <a href="index.php?page=scan">Scanstation</a>
            <a href="index.php?page=dashboard">Dashboard</a>
        </nav>
    </header>

    <?php if ($message !== ''): ?>
        <div class="message"><?= e($message) ?></div>
    <?php endif; ?>

    <?php if ($page === 'dashboard'): ?>
        <main class="page">
            <p class="eyebrow">Dashboard</p>
            <h1>Overzicht en beheer</h1>
            <div class="tabs">
                <a class="active" href="index.php?page=dashboard&date=<?= e($date) ?>">Dagoverzicht</a>
                <a href="#beheer">Studenten en groepen</a>
            </div>

            <section class="toolbar">
                <form method="get">
                    <input type="hidden" name="page" value="dashboard">
                    <label for="date">Datum</label>
                    <input id="date" name="date" type="date" value="<?= e($date) ?>">
                    <button type="submit">Bekijken</button>
                </form>
            </section>

            <section class="summary">
                <div><h2><?= e(date('l j F', strtotime($date))) ?></h2><p><?= count($state['checkins']) ?> studenten ingecheckt</p></div>
            </section>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Student</th><th>Groep</th><th>Tijd</th><th>Status</th></tr></thead>
                    <tbody>
                    <?php foreach ($state['students'] as $student): ?>
                        <?php $checkin = findCheckin($state['checkins'], $student['studentnummer']); ?>
                        <tr>
                            <td><strong><?= e($student['naam']) ?></strong><small><?= e($student['studentnummer']) ?></small></td>
                            <td><?= e($student['groep'] ?: 'Geen groep') ?></td>
                            <td><?= e($checkin['tijd'] ?? '-') ?></td>
                            <td><span class="status <?= $checkin ? ($checkin['status'] === 'te laat' ? 'late' : 'on-time') : 'absent' ?>"><?= e($checkin['status'] ?? 'afwezig') ?></span></td>
                        </tr>
                    <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <section id="beheer" class="management">
                <div class="panel"><h2>Student toevoegen</h2>
                    <form method="post" class="form-grid">
                        <input type="hidden" name="action" value="add-student"><input type="hidden" name="page" value="dashboard">
                        <input name="name" placeholder="Naam" required><input name="number" placeholder="Studentnummer" required>
                        <select name="group"><option value="">Geen groep</option><?php foreach ($state['groups'] as $group): ?><option><?= e($group) ?></option><?php endforeach; ?></select>
                        <button type="submit">Toevoegen</button>
                    </form>
                    <ul class="list"><?php foreach ($state['students'] as $student): ?><li><span><strong><?= e($student['naam']) ?></strong><small><?= e($student['studentnummer']) ?> · <?= e($student['groep'] ?: 'Geen groep') ?></small></span><form method="post"><input type="hidden" name="action" value="delete-student"><input type="hidden" name="page" value="dashboard"><input type="hidden" name="id" value="<?= e($student['id']) ?>"><button class="danger">Verwijder</button></form></li><?php endforeach; ?></ul>
                </div>
                <div class="panel"><h2>Groepen</h2>
                    <form method="post" class="form-grid"><input type="hidden" name="action" value="add-group"><input type="hidden" name="page" value="dashboard"><input name="name" placeholder="Groepsnaam" required><button type="submit">Toevoegen</button></form>
                    <ul class="list"><?php foreach ($state['groups'] as $group): ?><li><strong><?= e($group) ?></strong><form method="post"><input type="hidden" name="action" value="delete-group"><input type="hidden" name="page" value="dashboard"><input type="hidden" name="name" value="<?= e($group) ?>"><button class="danger">Verwijder</button></form></li><?php endforeach; ?></ul>
                </div>
            </section>
        </main>
    <?php else: ?>
        <main class="page scan-page">
            <p class="eyebrow">Scanstation</p>
            <h1>Student inchecken</h1>
            <p>Voer een studentnummer in of gebruik een barcodescanner.</p>
            <div class="scan-box"><strong>Scanner klaar</strong><span>Wacht op een studentnummer</span></div>
            <form method="post" class="scan-form"><input type="hidden" name="action" value="scan"><input name="code" placeholder="Bijvoorbeeld 252272" autofocus required><button type="submit">Inchecken</button></form>
            <section class="today"><h2>Vandaag ingecheckt</h2><?php foreach ($state['checkins'] as $checkin): ?><div class="checkin"><span><?= e($checkin['studentnummer']) ?></span><span><?= e($checkin['tijd']) ?> · <?= e($checkin['status']) ?></span></div><?php endforeach; ?><?php if (!$state['checkins']): ?><p>Nog niemand ingecheckt.</p><?php endif; ?></section>
        </main>
    <?php endif; ?>
</div>
</body>
</html>
