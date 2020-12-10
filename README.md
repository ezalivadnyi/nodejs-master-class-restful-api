# nodejs-master-class-restful-api

[-> GitHub Repository <-](https://github.com/ezalivadnyi/nodejs-master-class-restful-api)

#####Generate keys:  
```openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pm -out cert.pem```  


#####VS Code debug attach:
```
{
    "name": "Attach to Process",
    "type": "node",
    "request": "attach",
    "restart": true,
    "port": 5858,
    "outFiles": [
        "${workspaceFolder}/build/**/*.js",
        "!**/node_modules/**"
    ],
    "sourceMaps": true
},
```