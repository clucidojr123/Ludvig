# Ludvig

Google Docs Clone

## Description

Ludvig is an online text-editor featuring real-time collaboration between multiple users. Changes are represented and resolved using [Operational Transformation (OT)](https://en.wikipedia.org/wiki/Operational_transformation). 

## Getting Started

### Dependencies

* Docker
* Node.js (For Development)

### How to Start

* Clone the repo

   ```
   git clone https://github.com/clucidojr123/Ludvig.git
   ```

* cd into project directory

   ```
   cd Ludvig
   ```

* To launch in a production environment:

   ```
   docker-compose up -d
   ```

* To launch in a development environment:

   ```
   docker-compose -f docker-compose-dev.yml up -d
   ```


## Built With

* [Docker](https://www.docker.com/)
* [MongoDB](https://www.mongodb.com/)
* [ShareDB](https://share.github.io/sharedb/)
* [TypeScript](https://www.typescriptlang.org/)
* [Express](https://expressjs.com/)
* [React](https://reactjs.org/)
