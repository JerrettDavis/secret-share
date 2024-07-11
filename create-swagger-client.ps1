Write-Host "Generating swagger.json..."
npm run generate-swagger --prefix secret-share-server
Write-Host "Copying swagger.json..."
Copy-Item ./secret-share-server/swagger.json ./secret-share-client/swagger.json
Write-Host "Generating API client..."
npm run generate-api-client --prefix secret-share-client
Write-Host "Done!"