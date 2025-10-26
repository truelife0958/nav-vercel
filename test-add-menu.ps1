$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc2MTQ1NDExOCwiZXhwIjoxNzYxNTQwNTE4fQ.jFQLJmcOwOhQ1WitG9TjYm7Pr5T4iZLir3mSaLgjLnI"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = '{"name":"测试菜单","icon":"📝","sort_order":1}'
$response = Invoke-RestMethod -Uri 'https://nav-vercel-eight.vercel.app/api/menus' -Method Post -Body $body -Headers $headers
Write-Host "Menu added:"
$response | ConvertTo-Json