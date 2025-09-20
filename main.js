const gameState = require('./src/game/gameState');
const GameConstants = require('./src/game/gameConstants');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

const windows = {};

function createWindow(name) {
  const win = new BrowserWindow({
    width: GameConstants.windowSizes[name].width + GameConstants.outherWindowSizeAddon.width,
    height: GameConstants.windowSizes[name].height + GameConstants.outherWindowSizeAddon.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  
  Menu.setApplicationMenu(null);
  win.webContents.openDevTools();
  win.loadFile('./src/ui/' + name + '.html');

  windows[name] = win;

  if (name === 'index') {
    win.on('closed', () => {
        app.quit();
    })
  } else {
    win.on('closed', () => {
      delete windows[name];
    })
  }
}

function safeSend(win, channel, ...args) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, ...args);
  }
}

app.on('ready', () => {
  // Инициализация игры и запуск периодических обновлений
  gameState.init().then(() => {
  createWindow('index');
    setInterval(() => {
      gameState.update();
      safeSend(windows.playerBase, 'updateAll', {resources: gameState.prepareData('resources'), buildings: gameState.prepareData('buildings')});
      safeSend(windows.index, 'updateAll');
    }, 1000);
  });

  // === События на базе игрока ===

  ipcMain.on('callBuildingMethod', (event, buildingName, methodName, args) => {
    gameState.callBuildingMethod(buildingName, methodName, args);
    windows.playerBase.webContents.send('updateTarget', {
      buildingName: buildingName,
      [buildingName]: gameState.prepareData(buildingName),
      resources: gameState.prepareData('resources')
    });
  });

  ipcMain.on('constructBuilding', (event, buildingName) => {
    gameState.constructBuilding(buildingName);
    windows.playerBase.webContents.send('constructBuilding', {
      buildingName: buildingName,
      [buildingName]: gameState.prepareData(buildingName),
      resources: gameState.prepareData('resources')
    });
  });

  ipcMain.handle('fetchPlayerBaseData', async (event) => {
    return {
      items: gameState.prepareData('items'),
      resources: gameState.prepareData('resources'),
      buildings: gameState.prepareData('buildings')
    };
  });

  // === Глобальные события ===

  ipcMain.on('openWindow', (event, windowName) => {
    if (windows[windowName]) {
      windows[windowName].focus();
    } else {
      createWindow(windowName);
    }
  });

  ipcMain.on('saveAndQuit', () => {
    app.quit();
  });
});