get-date
$BuildStartTime = $(get-date)
npm run build
$elapsedTime = $(get-date) - $BuildStartTime
$buildTotalTime = "BUILD: {0:HH:mm:ss}" -f ([datetime]$elapsedTime.Ticks)
$buildTotalTime

$StartTime = $(get-date)
# Need to confirm your have the appropriate --publisher-prefix  for your environment.
#pac pcf push --publisher-prefix pworx
pac pcf push --publisher-prefix onegas
$elapsedTime = $(get-date) - $StartTime
$pushTotalTime = "PCF PCF PUSH: {0:HH:mm:ss}" -f ([datetime]$elapsedTime.Ticks)
"--------------"
$buildTotalTime
$pushTotalTime
get-date
