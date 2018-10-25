- Because this project use GDAL library, need some dll file in the bin folder
http://vipassanaandenvironmentalinformatics.blogspot.com/2013/03/getting-started-with-c-and-gdal.html

- Also when deploy you must include '/bin' to this project to make sure all files copy above exist on server


- connection string must have this "providerName="System.Data.SqlClient"" for entity framwork
- To update database run Admin/UpdateDatabase
- any database change need to update script create table in setup project

For setup project need to install wix http://wixtoolset.org/

When deploy: 
- Must enable 64 bit application in application pool and enable full folder permission for this site
- Unload the docker project when publish



about license:
- license will not work when change system date
- can change the license to debug in license service

Error:
Some time when the login function not work correctly (logout every f5) just restart computer (don't know why); install version also need restart some time

Prevent unsave change:
- When reload page
- When active another node
- When change layer tab
- When navigate to another route from manage-metadata-component

-------------------------
For protect code and license we need reactor: http://www.eziriz.com/downloads.htm
the license file download at https://drive.google.com/file/d/0B52HmbNWVv4qWkdrckhwYWR4Uk9iR0pEcDB1T0JyUEdvWlo4/view?usp=sharing
Reactor will protect BlueSpatial.Core.dll when build this project with 'Release' mode (for install it will auto copy)

------
when get error when run: go to Options->web project-> use 64 bit
