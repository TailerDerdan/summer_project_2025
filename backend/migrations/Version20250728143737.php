<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250728143737 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE room (host_id INT NOT NULL, players_count INT NOT NULL, max_players INT NOT NULL, name VARCHAR(255) NOT NULL, gamemode VARCHAR(255) NOT NULL, is_open TINYINT(1) NOT NULL, time_create DATETIME NOT NULL, id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (room_id INT DEFAULT NULL, nick_name VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, is_ready TINYINT(1), avatar_path VARCHAR(255) DEFAULT NULL, count_games INT DEFAULT NULL, count_wins INT DEFAULT NULL, count_kills INT DEFAULT NULL, count_deaths INT DEFAULT NULL, user_id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY (user_id)) DEFAULT CHARACTER SET utf8mb4');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE room');
        $this->addSql('DROP TABLE user');
    }
}
