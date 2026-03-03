CREATE TABLE productions
(
    titel        TEXT,
    ondertitel   TEXT,
    description1 TEXT,
    description2 TEXT,
    id           SERIAL PRIMARY KEY,
    planning_id  TEXT
);

CREATE TABLE events
(
    id            SERIAL PRIMARY KEY,
    starttime     DATE NOT NULL,
    endtime       DATE NOT NULL,
    price         NUMERIC(5, 2),
    hall          TEXT,
    production_id INT  NOT NULL,
    CONSTRAINT fk_production
        FOREIGN KEY (production_id)
            REFERENCES productions (id)
            ON DELETE CASCADE
);

CREATE TABLE blogs
(
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titel       TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE production_blogs
(
    production_id INT NOT NULL,
    blog_id       INT NOT NULL,

    PRIMARY KEY (production_id, blog_id),

    CONSTRAINT fk_production
        FOREIGN KEY (production_id)
            REFERENCES productions (id)
            ON DELETE CASCADE,

    CONSTRAINT fk_blog
        FOREIGN KEY (blog_id)
            REFERENCES blogs (id)
            ON DELETE CASCADE
);

CREATE TABLE tags
(
    id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag TEXT NOT NULL UNIQUE
);

CREATE TABLE production_tag
(
    production_id INT NOT NULL,
    tag_id        INT NOT NULL,
    PRIMARY KEY (production_id, tag_id),
    CONSTRAINT fk_production
        FOREIGN KEY (production_id)
            REFERENCES productions (id)
            ON DELETE CASCADE,
    CONSTRAINT fk_tag
        FOREIGN KEY (tag_id)
            REFERENCES tags (id)
            ON DELETE CASCADE
);

CREATE TABLE locations
(
    id       INT         NOT NULL,
    location TEXT UNIQUE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE event_locations
(
    event_id    INT NOT NULL,
    location_id INT NOT NULL,
    PRIMARY KEY (event_id, location_id),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);

CREATE TABLE accounts
(
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    super_admin BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE api_keys
(
    id  SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE -- up to 256 length api keys supported, less always possible (we use 128 length)
);

CREATE TABLE account_api_keys
(
    account_id INT     NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    api_key_id INT     NOT NULL REFERENCES api_keys (id) ON DELETE CASCADE,
    active     boolean not null default true,
    PRIMARY KEY (account_id, api_key_id)
);
