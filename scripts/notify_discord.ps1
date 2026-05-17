param (
    [string]$Title = "Regression Test Suite Result",
    [string]$Description = "The regression test suite has been successfully executed on the staging environment.",
    [string]$Status = "Success"
)

$envFile = Join-Path $PSScriptRoot "../.env"
if (-Not (Test-Path $envFile)) {
    # Fallback to absolute path
    $envFile = "d:\Project\MyProject\QA\.env"
}

if (-Not (Test-Path $envFile)) {
    Write-Error "Environment file not found at $envFile"
    exit 1
}

$webhookUrl = Get-Content $envFile | Where-Object { $_ -match "^DISCORD_WEBHOOK_URL=" } | ForEach-Object { $_.Split("=")[1].Trim('"') }

if (-Not $webhookUrl) {
    Write-Error "DISCORD_WEBHOOK_URL not found in .env"
    exit 1
}

$color = if ($Status -eq "Success") { 3066993 } else { 15158332 } # Green vs Red

$body = @{
    username = "Antigravity QA Agent"
    content  = "**[QA regression-test-report]** $Title"
    embeds = @(
        @{
            title = $Title
            description = $Description
            color = $color
            footer = @{ text = "Nexworth QA Verification System" }
            timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $body -ContentType "application/json"
