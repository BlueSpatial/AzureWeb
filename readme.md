- Because this project use GDAL library, need some dll file in the bin folder
http://vipassanaandenvironmentalinformatics.blogspot.com/2013/03/getting-started-with-c-and-gdal.html

- Also when deploy you must include '/bin' to this project to make sure all files copy above exist on server


- connection string must have this "providerName="System.Data.SqlClient"" for entity framwork
- To update database run Admin/UpdateDatabase
- any database change need to update script create table in setup project

For setup project need to install wix http://wixtoolset.org/

When deploy: 
Must enable 32 bit application in application pool and enable full folder permission for this site


about license:
- license will not work when change system date
- can change the license to debug in license service

Error:
Some time when the login function not work correctly (logout every f5) just restart computer (don't know why); install version also need restart some time
