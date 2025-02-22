# WayPoint Backend

This is the backend for the **WayPoint** project, developed with **FastAPI** and **PostgreSQL**. The backend handles API integrations with Google Places, Eventbrite, and OpenAI.

## Prerequisites

Before setting up the backend, ensure you have the following installed on your machine:

- **Python 3.x** – The programming language used for the backend.
- **PostgreSQL** – The relational database used to store structured data.
- **Git** – For version control and collaboration.
- **Homebrew** (optional) – If you are on macOS and need to install PostgreSQL.

## Setting Up the Development Environment

Follow these steps to set up the project locally after pulling the repository.

### 1. Clone the Repository

Navigate to the **backend** folder:

```bash
cd waypoint/backend
```

## 2. Create and Activate the Virtual Environment
a. Create a virtual environment:
```bash
python3 -m venv venv
```
b. Activate the virtual environment:
On macOS:
```bash
source venv/bin/activate
```
You should see the (venv) prefix in the terminal, indicating that the virtual environment is active.
## 3. Install Dependencies
The requirements.txt file is located at the root of the project (outside the backend folder).
To install dependencies, navigate back to the main project folder and run:
```bash
cd ..
pip install -r requirements.txt
```
Note: This ensures all dependencies are installed, including shared packages for both the frontend and backend.

## 4. Set Up the Database
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
Run the following command to create a PostgreSQL database for the project (do it only once):
```bash
createdb waypoint_db
```
## 5. Set Up Environment Variables
Create a .env file in the backend directory and add the following environment variables:
```bash
DATABASE_URL=postgresql://username:password@localhost/waypoint_db
SECRET_KEY=your_secret_key_here
```
Replace username, password, and waypoint_db with your actual PostgreSQL credentials.

## 6. Run the Application Locally
To run the FastAPI application locally, use the following command:
```bash
uvicorn app.main:app --reload
```
The API will now be available at http://localhost:8000.
## 7. Testing API Endpoints
Use a tool like Postman or VSCode REST Client to test API endpoints.

# Project Structure
```bash
main_project_folder/
│── backend/
│   ├── app/
│   │   ├── main.py  # FastAPI entry point
│   ├── .env  # Environment variables
│── frontend/  # React Native frontend
│── requirements.txt  # Dependencies (used by both frontend and backend)
│── README.md  # Project documentation
```


