angular-remote-table
====================

A simple bootstrap (by default) styled table that supports server side pagination, ordering, filtering, etc.  All paging, ordering, filtering is done on the server side, which makes the directive useful for large datasets that would be inefficient to render w/ a client side solution.

Update Dec 2, 2015: Project officially abandoned
------------------------------------------------

I originally couldn't find a simple Angular library for generating dynamic tables from REST services generated by Django Rest Framework, which is why I dabbled in writing my own.  A few months ago I found the excellent ng-table library, and have made the switch:
https://github.com/esvit/ng-table

It does a great job supporting server side as well as client side searching, filtering, paging, and is pretty configurable.  I highly recommend it to anyone who has too much data to handle entirely on the client.
