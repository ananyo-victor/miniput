Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'G:\miniput\backend'; npm run start:dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'G:\miniput\admin'; npm run dev"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'G:\miniput\customer'; npm run dev"