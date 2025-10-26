$body = '{"username":"admin","password":"lk87654321"}'
$response = Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/login' -Method Post -Body $body -ContentType 'application/json'
Write-Host "Token:" $response.token