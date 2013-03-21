@echo off

pushd "%DEPLOYMENT_SOURCE%\.azure"

IF "%SAMPLE%" == "scrumptious" (
  call deploy.scrumptious.cmd
) ELSE (
  echo You have to set SAMPLE setting to "scrumptious"
  exit /b 1
)
