<?php

declare(strict_types=1);

class Database
{
    private PDO $connection;

    public function __construct()
    {
        $host = getenv('DB_HOST') ?: 'localhost';
        $user = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASSWORD') ?: '';
        $name = getenv('DB_NAME') ?: 'aanwezigheid_systeem';

        $this->connection = new PDO(
            "mysql:host={$host};dbname={$name};charset=utf8mb4",
            $user,
            $password,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }

    public function query(string $sql, array $values = []): PDOStatement
    {
        $statement = $this->connection->prepare($sql);
        $statement->execute($values);
        return $statement;
    }
}
