Big Heavy World Venue Directory
===============================

This is a map of venue information for Vermont implemented with Google Maps. The [data source] is a Google Fusion Table.

Quickstart
----------

1. Clone the repository:

        git clone https://github.com/codeforbtv/live-music-venue-directory
        cd live-music-venue-directory

2. Checkout the `google-maps` branch:

        git checkout google-maps

Tip: If you have python 2.x, start a web server with `python -m SimpleHTTPServer`. Then, point your browser to `http://localhost:8000/`.

Requirements
------------
- When a website user enters a city or town such as "Springfield, VT" into the search box, then a list of nearby venues should appear in a card.

Roadmap
-------

- The Fusion Table API allows CRUD operations. The queries are made with JSON. Look into this further.

Resources
---------

- [Venue Fusion Table](https://www.google.com/fusiontables/data?docid=1PVlLXmOAgG7suxKiqrxfaaFFnupf4XuajSbOW8o)
- [Demo](http://dev.bigheavyworld.com/venues/)

[data source]: https://www.google.com/fusiontables/data?docid=1PVlLXmOAgG7suxKiqrxfaaFFnupf4XuajSbOW8o

Authors
-------
- Evan Flynn <evan.flynn@gmail.com>
