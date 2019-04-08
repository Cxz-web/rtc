import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}


ipcMain.on('open-handle', (event, arg) => {
	if(handleWindow) {
		handleWindow.focus()
		return
	}
	createHandle()
})



let mainWindow
let liveWindow
let handleWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`



// login窗口
function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 380,
		frame: false ,
		maxWidth: 380,
		maxHeight: 700,
		resizable: false,
		transparent: true
  })
	// mainWindow.webContents.openDevTools();
	
	ipcMain.on('close-login', (event, arg) => {
	  console.log(arg) // prints "ping"
		createLive()
		mainWindow.close()
		
	})


  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}


// 视频窗口
function createLive() {
	liveWindow = new BrowserWindow({
	  height: 720,
	  useContentSize: true,
	  width: 1280,
		frame: false ,
		maxWidth: 1280,
		maxHeight: 720,
		resizable: false,
		transparent: true,
		webPreferences: {
			webSecurity: false
		}
	})
	
	liveWindow.loadURL(winURL + '?myLive=1')
	liveWindow.on('closed', () => {
	  liveWindow = null
		if(handleWindow) {
			handleWindow.close()
		}
	})
}


// 操作窗口

function createHandle() {
	handleWindow = new BrowserWindow({
	  height: 480,
	  useContentSize: true,
	  width: 720,
		frame: false ,
		maxWidth: 1280,
		maxHeight: 720,
		resizable: false,
		transparent: true,
		webPreferences: {
			webSecurity: false
		}
	})
	
	handleWindow.loadURL(winURL + '?myHandle=1')
	handleWindow.focus()
	handleWindow.on('closed', () => {
	  handleWindow = null
	})
	
	
}




app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
