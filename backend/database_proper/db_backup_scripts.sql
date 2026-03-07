CREATE TABLE productions
(
    id           SERIAL PRIMARY KEY,
    titel        JSONB,
    ondertitel   JSONB,
    description1 JSONB,
    description2 JSONB,
    planning_id  TEXT,
    artist       JSONB,
    tagline      JSONB,
    credits      JSONB,
    created_at   TIMESTAMP DEFAULT now(),
    updated_at   TIMESTAMP DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE
    ON productions
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE events
(
    id              SERIAL PRIMARY KEY,
    starttime       DATE NOT NULL,
    endtime         DATE NOT NULL,
    doors_at        DATE,
    intermission_at DATE,
    created_at      DATE NOT NULL DEFAULT now(),
    updated_at      DATE NOT NULL DEFAULT now(),
    production_id   INT  NOT NULL,
    CONSTRAINT fk_production
        FOREIGN KEY (production_id)
            REFERENCES productions (id)
            ON DELETE CASCADE
);

CREATE TRIGGER set_updated_at_events
    BEFORE UPDATE
    ON events
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE blogs
(
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titel       JSONB     NOT NULL,
    description JSONB     NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TRIGGER set_updated_at_blogs
    BEFORE UPDATE
    ON blogs
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

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
    tag JSONB NOT NULL UNIQUE
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
    id       INT          NOT NULL,
    location JSONB UNIQUE NOT NULL,
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
    id        SERIAL PRIMARY KEY,
    key       VARCHAR(255) NOT NULL UNIQUE, -- up to 256 length api keys supported, less always possible (we use 128 length)
    active    BOOLEAN      NOT NULL DEFAULT TRUE,
    super_key BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE account_api_keys
(
    account_id INT     NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    api_key_id INT     NOT NULL REFERENCES api_keys (id) ON DELETE CASCADE,
    active     boolean not null default true,
    PRIMARY KEY (account_id, api_key_id)
);

CREATE TABLE prices
(
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(255)   NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE event_prices
(
    event_id INT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    price_id INT NOT NULL REFERENCES prices (id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, price_id)
);
