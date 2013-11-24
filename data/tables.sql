--
-- Definition of table venues
--

DROP TABLE IF EXISTS venues;
CREATE TABLE venues (
  id int(11) NOT NULL AUTO_INCREMENT,
  business_name varchar(255) NOT NULL,
  address1 varchar(255) NOT NULL,
  address2 varchar(255) NOT NULL,
  city varchar(255) NOT NULL,
  state char(2) NOT NULL DEFAULT 'VT',
  zip char(10) NOT NULL,
  lat double NOT NULL,
  lng double NOT NULL,
  website varchar(255) NOT NULL,
  phone varchar(30) NOT NULL,
  email varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
