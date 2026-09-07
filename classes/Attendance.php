<?php

declare(strict_types=1);

class Attendance
{
    public function __construct(private Database $database)
    {
    }

    public function state(string $date): array
    {
        $students = $this->database->query(
            'SELECT id, naam, studentnummer, groep FROM students ORDER BY naam'
        )->fetchAll(PDO::FETCH_ASSOC);
        $groups = $this->database->query(
            'SELECT name FROM `groups` ORDER BY name'
        )->fetchAll(PDO::FETCH_COLUMN);
        $checkins = $this->database->query(
            'SELECT studentnummer, DATE_FORMAT(tijd, "%H:%i") AS tijd, '
            . 'IF(TIME(tijd) > "09:00:00", "te laat", "op tijd") AS status '
            . 'FROM checkins WHERE datum = ? ORDER BY tijd DESC',
            [$date]
        )->fetchAll(PDO::FETCH_ASSOC);

        return compact('students', 'groups', 'checkins');
    }

    public function scan(string $code): string
    {
        $student = $this->database->query(
            'SELECT naam FROM students WHERE studentnummer = ?', [$code]
        )->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            return 'Onbekend studentnummer.';
        }

        $today = date('Y-m-d');
        $exists = $this->database->query(
            'SELECT id FROM checkins WHERE studentnummer = ? AND datum = ?', [$code, $today]
        )->fetch();

        if ($exists) {
            return $student['naam'] . ' was al ingecheckt.';
        }

        $this->database->query(
            'INSERT INTO checkins (studentnummer, datum, tijd) VALUES (?, ?, NOW())', [$code, $today]
        );
        return 'Welkom, ' . $student['naam'] . '!';
    }

    public function addStudent(string $name, string $number, ?string $group): void
    {
        $this->database->query(
            'INSERT INTO students (naam, studentnummer, groep) VALUES (?, ?, ?)',
            [$name, $number, $group ?: null]
        );
    }

    public function deleteStudent(int $id): void
    {
        $this->database->query('DELETE FROM students WHERE id = ?', [$id]);
    }

    public function addGroup(string $name): void
    {
        $this->database->query('INSERT INTO `groups` (name) VALUES (?)', [$name]);
    }

    public function deleteGroup(string $name): void
    {
        $this->database->query('DELETE FROM `groups` WHERE name = ?', [$name]);
    }
}
