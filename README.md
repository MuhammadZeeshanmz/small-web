# Small Web

A tiny browser and the small web it reads. Next.js, NestJS, MongoDB, TypeScript.

Requires Node 22 and MongoDB running on localhost:27017.

## API (port 4000)

    cd api
    npm install
    npm run seed
    npm run start:dev

`npm run seed` is repeatable: running it twice gives the same web.
Set `MONGO_URI` to use another database (default `mongodb://localhost:27017/smallweb`).

## Web (port 3000)

    cd web
    npm install
    npm run dev

Open http://localhost:3000 and start at `index.zz`.