# MaStR Mockup API Documentation

This API documentation provides information about the endpoints and functionality of the MaStR Mock service that provides data storage for small privately-owned energy generators.

## Base URL

The base URL for all API endpoints is: `https://thbmastrmock.azurewebsites.net/`

## Data Object

For every request that needs a unit object, the following data structure needs to be provided in JSON format. 

| **Parameter**                  | **Type** | **Required** | **Description**                                |
|--------------------------------|----------|--------------|------------------------------------------------|
| user.username                  | string   | true         | Username of the unit owner                     |
| user.password                  | string   | true         | Password of the unit owner                     |
| personData.salutation          | string   | true         | Salutation of the unit owner                   |
| personData.title               | string   | false        | Title of the unit owner                        |
| personData.firstName           | string   | true         | First name of the unit owner                   |
| personData.lastName            | string   | true         | Last name of the unit owner                    |
| personData.birthDate           | date     | true         | Birth date of the unit owner                   |
| personData.email               | string   | true         | Email address of the unit owner                |
| address.postalCode             | string   | true         | Postal code of the unit owner                  |
| address.city                   | string   | true         | City of the unit owner                         |
| address.street                 | string   | true         | Street of the unit owner                       |
| address.houseNumber            | string   | true         | House number of the unit owner                 |
| address.addressAddition        | string   | false        | Additional address information                 |
| address.country                | string   | true         | Country of the unit owner                      |
| address.state                  | string   | true         | State of the unit owner                        |
| address.longitude              | number   | true         | Longitude coordinate of the unit location      |
| address.latitude               | number   | true         | Latitude coordinate of the unit location       |
| plantDetails.unitName          | string   | true         | Name of the unit                               |
| plantDetails.commissioningDate | date     | true         | Commissioning date of the unit                 |
| plantDetails.grossPower        | number   | true         | Gross power of the unit in kilowatts           |
| plantDetails.inverterLS        | string   | true         | Inverter LS of the unit                        |
| plantDetails.inverterPower     | number   | true         | Inverter power of the unit in kilowatts        |
| plantDetails.batGrossPower     | number   | false        | BAT gross power of the unit in kilowatts       |
| plantDetails.batInverter       | string   | false        | BAT inverter of the unit                       |
| plantDetails.batInverterPower  | number   | false        | BAT inverter power of the unit in kilowatts    |
| plantDetails.storageCapacity   | number   | false        | Storage capacity of the unit in kilowatt-hours |

## Endpoints

### `POST /submitUnit`

This endpoint allows submitting unit data.

#### Request Body

JSON Object with Unit data

#### Response

-   **Status**: 200 OK
-   Body:

jsonCopy code

```
{
  "message": "Unit data submitted successfully",
  "unitId": <unitId>
}
```

#### Error Responses

-   **Status**: 400 Bad Request
-   Body:
```
{
  "errors": [
    {
      "param": "user.username",
      "msg": "Username is required"
    },
    {
      "param": "user.password",
      "msg": "Password is required"
    },
    ...
  ]
}
``` 


-   **Status**: 500 Internal Server Error
-   Body:
```
{
  "error": "Failed to store unit data"
}
``` 
---
### `GET /units`

This endpoint retrieves all existing units as a JSON list.

#### Response

-   **Status**: 200 OK
-   Body: An array of unit objects. Each unit object contains the unit information.
---
### `GET /units/:id`

This endpoint retrieves a single unit by its ID.

#### Path Parameters

 `id` \<number>: The ID of the unit to retrieve 

#### Response

-   **Status**: 200 OK
-   Body: The unit object containing the unit information.

#### Error Responses

-   **Status**: 404 Not Found
-   Body:
```
{
  "error": "Unit not found"
}
``` 
---
### `PUT /units/:id`

This endpoint updates the unit with the specified id.

#### Path Parameters


 `id` \<number>: The ID of the unit to update

#### Request Body

JSON Object with Unit data

#### Response

-   **Status**: 200 OK
-   Body:
```
{
  "message": "Unit updated successfully"
}
``` 

#### Error Responses

-   **Status**: 404 Not Found
-   Body:
```
{
  "error": "Unit not found"
}
``` 

-   **Status**: 400 Bad Request
-   Body:
```
{
  "errors": [
    {
      "param": "user.username",
      "msg": "Username is required"
    },
    {
      "param": "user.password",
      "msg": "Password is required"
    },
    ...
  ]
}
``` 

-   **Status**: 500 Internal Server Error
-   Body:
```
{
  "error": "Failed to update the unit"
}
``` 
---
### `DELETE /units/:id`

This endpoint deletes a unit by its ID.

#### Path Parameters


 `id` \<number>: The ID of the unit to delete

#### Response

-   **Status**: 200 OK
-   Body:
```
{
  "message": "Unit deleted successfully"
}
``` 

#### Error Responses

-   **Status**: 404 Not Found
-   Body:
```
{
  "error": "Unit not found"
}
``` 

-   **Status**: 500 Internal Server Error
-   Body:
```
{
  "error": "Failed to delete the unit"
}
``` 

## Database

The API uses an in-memory SQLite database to store unit data.

The `units` table schema:
```
CREATE TABLE IF NOT EXISTS units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  salutation TEXT NOT NULL,
  title TEXT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  birthDate DATE NOT NULL,
  email TEXT NOT NULL,
  postalCode TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  houseNumber TEXT NOT NULL,
  addressAddition TEXT,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  longitude REAL NOT NULL,
  latitude REAL NOT NULL,
  unitName TEXT NOT NULL,
  commissioningDate DATE NOT NULL,
  grossPower REAL NOT NULL,
  inverterLS TEXT NOT NULL,
  inverterPower REAL NOT NULL,
  batGrossPower REAL,
  batInverter TEXT,
  batInverterPower REAL,
  storageCapacity REAL
)
``` 

The unit data is inserted into the `units` table using the `INSERT INTO` statement. The unit data is updated using the `UPDATE` statement, and units are deleted using the `DELETE` statement.

The `units` table columns correspond to the parameters in the unit data.

## Execution

Ensure that you have the required dependencies installed, including `express`, `swagger-ui-express`, `yamljs`, and `sqlite3`.

Start the API server by running the following command: `node service.js`.  The API server will start listening on `http://localhost:3000` or the specified port.

Note: The SQLite database used by the API is in-memory and will be reset each time the server restarts
