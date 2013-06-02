
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

insert into 'genres'
  select '1' as genre_id, 'Alternative' as 'genre'
union select '2', 'Country'
union select '3', 'Pop/Rock'
union select '4', 'Classical'
union select '5', 'Bluegrass'
union select '6', 'Folk'
union select '7', 'Acoustic'
union select '8', 'Blues/Gospel'
union select '9', 'Choir/Chorus';
