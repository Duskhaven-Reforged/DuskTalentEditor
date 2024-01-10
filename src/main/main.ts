/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import mysql from 'mysql2';
import { Pool } from 'mysql2/typings/mysql/lib/Pool';
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from 'electron-extension-installer';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let pool: Pool | null = null;
// let custompool: Pool | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('connect', (event, config) => {
  pool = mysql.createPool({
    ...config,
    database: 'acore_world',
  });

  pool.getConnection((error, connection) => {
    if (error) {
      console.error('Failed to connect to the database:', error);
      event.reply('connect', false);
    } else {
      console.log('CONNECTED');
      event.reply('connect', true);
    }
  });
});

ipcMain.on('query', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('query', null);
      } else {
        event.reply('query', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('query', null);
  }
});

ipcMain.on('updateQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('updateQuery', null);
      } else {
        event.reply('updateQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('updateQuery', null);
  }
});

ipcMain.on('deleteQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('deleteQuery', null);
      } else {
        event.reply('deleteQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('deleteQuery', null);
  }
});

ipcMain.on('endQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('endQuery', null);
      } else {
        event.reply('endQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('endQuery', null);
  }
});

ipcMain.on('ranksQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('ranksQuery', null);
      } else {
        event.reply('ranksQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('ranksQuery', null);
  }
});

ipcMain.on('ranksEndQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('ranksEndQuery', null);
      } else {
        event.reply('ranksEndQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('ranksEndQuery', null);
  }
});

ipcMain.on('nodeEndQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('nodeEndQuery', null);
      } else {
        event.reply('nodeEndQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('nodeEndQuery', null);
  }
});

ipcMain.on('preReqQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('preReqQuery', null);
      } else {
        event.reply('preReqQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('preReqQuery', null);
  }
});

ipcMain.on('preReqEndQuery', (event, query) => {
  if (pool) {
    pool.query(query, (error, results) => {
      if (error) {
        console.error('Failed to execute query:', error);
        event.reply('preReqEndQuery', null);
      } else {
        event.reply('preReqEndQuery', results);
      }
    });
  } else {
    console.error('Not connected to the database');
    event.reply('preReqEndQuery', null);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? './assets'
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111111',
      symbolColor: '#fff',
      height: 10,
    },
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await installExtension(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: {
        allowFileAccess: true,
      },
    });
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
