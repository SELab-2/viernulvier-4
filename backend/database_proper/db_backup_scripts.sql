CREATE TABLE productions
(
    titel        TEXT,
    ondertitel   TEXT,
    description1 TEXT,
    description2 TEXT,
    genre        TEXT,
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