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
  if (name === 'index') {
    win.on('close', () => {
        app.quit();
    })
  }
  return win;
}

app.on('ready', () => {
  gameState.init().then(() => {
    windows.index = createWindow('index');
  });

  ipcMain.on('ready', () => {
    function formData() {
      const preparedData = {};
      for (let i = 0; i < gameState.entitiesToUpdate.length; i++) {
        preparedData[gameState.entitiesToUpdate[i]] = gameState.prepareData(gameState.entitiesToUpdate[i]);
      }
      return preparedData;
    }
    windows.index.webContents.send('updateAll', formData());
    setInterval(() => {
      gameState.update();
      windows.index.webContents.send('updateAll', formData());
    }, 1000);
  });

  ipcMain.on('callBuildingMethod', (event, buildingName, methodName, args) => {
    gameState.callBuildingMethod(buildingName, methodName, args);
    windows.index.webContents.send('updateTarget', {
      buildingName: buildingName,
      data: gameState.prepareData(buildingName),
      resources: gameState.prepareData('resources')
    });
  });

  ipcMain.on('constructBuilding', (event, buildingName) => {
    gameState.constructBuilding(buildingName);
    windows.index.webContents.send('constructBuilding', {
      buildingName: buildingName,
      data: gameState.prepareData(buildingName),
      resources: gameState.prepareData('resources')
    });
  });

  ipcMain.handle('fetchItemsData', async (event) => {
    return gameState.items;
  });

  ipcMain.handle('fetchBuildingsData', async (event) => {
    const buildingsData = {};
    const buildingNames = Object.keys(gameState.buildings);
    for (let i = 0; i < buildingNames.length; i++) {
      buildingsData[buildingNames[i]] = gameState.prepareData(buildingNames[i]);
    }
    return buildingsData;
  });
});