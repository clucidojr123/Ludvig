const express = require('express');
const httpProxy = require('http-proxy');

const PORT = process.env.PORT || 80;
const WARIO_URI = process.env.BASE_WARIO_URI || "http://localhost";
const BASE_WARIO_PORT = process.env.BASE_WARIO_PORT || 3001;

const app = express();
const proxy = httpProxy.createProxyServer({});

let serverNum = 0;

app.use(express.static("./rowlet/build/"));

app.get("/doc/edit/:id", (req, res, next) => {
    res.sendFile('index.html', { root : "./rowlet/build/"});
    //res.sendFile("/root/Ludvig/rowlet/build/index.html");
});

app.use('/doc/:thing/:docid', (req, res, next) => {
    // Proxy to correct wario server based on docid
    const { docid, thing } = req.params;
    //const warioPort = docid.charAt(0) === "1" ? BASE_WARIO_PORT : parseInt(BASE_WARIO_PORT) + 1;
    proxy.web(req, res, {
        target: `${WARIO_URI}:300${docid.charAt(0)}/doc/${thing}/${docid}`
    }, next);
});

app.use('/collection/create', (req, res, next) => {
    // Pick a random wario server, should be uniformly distributed
    const warioPort = serverNum % 4 + parseInt(BASE_WARIO_PORT);
    serverNum++;
    proxy.web(req, res, {
        target: `${WARIO_URI}:${warioPort}/collection/create`
    }, next);
});

app.use('/collection', (req, res, next) => {
    // Pick a random wario server, should be uniformly distributed
    const warioPort = Math.floor(Math.random() * 4) + parseInt(BASE_WARIO_PORT);
    proxy.web(req, res, {
        target: `${WARIO_URI}:${warioPort}/collection`
    }, next);
});

app.use('/users', (req, res, next) => {
    // Pick a random wario server, should be uniformly distributed
    const warioPort = Math.floor(Math.random() * 4) + parseInt(BASE_WARIO_PORT);
    proxy.web(req, res, {
        target: `${WARIO_URI}:${warioPort}/users`
    });
});

app.use('/index', (req, res, next) => {
    // Pick a random wario server, should be uniformly distributed
    const warioPort = Math.floor(Math.random() * 4) + parseInt(BASE_WARIO_PORT);
    proxy.web(req, res, {
        target: `${WARIO_URI}:${warioPort}/index`
    });
});

app.use('/media', (req, res, next) => {
    // Pick a random wario server, should be uniformly distributed
    const warioPort = Math.floor(Math.random() * 4) + parseInt(BASE_WARIO_PORT);
    proxy.web(req, res, {
        target: `${WARIO_URI}:${warioPort}/media`
    });
});

app.use("/", (req, res, next) => {
    res.sendFile('index.html', { root : "./rowlet/build/"});
    //res.sendFile("/root/Ludvig/rowlet/build/index.html");
});

// app.use('/', (req, res, next) => {
//     console.log("SLASH!!!!");
//     // Pick a random wario server, should be uniformly distributed
//     const warioPort = Math.floor(Math.random() * 4) + parseInt(BASE_WARIO_PORT);
//     proxy.web(req, res, {
//         target: `${WARIO_URI}:${warioPort}`
//     });
// });

app.listen(PORT, function(){
    console.log(`Hariyama listening on port ${PORT}`);
});