# nodejs-master-class-restful-api

[-> GitHub Repository <-](https://github.com/ezalivadnyi/nodejs-master-class-restful-api)

#### Generate keys for https:  
```openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pm -out cert.pem```  

#### Run locally:
```
yarn ts-node-dev
```
#### VS Code launch.json:
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node-terminal",
            "name": "ts-node-dev",
            "request": "launch",
            "command": "yarn ts-node-dev",
            "cwd": "${workspaceFolder}"
        },
        {
            "name": "Attach to Process",
            "type": "node",
            "request": "attach",
            "restart": false,
            "port": 5858,
            "outFiles": [
                "${workspaceFolder}/build/**/*.js",
                "!**/node_modules/**"
            ],
            "sourceMaps": true
        },
    ]
}
```