CREATE TABLE productions
(
    titel        TEXT,
    ondertitel   TEXT,
    description1 TEXT,
    description2 TEXT,
    genre        TEXT,
    id           SERIAL PRIMARY KEY,
    planning_id  INT
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

CREATE TABLE event_blogs
(
    event_id INT NOT NULL,
    blog_id  INT NOT NULL,

    PRIMARY KEY (event_id, blog_id),

    CONSTRAINT fk_event
        FOREIGN KEY (event_id)
            REFERENCES events (id)
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

-- small example data:

INSERT INTO productions (titel, ondertitel, description1, description2, genre, planning_id, blog_titel, blog_text)
VALUES ('The Great Escape', 'Epic Adventure', 'An adventure film...', 'Set during WWII...', 'Adventure', 1,
        'Behind the Scenes', 'Making of the movie...'),
       ('Love in Paris', 'Romantic Drama', 'A love story...', 'Set in Paris...', 'Romance', 2, 'Director Notes',
        'Filming tips and insights...'),
       ('Mystery Manor', 'Thriller', 'A suspenseful tale...', 'Secrets in the manor...', 'Thriller', 3,
        'Cast Interview', 'Interview with actors...');

-- might need to change ids to what works for you #
INSERT INTO events (starttime, endtime, hall, production_id, price)
VALUES ('2026-02-20', '2026-02-22', 'Main Hall', 1, 5),
       ('2026-02-23', '2026-02-25', 'Side Hall', 2, 7.50),
       ('2026-02-26', '2026-02-27', 'Main Hall', 3, 10);

INSERT INTO blogs (titel, description)
VALUES ('Behind the Scenes of Hamlet',
        'Discover how our actors prepared for Hamlet, including rehearsals, costume design, and stage setup.'),

       ('New Season Announcement',
        'We are excited to announce our new theatre season featuring classics and modern productions.'),

       ('Interview with the Director',
        'An exclusive interview with our director about their vision and creative process.'),

       ('Stage Design Insights',
        'Learn how our stage designers transform ideas into immersive environments.'),

       ('Opening Night Highlights',
        'A recap of our opening night, including audience reactions and memorable moments.');

INSERT INTO production_blogs (production_id, blog_id)
VALUES (1, 1),
       (1, 2),
       (2, 3);

INSERT INTO event_blogs (event_id, blog_id)
VALUES (2, 1);

INSERT INTO tags (tag)
VALUES ('Drama'),
       ('Classic'),
       ('Comedy'),
       ('Family'),
       ('Musical');


-- remove all mock data:
TRUNCATE TABLE
    event_blogs,
    production_blogs,
    tags,
    events,
    blogs,
    productions
    RESTART IDENTITY CASCADE;
