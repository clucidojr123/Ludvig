module.exports = {
  apps : [
    {
      name   : "hariyama1",
      script : "./hariyama/index.js",
      env: {
        PORT: 80,
        WARIO_URI: "http://localhost",
        BASE_WARIO_PORT: 3001
      }
    },
    // {
    //   name   : "hariyama2",
    //   script : "./hariyama/index.js",
    //   env: {
    //     PORT: 6001,
    //     WARIO_URI: "http://localhost",
    //     BASE_WARIO_PORT: 3001
    //   }
    // },
    {
      name   : "luigi1",
      script : "./luigi/dist/index.js",
      env: {
        PORT: 5001,
        MONGO_URI: "mongodb://localhost:49153/ludvig",
        ES_URI: "http://209.94.56.10:9200"
      }
    }, 
    {
      name   : "luigi2",
      script : "./luigi/dist/index.js",
      env: {
        PORT: 5002,
        MONGO_URI: "mongodb://localhost:49153/ludvig",
        ES_URI: "http://209.94.56.10:9200"
      }
    },
    {
      name   : "luigi3",
      script : "./luigi/dist/index.js",
      env: {
        PORT: 5003,
        MONGO_URI: "mongodb://localhost:49153/ludvig",
        ES_URI: "http://209.94.56.10:9200"
      }
    },
    {
      name   : "luigi4",
      script : "./luigi/dist/index.js",
      env: {
        PORT: 5004,
        MONGO_URI: "mongodb://localhost:49153/ludvig",
        ES_URI: "http://209.94.56.10:9200"
      }
    },
    {
    name   : "wario1",
    script : "./wario/dist/index.js",
    env: {
      PORT: 3001,
      SERVER_NUM: 1,
      LUIGI_URI: "ws://localhost:5001",
      ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
      MONGO_URI: "mongodb://localhost:49153/ludvig",
      S3_URI: "localhost",
      ES_URI: "http://209.94.56.10:9200"
    }
  }, 
  {
    name   : "wario2",
    script : "./wario/dist/index.js",
    env: {
      PORT: 3002,
      SERVER_NUM: 2,
      LUIGI_URI: "ws://localhost:5002",
      ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
      MONGO_URI: "mongodb://localhost:49153/ludvig",
      S3_URI: "localhost",
      ES_URI: "http://209.94.56.10:9200"
    }
  },
  {
    name   : "wario3",
    script : "./wario/dist/index.js",
    env: {
      PORT: 3003,
      SERVER_NUM: 3,
      LUIGI_URI: "ws://localhost:5003",
      ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
      MONGO_URI: "mongodb://localhost:49153/ludvig",
      S3_URI: "localhost",
      ES_URI: "http://209.94.56.10:9200"
    }
  },
  {
    name   : "wario4",
    script : "./wario/dist/index.js",
    env: {
      PORT: 3004,
      SERVER_NUM: 4,
      LUIGI_URI: "ws://localhost:5002",
      ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
      MONGO_URI: "mongodb://localhost:49153/ludvig",
      S3_URI: "localhost",
      ES_URI: "http://209.94.56.10:9200"
    }
  },
  // {
  //   name   : "wario5",
  //   script : "./wario/dist/index.js",
  //   env: {
  //     PORT: 3005,
  //     SERVER_NUM: 4,
  //     LUIGI_URI: "ws://localhost:5003",
  //     ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
  //     MONGO_URI: "mongodb://localhost:49153/ludvig",
  //     S3_URI: "localhost",
  //     ES_URI: "http://209.94.56.10:9200"
  //   }
  // },
  // {
  //   name   : "wario6",
  //   script : "./wario/dist/index.js",
  //   env: {
  //     PORT: 3006,
  //     SERVER_NUM: 4,
  //     LUIGI_URI: "ws://localhost:5003",
  //     ORIGIN: "http://gigabossofswag.cse356.compas.cs.stonybrook.edu",
  //     MONGO_URI: "mongodb://localhost:49153/ludvig",
  //     S3_URI: "localhost",
  //     ES_URI: "http://209.94.56.10:9200"
  //   }
  // }
]
}
