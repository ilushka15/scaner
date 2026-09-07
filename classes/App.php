<?php

declare(strict_types=1);

class App
{
    public function __construct(private Attendance $attendance)
    {
    }

    public function run(): array
    {
        $message = '';
        $page = $_GET['page'] ?? 'scan';
        $date = $_GET['date'] ?? date('Y-m-d');

        try {
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                $action = $_POST['action'] ?? '';
                $message = $this->handleAction($action);
                $page = $_POST['page'] ?? $page;
            }
        } catch (Throwable $error) {
            $message = 'Er ging iets mis: ' . $error->getMessage();
        }

        return [
            'page' => $page,
            'date' => $date,
            'message' => $message,
            'state' => $this->attendance->state($date)
        ];
    }

    private function handleAction(string $action): string
    {
        return match ($action) {
            'scan' => $this->attendance->scan(trim($_POST['code'] ?? '')),
            'add-student' => $this->addStudent(),
            'delete-student' => $this->deleteStudent(),
            'add-group' => $this->addGroup(),
            'delete-group' => $this->deleteGroup(),
            default => ''
        };
    }

    private function addStudent(): string
    {
        $this->attendance->addStudent(
            trim($_POST['name'] ?? ''),
            trim($_POST['number'] ?? ''),
            trim($_POST['group'] ?? '') ?: null
        );
        return 'Student toegevoegd.';
    }

    private function deleteStudent(): string
    {
        $this->attendance->deleteStudent((int) ($_POST['id'] ?? 0));
        return 'Student verwijderd.';
    }

    private function addGroup(): string
    {
        $this->attendance->addGroup(trim($_POST['name'] ?? ''));
        return 'Groep toegevoegd.';
    }

    private function deleteGroup(): string
    {
        $this->attendance->deleteGroup(trim($_POST['name'] ?? ''));
        return 'Groep verwijderd.';
    }
}
