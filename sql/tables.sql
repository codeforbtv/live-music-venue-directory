
create table venues (
  id integer PRIMARY KEY,
  bizName text,
  address1 text,
  address2 text,
  city text,
  state char(2),
  zip char(10),
  website text,
  description text,
  capacity integer,
  techInfo text,
  threesixtyview text,
  slug text -- this is the "url-name"
);

create table contacts (
  contact_id integer PRIMARY KEY,
  name text,
  email text
);

create table genres (
  genre_id integer PRIMARY KEY,
  genre text
);

create table venue_genres (
  venue_id integer,
  genre_id integer,
  PRIMARY KEY(venue_id, genre_id)
);

create table pictures (
  venue_id integer,
  pic text
);

insert into genres values
(1, "Alternative"),
(2, "Country"),
(3, "Pop/Rock"),
(4, "Classical"),
(5, "Bluegrass"),
(6, "Folk"),
(7, "Acoustic"),
(8, "Blues/Gospel"),
(9, "Choir/Chorus");

