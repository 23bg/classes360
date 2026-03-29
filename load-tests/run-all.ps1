$ErrorActionPreference = "Stop"

$levels = @("light", "medium", "heavy")
$scripts = @(
    "public-pages.js",
    "lead-submission.js",
    "dashboard-apis.js",
    "student-portal.js",
    "payment-flow.js"
)

foreach ($level in $levels) {
    foreach ($script in $scripts) {
        Write-Host "Running $script at $level load..."
        k6 run --env LOAD_LEVEL=$level "load-tests/$script"
    }
}
