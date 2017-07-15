- Because this project use GDAL library, to run this you must unzip file '/DLLs/GDAL/bin.rar' and copy all files to '/bin'
http://vipassanaandenvironmentalinformatics.blogspot.com/2013/03/getting-started-with-c-and-gdal.html

- Also when deploy you must include '/bin' to this project to make sure all files copy above exist on server


- connection string must have this test "Type System Version=SQL Server 2012"
- To update database run Admin/UpdateDatabase
- any database change need to update script create table in setup project

For setup project need to install wix http://wixtoolset.org/

When deploy: 
Must enable 32 bit application in application pool and enable full folder permission for this site

Need comment the code reactor in the file "BlueSpatial.csproj" :  <!-- obfuscated -->
Need return true for function _isValidLicenseAvailable()

about license:
- license will not work when change system date
- license name must be "key.license" otherwise should restart iis to load license again

Error:
Some time when the login function not work correctly (logout every f5) just restart computer (don't know why); install version also need restart some time
