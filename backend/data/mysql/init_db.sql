CREATE TABLE play_room
(
    `room_id`          INT             NOT NULL AUTO_INCREMENT,
    `room_name`        VARCHAR(255)    NOT NULL,
    `room_gamemode`    VARCHAR(255)    NOT NULL,
    `room_open`        TINYINT(1)      NOT NULL,
    `room_running`     TINYINT(1)      NOT NULL,
    `time_create`      TIMESTAMP       NOT NULL,
    `host_id`          INT             NOT NULL,
    PRIMARY KEY (`room_id`),
    UNIQUE INDEX `room_name_idx` (`room_name`)
);

CREATE TABLE user
(
    `user_id`          INT             NOT NULL AUTO_INCREMENT,
    `room_id`          INT             DEFAULT NULL,
    `nick_name`        VARCHAR(255)    NOT NULL,
    `password`    VARCHAR(255)    NOT NULL,
    `avatar_path`      VARCHAR(255)    DEFAULT NULL,
    PRIMARY KEY (`user_id`),
    UNIQUE INDEX `user_name_idx` (`nick_name`)
);
