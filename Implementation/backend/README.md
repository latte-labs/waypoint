# WayPoint Backend

This is the backend for the **WayPoint** project, developed with **FastAPI** and **PostgreSQL**. This README provides instructions to get started with the backend development environment.

## Prerequisites

Before setting up the backend, ensure you have the following installed on your machine:

- **Python 3.x**: The programming language used for the backend.
- **PostgreSQL**: The relational database used to store data.
- **Git**: For version control and collaboration.
- **Homebrew** (optional): If you are on macOS and need to install PostgreSQL.

## Setting Up the Development Environment

Follow these steps to set up the project locally after pulling the repository:

### 1. Clone the Repository

Navigate to the **backend** folder:

```bash
cd waypoint/backend
```
### 2. Create and Activate the Virtual Environment
a. Create a virtual environment for the project:

```bash
python3 -m venv venv
```


b. Activate the virtual environment:
On macOS:
```bash
source venv/bin/activate
```
You should see the (venv) prefix in the terminal, indicating that the virtual environment is active.

### 3. Install Dependencies
Install the required Python dependencies using pip:
```bash
pip install -r requirements.txt
```

### 4. Set Up the Database
a. Install PostgreSQL (if not already installed)
If you're using macOS, install PostgreSQL via Homebrew:
```bash
brew install postgresql
```

Start the PostgreSQL service:
```bash
brew services start postgresql
```

b. Create the Database
Create a PostgreSQL database for the project:

```bash
createdb waypoint_db
```
### 5. Set Up Environment Variable
Create a .env file in the backend directory and add the following environment variables:
```bash
DATABASE_URL=postgresql://username:password@localhost/waypoint_db
SECRET_KEY=your_secret_key_here
```
Replace username, password, and waypoint_db with your actual PostgreSQL credentials.
### 6. Run the Application
To run the FastAPI application locally, use the following command:
```bash
uvicorn app.main:app --reload
```
You can now access the app at http://localhost:8000.
### 7. Testing API Endpoints
Use a tool like Postman or REST Client in VSCode to test your API endpoints.
Project Structure

Here’s an overview of the project structure:
```bash
backend/
│
├── db.py                # Database setup and connection
├── main.py              # FastAPI app and routes
├── .env                 # Environment variables
├── venv/                # Virtual environment
├── requirements.txt     # Python dependencies
└── README.md            # This file
```
