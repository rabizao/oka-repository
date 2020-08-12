# README!

Install API
-------

    sudo apt install python3.8-venv python3.8-dev python3.8-distutils # For Debian-like systems.
    git clone https://github.com/rabizao/oka-repository.git
    cd oka-repository/backend
    python3.8 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

Start API:
---
    source venv/bin/activate
    cd backend/
    flask run

Access documentation:
---
    http://localhost:5000/docs or http://localhost:5000/docs/swagger


Install frontend:
---
    sudo apt install npm
    cd frontend/
    npm install

Start frontend:
---
    npm start