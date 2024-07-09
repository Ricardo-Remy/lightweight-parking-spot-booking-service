## Tech-Challenge

Lightweight parking spot booking service

## Acceptance Criteiras

-   [x] Admin users can create/get/edit/delete any existing booking
-   [x] Standard users can create/get/edit/delete only the bookings they have created themselves

## Application Description

According to the above acceptance criteria, the following considerations have been made:

-   The service will seed users (8 Standard and 2 Admin) on ApplicationBootstrap
-   The service will seed parking spots (10) on ApplicationBootstrap
-   Consistency is insured via transactions with SERIALIZABLE isolation level
-   Caching has been added for GET/:id for faster booking retrieval with 30 seconds key eviction policy (arbitrary value here, could be extended)
-   Caching as been added for faster lookup on user_tokens with an eviction policy of 60 seconds (arbitrary value here, could be extended)
-   The GET endpoint provides in addition pagination for friendly frontend management with an optional limit and offset query parameter
-   The application uses a GUARD to check on the request header token. The token mimics a JWT
-   Users cannot book parking spots that have an overlapping booking
-   Users cannot book parking spots that has an endDateTime before a startDateTime
-   Users can change their parking spot place only if there is no overlapping booking on it
-   The service contains an E2E test suit that mimics the entire booking flow with different scenarios
-   The service contains a /health endpoint that can be periodically pinged for alive healthcheck status
-   Swagger docs are available under https://localhost:3000/docs

## Tech stack choices

For the purpose of this exercice 3 tech stacks choices have been made:

-   Use Nestjs as a progressive Nodejs framework. The 3 reasons are:
    -   Strongly typed
    -   Modular architecture
    -   Very active codebase development and maintenance (surpassed express on Github stars)
-   Use PostgresSQL due to the nature of the assignment where relational tables are need as well as its ACID properties
-   Use Redis as caching mechanism for faster user_token lookup and low latency on particular booking retrievals

Example endpoints below:

```bash
[GET]: http://localhost:3000/bookings?limit=2&page=1
```

```bash
[GET]: http://localhost:3000/bookings/c58bd039-c537-4bbf-b905-af922f46d3d1
```

Example health endpoint below:

```bash
[GET]: http://localhost:3000/health
```

Example of a post request:

```json
curl -X POST http://localhost:3000/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer TOKEN_INSERT_HERE" \
-d '{
    "parkingSpotId": "042e5c95-8d64-4389-95f3-ffec57964676",
    "startDateTime": "2024-07-10T12:05:00Z",
    "endDateTime": "2024-07-10T12:30:00Z"
}'
```

For additional example please refer to the swagger documentation.

## Assumptions made

-   Rate limiting will be done on the infrastructure side (load balance excluding redundant IPs for instance)

## Installation

```bash
Developers node version
v20.9.0
```

```bash
$ yarn install
```

```bash
$ yarn build
```

```bash
ENV=development
DATABASE_URL=postgresql://postgres:emulator@127.0.0.1:5432/postgres
DATABASE_NAME=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PASSWORD=emulator
DATABASE_USERNAME=postgres
DATABASE_PORT=5432
API_PORT=3000
REDIS_URL=redis://127.0.0.1:6379
NUMBER_OF_PARKING_SPOTS=10
```

## Running the app

Make sure you have docker installed.

cd into the tools directory and run:

```bash
# development
$ docker compose up
```

then, open one more different terminal window and from the root run:

```bash
# development
yarn start:dev
```

In a separate terminal window you can run the tests (make sure you have kill the server before)

```
# E2E tests
$ yarn test:e2e
```

The production ready Docker file is in the tools folder.

## Further considerations

To make this application production ready we would need the following:

-   Registration process with first_name, last_name, email and password
-   Hashing and salting user's password
-   Proper login with JWT and rotation token strategy
-   Oauth2 is also an alternative
