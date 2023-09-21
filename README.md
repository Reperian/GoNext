# GoNext Installation, Demo and Development Guide

---
### Prerequisites
- Python version of at least 3.7
- Npm is installed
---
### Backend
***The following steps must be completed before starting up the frontend otherwise it may not work.*** 

1. Open the "**.env**" file in the "**Project Code/server**" directory.
2. In the "**.env**" file, set **DATABASE_NAME** = `Your zID` if you are developing, otherwise if this is a demo, **DATABASE_NAME** = **"GoNextdb"**.
3. Open a terminal in the "**Project Code/server**" directory.
4. Copy and paste the following to the terminal.
   ##### ON WINDOWS 
   ```
   python3 -m venv venv
   venv/scripts/activate
   python3 -m pip install django
   python3 -m pip install psycopg2
   python3 -m pip install django-cors-headers
   python3 -m pip install djangorestframework
   python3 -m pip install python-dotenv
   python3 -m pip install pyjwt
   python3 -m pip install Pillow
   python3 manage.py makemigrations
   python3 manage.py migrate
   python3 manage.py runserver 8080
   ```

   ##### ON MAC AND VNC LAB DEBIAN LINUX
   ```
   python3 -m venv venv
   source venv/bin/activate
   python3 -m pip install django
   python3 -m pip install psycopg2-binary
   python3 -m pip install django-cors-headers
   python3 -m pip install djangorestframework
   python3 -m pip install python-dotenv
   python3 -m pip install pyjwt
   python3 -m pip install pillow
   python3 manage.py makemigrations
   python3 manage.py migrate
   python3 manage.py runserver 8080
   ```
### IMPORTANT
If you have encountered an issue regarding the permission of using port `8080`, you should try perform the following steps:
1. Run `python3 manage.py runserver <YOUR_PORT>`. Where `<YOUR_PORT>` refers to any working port such as port `5000`, `8000` etc.
2. Open up the "**.env**" in the "**Project Code/client**" directory.
3. Change `REACT_APP_BACKEND_SERVER_PORT = "8080"` to `REACT_APP_BACKEND_SERVER_PORT = "<YOUR_PORT>"` where `<YOUR_PORT>` is the same port specified in step 1.
   
**(WINDOWS ONLY)** If you have encountered an issue regarding "Execution Policy" try the following steps at your own security risk.
1. Open powershell in administrator mode.
2. Run the following `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` and select `YES`

   For more information, please visit:
https://learn.microsoft.com/en-gb/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.2

---

### Frontend

1. Open terminal to the "**Project Code/client**" directory.
2. Copy and paste the following to the terminal
   ```
   npm install
   npm run start
   ```
---

## Database
As of this time, the database is being hosted on AWS. When you start the server and/or save any ***.py** file, the database will automatically be wiped and repopulated. This feature is only for the scope of development to make testing for sprint one easier. In the future, a dev only pannel will be added to the frontend to directly manipulate the database for further, more complex testing.
