# DEEL BACKEND TASK

## Notes from the candidate

## Postman collection

I attached a super simple postman collection that I used to test the endpoints

### Node version

I worked with version v10.24.1 of node. Had to update some dependency versions. Running it with the mentioned version of node should give no problem

### Sequelize 

I never worked with sequelize before, I am sure there are things that could be done in a more performant way ore in a shorter syntax

### Race conditions and concurrency

I only identified 2 endpoints that could lead to race conditions problems: 

**_POST_** `/jobs/:job_id/pay`

the solution I did for that endpoint is the following: 

- get the Client balance. If balance <= 0 -> Error
- get the job that needs to be paid. If job not found -> Error
- If Client balance < jobPrice -> Error

Once all this checks are fulfilled the payment of the job is done as a transaction: 

- Subtract the jobPrice from the Clients balance
- Add the jobPrice to the Contractors balance
- Set the job as paid

Doing that as a transaction ensures that there will not be a scenario where the money is subtracted from the Client and not added to the Contractor balance but still there could be a race condition issue:

In the eventual case that 2 same requests are fired to pay the same job at the same time: 

(this intends to represent a timeline)

 - [REQUEST A] --> ClientBalance -> GetJob -> Transaction
 - [REQUEST B] _____ --> ClientBalance -> GetJob -> Transaction

if Request B checks the Client balance when the Transaction from REQUEST A (that will decrement the clients balance) is about to be done it will get the right client balance at that moment but incorrect once the job is paid at REQUEST A. which will lead to race condition.
As a safety measure to avoid that I added an extra check in the Job.Update to check that the job is not paid. If any error occurs during the transaction or any model update an error is thrown and the rollback takes place.

Coming from an AWS background I would approach this problem using AWS SQS and queue all the sensitive actions like payments in a queue. Setting the Queue events consumer with a concurrency of 1 will ensure that only one payment takes place at the same time which will avoid most of the race condition issues.

**_POST_** `/balances/deposit/:userId`

the solution I did for that endpoint is the following:

- Get the pending payment amount for the client active jobs
- Get the client current balance
- if balance to add exceeds the limit allowed -> Error

to avoid the possible race condition that could happen when two deposits for the same client are being processed at the same time I get the clients balance before the increment and in the increment query I update it only if its balance matches the one it had at the beginning of the process.

if the Increment() method does not update any row a 409 error is returned. 

Another possible solution could be to use some libraries (like mutex https://www.npmjs.com/package/async-mutex) that help to deal with methods that could lead to race conditions. Blocking the execution of some pieces of sensitive code if those are already running would avoid those race conditions
https://blog.theodo.com/2019/09/handle-race-conditions-in-nodejs-using-mutex/

### Sign non-asynchronous methods with async

Some methods that don't actually require the async signature have it anyway. The reason for that is to specify that that method returns a promise. Coming from a typescript background i am used to linter giving an error if those methods are not signed with the async.
Its more an agreement than an actual need. Working in a team is a good practice to provide as much information as possible to whoever comes after you. 


💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. Start by creating a local repository for this folder.

1. In the repo root directory, run `npm install` to gather all dependencies.

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

1. Then run `npm start` which should start both the server and the React client.

❗️ **Make sure you commit all changes to the master branch!**

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

## APIs To Implement

Below is a list of the required API's for the application.

1. **_GET_** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

## Submitting the Assignment

When you have finished the assignment, zip your repo (make sure to include .git folder) and send us the zip.

Thank you and good luck! 🙏
