$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc2MTQ1NDExOCwiZXhwIjoxNzYxNTQwNTE4fQ.jFQLJmcOwOhQ1WitG9TjYm7Pr5T4iZLir3mSaLgjLnI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = '{"menu_id":1,"title":"Google","url":"https://www.google.com","logo_url":"https://www.google.com/favicon.ico","desc":"Search Engine","sort_order":1}'
$response = Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/cards' -Method Post -Body $body -Headers $headers
Write-Host "Card added:"
$response | ConvertTo-Json