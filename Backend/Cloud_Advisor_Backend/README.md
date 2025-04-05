# Cloud_Advisor_Backend

# AWS Cost Advisor Backend

Welcome to the backend of the AWS Cost Advisor project! This README will guide you through the setup, structure, and usage of the backend application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [API Endpoints](#api-endpoints)
6. [File Structure](#file-structure)
7. [Environment Variables](#environment-variables)
8. [Explanation of `aws.py`](#explanation-of-awspy)
9. [Explanation of `login.py`](#explanation-of-loginpy)
10. [Contributing](#contributing)
11. [License](#license)
12. [Contact](#contact)

## Project Overview

The AWS Cost Advisor is an application designed to help users manage and optimize their AWS costs. The backend application provides the necessary APIs and services for data processing, storage, and communication with the frontend.

## Technologies Used

- **Python**: The main programming language used for the backend.
- **Flask**: A micro web framework for Python.
- **SQL**: For database management and queries.
- **AWS SDK**: For integrating AWS services.

## Installation

To get started with the backend application, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/VarshiniDandam/Cloud_Advisor_Backend.git
   cd Cloud_Advisor_Backend
   ```

2. **Create and activate a virtual environment:**
   ```sh
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the root directory and add the necessary environment variables as shown in the [Environment Variables](#environment-variables) section.

5. **Run the application:**
   ```sh
   flask run
   ```

## Usage

Once the backend application is running, it will provide the necessary APIs to interact with the frontend application. You can use tools like Postman to test the APIs.

## API Endpoints

Here are some example API endpoints:

- **Authentication:**
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/login`: Log in a user

- **Cost Data:**
  - `GET /api/costs`: Get AWS cost data
  - `POST /api/costs`: Add new AWS cost data
  - `PUT /api/costs/:id`: Update AWS cost data
  - `DELETE /api/costs/:id`: Delete AWS cost data

## File Structure

Here is a brief overview of the file structure:

```
aws-cost-advisor-backend/
├── aws.py
├── data.sql
├── login.py
├── README.md
├── requirements.txt
├── tempCodeRunnerFile.py
└── .env.example
```

## Environment Variables

The backend application requires the following environment variables, which should be set in a `.env` file in the root directory:

```
SKIP_PREFLIGHT_CHECK=true

DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region
```

## Explanation of `aws.py`

The `aws.py` file is the main file for your backend application. Here's a brief overview of what it does:

- **Imports necessary libraries and initializes the Flask app.**
- **Loads environment variables from a `.env` file.**
- **Sets up MySQL database configuration and AWS credentials.**
- **Defines functions to fetch data from MySQL and AWS Cost Explorer.**
- **Defines Flask routes to handle various API requests:**
  - `/fetch-cost-usage`: Fetches cost and usage data from AWS and MySQL.
  - `/fetch-cost-usage-15days`: Fetches cost and usage data for specific days (1st, 15th, 30th, 31st).
  - `/fetch-cost-usage-daily`: Fetches daily cost and usage data.
  - `/fetch-cost-usage-monthly`: Fetches monthly cost and usage data.

## Explanation of `login.py`

The `login.py` file handles the user authentication for your backend application. Here's a brief overview of what it does:

- **Imports necessary libraries and initializes the Flask app.**
- **Loads environment variables from a `.env` file.**
- **Sets up MySQL database configuration.**
- **Defines a function to get a database connection.**
- **Defines Flask routes to handle various API requests:**
  - `/`: A simple welcome route.
  - `/api/login`: Handles user login with CORS support and validates user credentials.
  - `/api/test`: A test route to verify CORS settings.



