CREATE TABLE productions
(
    id              SERIAL PRIMARY KEY,
    titel           JSONB,
    ondertitel      JSONB,
    description1    JSONB,
    description2    JSONB,
    planning_id     TEXT,
    artist          JSONB,
    tagline         JSONB,
    credits         JSONB,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now(),
    legacy_id       TEXT UNIQUE,
    attendance_mode TEXT,
    performer_type  TEXT
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
    starttime       TIMESTAMP NOT NULL,
    endtime         TIMESTAMP NOT NULL,
    doors_at        TIMESTAMP,
    intermission_at TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP NOT NULL DEFAULT now(),
    production_id   INT       NOT NULL,
    legacy_id       TEXT UNIQUE,
    CONSTRAINT fk_production
        FOREIGN KEY (production_id)
            REFERENCES productions (id)
            ON DELETE CASCADE
);
CREATE INDEX idx_events_production_id ON events (production_id);
CREATE INDEX idx_events_starttime ON events (starttime);

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
CREATE INDEX idx_production_blogs_blog_id ON production_blogs (blog_id);

CREATE TABLE tags
(
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag        JSONB     NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    legacy_id  TEXT UNIQUE
);

CREATE TRIGGER set_updated_at_tags
    BEFORE UPDATE
    ON tags
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

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
CREATE INDEX idx_production_tag_tag_id ON production_tag (tag_id);

CREATE TABLE locations
(
    id         INT          NOT NULL,
    location   JSONB UNIQUE NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at TIMESTAMP    NOT NULL DEFAULT now(),
    legacy_id  TEXT UNIQUE,
    PRIMARY KEY (id)
);

CREATE TRIGGER set_updated_at_locations
    BEFORE UPDATE
    ON locations
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TABLE event_locations
(
    event_id    INT NOT NULL,
    location_id INT NOT NULL,
    PRIMARY KEY (event_id, location_id),
    FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
);
CREATE INDEX idx_event_locations_location_id ON event_locations (location_id);

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
CREATE INDEX idx_account_api_keys_api_key_id ON account_api_keys (api_key_id);

CREATE TABLE prices
(
    id         SERIAL PRIMARY KEY,
    name       JSONB          NOT NULL,
    price      NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP      NOT NULL DEFAULT now(),
    updated_at TIMESTAMP      NOT NULL DEFAULT now(),
    legacy_id  TEXT UNIQUE
);

CREATE TABLE event_prices
(
    event_id INT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    price_id INT NOT NULL REFERENCES prices (id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, price_id)
);
CREATE INDEX idx_event_prices_price_id ON event_prices (price_id);

CREATE TABLE scraper_dates
(
    if   SERIAL PRIMARY KEY,
    date TIMESTAMP DEFAULT '1970-01-01 00:00:00'
);

CREATE TYPE crop_name AS ENUM (
    'hd_ready',
    'hd_ready_square',
    'hd_ready_portrait',
    'FE3_header',
    'FE3_2by1',
    'FE3_grid'
);

CREATE TYPE gallery_type AS ENUM (
    'prints',
    'default'
    );

CREATE TYPE "ItemPositionEnum" AS ENUM ('main', 'carousel');

CREATE TABLE media_gallery
(
    id         SERIAL PRIMARY KEY,
    legacy_id  VARCHAR(255) UNIQUE,
    name       VARCHAR(255),
    type       gallery_type,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_gallery_legacy_id ON media_gallery (legacy_id);

CREATE TABLE media_item
(
    id                SERIAL PRIMARY KEY,
    legacy_id         VARCHAR(255) UNIQUE,
    type              VARCHAR(100)     NOT NULL,
    original_filename VARCHAR(500)     NOT NULL,
    position          ItemPositionEnum NOT NULL,
    width             INTEGER,
    height            INTEGER,
    credits           jsonb,
    description       jsonb,
    title             jsonb,
    created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_item_legacy_id ON media_item (legacy_id);
CREATE INDEX idx_media_item_position ON media_item (position);

CREATE TABLE media_crop
(
    id         SERIAL PRIMARY KEY,
    legacy_id  VARCHAR(255) UNIQUE,
    name       crop_name   NOT NULL,
    url        TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_crop_legacy_id ON media_crop (legacy_id);
CREATE INDEX idx_media_crop_name ON media_crop (name);

CREATE TABLE gallery_item
(
    gallery_id INTEGER NOT NULL REFERENCES media_gallery (id) ON DELETE CASCADE,
    item_id    INTEGER NOT NULL REFERENCES media_item (id) ON DELETE CASCADE,
    position   INTEGER NOT NULL DEFAULT 0, -- per-gallery ordering (overrides global item position)
    PRIMARY KEY (gallery_id, item_id)
);

CREATE INDEX idx_gallery_item_item_id ON gallery_item (item_id);

CREATE TABLE item_crop
(
    item_id INTEGER NOT NULL REFERENCES media_item (id) ON DELETE CASCADE,
    crop_id INTEGER NOT NULL REFERENCES media_crop (id) ON DELETE CASCADE,
    PRIMARY KEY (item_id, crop_id)
);

CREATE INDEX idx_item_crop_crop_id ON item_crop (crop_id);

CREATE TRIGGER trg_media_gallery_updated_at
    BEFORE UPDATE
    ON media_gallery
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_media_item_updated_at
    BEFORE UPDATE
    ON media_item
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_media_crop_updated_at
    BEFORE UPDATE
    ON media_crop
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE production_media_gallery
(
    production_id INT NOT NULL REFERENCES productions (id) ON DELETE CASCADE,
    gallery_id    INT NOT NULL REFERENCES media_gallery (id) ON DELETE CASCADE,
    PRIMARY KEY (production_id, gallery_id)
);

CREATE INDEX idx_production_media_gallery_gallery_id ON production_media_gallery (gallery_id);

CREATE TABLE blog_media_gallery
(
    blog_id    INT NOT NULL REFERENCES blogs (id) ON DELETE CASCADE,
    gallery_id INT NOT NULL REFERENCES media_gallery (id) ON DELETE CASCADE,
    PRIMARY KEY (blog_id, gallery_id)
);

CREATE INDEX idx_blog_media_gallery_gallery_id ON blog_media_gallery (gallery_id);

CREATE TYPE print_enum AS ENUM (
    'affiche', 
    'brochure',
    'drukwerk', 
    'programma'
);

CREATE TABLE print_items
(
    id          SERIAL PRIMARY KEY,
    titel       JSONB,
    description JSONB,
    url         TEXT,
    print_type  print_enum,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_print_items_updated_at
    BEFORE UPDATE
    ON print_items
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TABLE print_item_media_gallery
(
    print_item_id    INT NOT NULL REFERENCES print_items (id) ON DELETE CASCADE,
    media_gallery_id INT NOT NULL REFERENCES media_gallery (id) ON DELETE CASCADE,
    PRIMARY KEY (print_item_id, media_gallery_id)
);
