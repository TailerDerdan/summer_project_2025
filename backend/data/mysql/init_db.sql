CREATE TABLE room
(
    `id`          INT             NOT NULL AUTO_INCREMENT,
    `host_id`     INT             NOT NULL,
    `players_count`     INT             NOT NULL,
    `max_players`     INT             NOT NULL,
    `name`        VARCHAR(255)    NOT NULL,
    `gamemode`    VARCHAR(255)    NOT NULL,
    `is_open`    TINYINT(1)      NOT NULL,
    `time_create`      TIMESTAMP       NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `room_name_idx` (`name`)
);

CREATE TABLE user
(
    `user_id`          INT             NOT NULL AUTO_INCREMENT,
    `room_id`          INT             DEFAULT NULL,
    `nick_name`        VARCHAR(255)    NOT NULL,
    `password`         VARCHAR(255)    NOT NULL,
    `avatar_path`      VARCHAR(255)    DEFAULT NULL,
    `count_games`          INT             DEFAULT NULL,
    `count_wins`          INT             DEFAULT NULL,
    `count_kills`          INT             DEFAULT NULL,
    `count_deaths`          INT             DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE INDEX `user_name_idx` (`nick_name`)
);
