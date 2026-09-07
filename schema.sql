CREATE DATABASE IF NOT EXISTS aanwezigheid_systeem CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE aanwezigheid_systeem;
CREATE TABLE IF NOT EXISTS `groups` (name VARCHAR(100) NOT NULL PRIMARY KEY) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS students (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, naam VARCHAR(150) NOT NULL, studentnummer VARCHAR(50) NOT NULL UNIQUE, groep VARCHAR(100) NULL, FOREIGN KEY (groep) REFERENCES `groups`(name) ON UPDATE CASCADE ON DELETE SET NULL) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS checkins (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, studentnummer VARCHAR(50) NOT NULL, datum DATE NOT NULL, tijd DATETIME NOT NULL, UNIQUE KEY uniq_student_day (studentnummer, datum), FOREIGN KEY (studentnummer) REFERENCES students(studentnummer) ON UPDATE CASCADE ON DELETE CASCADE) ENGINE=InnoDB;
INSERT IGNORE INTO `groups` (name) VALUES ('ICT-2A'), ('ICT-2B');
INSERT IGNORE INTO students (id, naam, studentnummer, groep) VALUES (1, 'Gabriel Dodu', '252272', 'ICT-2A'), (2, 'Sanne de Vries', '251190', 'ICT-2A'), (3, 'Milan Jansen', '251877', 'ICT-2A'), (4, 'Youssef El Amrani', '251344', 'ICT-2B'), (5, 'Fenna Bakker', '252001', 'ICT-2B');
