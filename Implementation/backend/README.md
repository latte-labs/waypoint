# WayPoint Backend

This is the backend for the **WayPoint** project, developed with **FastAPI** and **PostgreSQL**. This README provides instructions to get started with the backend development environment.

## Prerequisites

Before setting up the backend, make sure you have the following installed on your machine:

- **Python 3.x**: The programming language used for the backend.
- **PostgreSQL**: The relational database used to store data.
- **Git**: For version control and collaboration.
- **Homebrew** (optional): If you are on macOS and need to install PostgreSQL.

## Setting Up the Development Environment

Follow these steps to set up the project locally after pulling the repository:

### 1. Clone the Repository

Navigate to the backend folder:
cd waypoint/backend

### 2. Create and Activate the Virtual Environment
Create a virtual environment for the project:
python3 -m venv venv

Activate the virtual environment:

On macOS:
source venv/bin/activate
You should see the (venv) prefix in the terminal, indicating that the virtual environment is active.

### 3. Install Dependencies
Install the required Python dependencies using pip:
pip install -r requirements.txt

### 4. Set Up the Database
a. Install PostgreSQL (if not already installed)
If you're using macOS, install PostgreSQL via Homebrew:
brew install postgresql

Start PostgreSQL service:
brew services start postgresql

b. Create the Database
Create a PostgreSQL database for the project:
createdb waypoint_db

### 5. Set Up Environment Variables
Create a .env file in the backend directory and add the following environment variables:
DATABASE_URL=postgresql://username:password@localhost/waypoint_db
SECRET_KEY=your_secret_key_here
Replace username, password, and waypoint_db with the actual PostgreSQL credentials.

### 6. Run the Application
To run the FastAPI application locally, use the following command:
uvicorn main:app --reload

You can now access the app at http://localhost:8000.

### 7. Testing API Endpoints
Use a tool like Postman or REST Client in VSCode to test your API endpoint.

## Project Structure
backend/
│
├── db.py                # Database setup and connection
├── main.py              # FastAPI app and routes
├── .env                 # Environment variables
├── venv/                # Virtual environment
├── requirements.txt     # Python dependencies
└── README.md            # This file