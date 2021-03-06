import { app, BrowserWindow, ipcMain, Notification } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

// require('electron-debug')({ showDevTools: true })

require('electron-debug')({ showDevTools: true })
app.setAppUserModelId('8562871')

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}


ipcMain.on('open-handle', (event, arg) => {
	if(handleWindow) {
		handleWindow.focus()
		 return
	}
	createHandle(arg)
})

ipcMain.on('not-certified', () => {
	app.quit()
})






let mainWindow
let liveWindow
let handleWindow

let screenHandle = {}

let full = false;




ipcMain.on('system-event', (event, arg) => {
	let dom = screenHandle[arg.win]
	if(arg.handle === 'small') {
		full = false
		dom.minimize()
	}
	if(arg.handle === 'close') {
		full = false
		if(dom) {
			dom.close()
		}
		
	}
	if(arg.handle === 'big') {
		full = !full
		dom.setFullScreen(full)
	}
})

ipcMain.on('push-state', (event, arg) => {
	liveWindow.webContents.send('current-state', arg)
})



const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`


const path = require('path')
// login窗口
function createWindow () {
  mainWindow = new BrowserWindow({
    height: 700,
    useContentSize: true,
    width: 380,
		frame: false ,
		maxWidth: 380,
		maxHeight: 700,
		resizable: false,
		transparent: true,
		webPreferences : {
			nodeIntegration: true
		}
  })
	// mainWindow.webContents.openDevTools();
	
	ipcMain.on('close-login', (event, arg) => {
		createLive()
		mainWindow.close()
		
	})
	const n = new Notification({
		title: 'ReadyBoy',
		subtitle: '登录提示',
		body: '输入账号密码登录外教直播系统',
		silent: false
		
	});

	n.show()
	
	screenHandle.login = mainWindow
	mainWindow.loadURL(winURL)
	
	// mainWindow.loadFile(path.resolve(__dirname, './index.html'))
  mainWindow.on('closed', () => {
    mainWindow = null
		screenHandle.login = null
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
			nodeIntegration: true
		}
	})
	
	
	screenHandle.live = liveWindow
	liveWindow.loadURL(winURL + '?myLive=1')
	liveWindow.on('closed', () => {
	  liveWindow = null
		if(handleWindow) {
			handleWindow.close()
		}
		screenHandle.live = null
	})
}


// 操作窗口

function createHandle(id) {
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
			nodeIntegration: true
		}
	})

	screenHandle.handle = handleWindow
	handleWindow.loadURL(winURL + `?myHandle=${id}`)
	handleWindow.focus()
	handleWindow.on('closed', () => {
	  handleWindow = null
	  screenHandle.handle = null
	})
	
	
}




app.on('ready', createWindow)

app.on('window-all-closed', () => {
	app.quit()
//   if (process.platform !== 'darwin') {
//     
//   }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


