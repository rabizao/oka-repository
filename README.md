![test](https://github.com/rabizao/oka-repository/workflows/test/badge.svg)
[![codecov](https://codecov.io/gh/rabizao/oka-repository/branch/main/graph/badge.svg?token=4V7MOA5EBL)](https://codecov.io/gh/rabizao/oka-repository)

## OKA Repository

Install API
-------

    sudo apt install python3.8-venv python3.8-dev python3.8-distutils redis-server # For Debian-like systems.
    git clone https://github.com/rabizao/oka-repository.git
    cd oka-repository/backend
    python3.8 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

Start API:
---

    cd backend/
    source venv/bin/activate    
    python backend.py

Access documentation:
---

    http://localhost:5000/docs or http://localhost:5000/docs/swagger

Start celery workers:
---

    cd backend/
    celery worker -A celery_worker.celery --loglevel=info

Install frontend:
---

    sudo apt install npm
    cd frontend/
    npm install

Start frontend:
---

    npm start
