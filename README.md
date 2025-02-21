# ReAngular

ReAngular is a monorepo containing reusable Angular libraries split by functional logic. This structure ensures modularity, better dependency management, and efficient development.

## 📂 Project Structure

ReAngular/ ├── projects/ │ ├── form-controls/ # UI form controls library │ ├── http/ # HTTP/WebSocket clients │ ├── animation/ # Web animations library ├── src/ # Main Angular app (if needed) ├── angular.json ├── package.json ├── README.md

## 🚀 Available Libraries
- **Form Controls** (`form-controls`) – A collection of reusable UI form components.
- **HTTP Clients** (`http`) – Utilities for handling API requests.
- **Animations** (`animation`) – Predefined animations for Angular apps.

## 📦 Installation
Each library can be installed independently:
```sh
npm install @pavelo8501/form-controls