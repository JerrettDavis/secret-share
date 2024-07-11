#!/bin/bash
npm run generate-swagger --prefix secret-share-server
cp ./secret-share-server/swagger.json ./secret-share-client/swagger.json
npm run generate-api-client --prefix secret-share-client
echo "Client generated successfully!"