# pepperweed

Perennial media archive

## Dependencies

* [node.js](https://nodejs.org/) (tested on v16)

## Setup

Install dependencies and start the server.

```
npm install
npm start
```

## Testing

```
npm test
```

## Environment variables

* `PORT`: the port number to run the server, defaults to `3000`
* `HOST`: the host to respond to, defaults to `0.0.0.0`
* `DATABASE`: path to the SQLite database, defaults to `./data/main.db`
