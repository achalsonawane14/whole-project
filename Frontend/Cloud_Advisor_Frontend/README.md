# Cloud_Advisor_Frontend


# AWS Cost Advisor Frontend

Welcome to the frontend of the AWS Cost Advisor project! This README will guide you through the setup, structure, and usage of the frontend application.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [Installation](#installation)
4. [Usage](#usage)
5. [File Structure](#file-structure)
6. [Contributing](#contributing)
7. [License](#license)
8. [Contact](#contact)

## Project Overview

The AWS Cost Advisor is an application designed to help users manage and optimize their AWS costs. The frontend application provides an intuitive and interactive user interface for analyzing and visualizing AWS cost data.

## Technologies Used

- **React**: A JavaScript library for building user interfaces
- **Tailwind CSS**: A utility-first CSS framework for styling
- **Axios**: A promise-based HTTP client for making API requests

## Installation

To get started with the frontend application, follow these steps:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/VarshiniDandam/Cloud_Advisor_Frontend.git
   cd Cloud_Advisor_Frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the application:**
   ```sh
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` to see the application in action.

## Usage

Once the application is running, you can use the following features:

- **Dashboard**: View a summary of your AWS cost data.
- **Detailed Reports**: Analyze cost data by service, region, and other parameters.
- **Notifications**: Set up cost alerts and receive notifications.
- **Settings**: Configure application settings and preferences.

## File Structure

Here is a brief overview of the file structure:

```
Cloud_Advisor_Frontend/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── BarGraph.js
│   │   ├── DonutGraph.js
│   │   └── Metrics.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   └── LoginPage.js
│   ├── styles/
│   ├── App.js
│   ├── App.test.js
│   ├── index.css
│   ├── index.js
│   ├── logo.svg
│   ├── reportWebVitals.js
│   └── setupTests.js
├── .gitattributes
├── .gitignore
├── package-lock.json
├── package.json
└── README.md
```

## Contributing

We welcome contributions to the AWS Cost Advisor frontend project! If you have any improvements or new features in mind, feel free to open a pull request. Please ensure that your code adheres to our coding standards and includes appropriate tests.

