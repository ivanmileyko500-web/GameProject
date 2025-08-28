const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });
  win.loadFile('./src/ui/index.html');
}

app.on('ready', () => {
  createWindow();
});

// Закрываем приложение (Windows, Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});