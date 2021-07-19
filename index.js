const express = require('express');
const app = express();
const electron = require('electron');
const https = require('https');
const http = require('http');
const fs = require('fs');
const server = http.createServer(app);
const { Server } = require("socket.io");
const rimraf = require("rimraf");
const io = new Server(server);
const { exec } = require('child_process');
const cors = require('cors');

SortByName = (dir)=>{
	var inOrder  = []
	files = fs.readdirSync(dir, ()=>{})
	files.forEach((file)=>{if(fs.lstatSync(dir+file).isDirectory()){inOrder.push(file); return;}})
		inOrder.push("°°°°°")
	files.forEach((file)=>{if(!fs.lstatSync(dir+file).isDirectory() && inOrder.indexOf(file)==-1){inOrder.push(file); return;}})
	return inOrder
}

const PORT = process.env.PORT || 3000 ;
app.get('/',(req,res)=>{
	query = req.query
	if (query.login) res.sendFile(__dirname+"/.public/login.html")
	else if (query.config) res.sendFile(__dirname+"/.config/"+query.config)
	else if (query.script) res.sendFile(__dirname+"/.scripts/"+query.script)
	else if (query.app) res.sendFile(__dirname+"/filesystem/assets/apps/"+query.app+".html")
	else if (query.icon) res.sendFile(__dirname+"/filesystem/assets/icons/"+query.icon)
	else if (query.files) {
		filesystem = SortByName(query.files)
		res.send(filesystem)
	}
	else res.sendFile(__dirname+"/.public/index.html")
})
app.use(cors())
app.options('*', cors());
app.use(express.static("./.public/"))

io.on('connection', (socket) => {
	socket.on('app',(msg)=>{console.log(msg)})
	socket.on('saveFile',(msg)=>{
		var path = __dirname+"\\"+msg.path
		fs.writeFileSync(path,msg.data)
	})
	socket.on('fileChoiced',(msg)=>{io.emit("fileChoiced",msg)})
	socket.on('dirName',(msg)=>{io.emit('dirName',__dirname+"\\filesystem")})
	socket.on('readFile',(msg)=>{
		data = fs.readFileSync(msg).toString()
		socket.emit('fileRead',data)
		})
	socket.on('cmd',(msg)=>{
		var outMsg
		const ls = exec("cd filesystem && "+msg);
		ls.stdout.on('data', (data) => {outMsg = data});
		ls.stderr.on('data', (data) => {outMsg = data});
		ls.on('close', (code) => {io.emit('stdout',outMsg)});
	})
	socket.on('createFile',(msg)=>{
		fs.writeFileSync(__dirname+"\\"+msg,"")
	})
	socket.on('createFolder',(msg)=>{
		fs.mkdirSync(__dirname+"\\"+msg)
	})
	socket.on('deleteFile',(msg)=>{
		fs.unlinkSync(__dirname+"\\"+msg)
	})
	socket.on('deleteFolder',(msg)=>{
		rimraf.sync(__dirname+"\\"+msg)
	})
	socket.on('exit',(msg)=>{
		process.exit(0)
	})
  // console.log('a user connected'); 
});

server.listen(PORT, () => console.log(`FoxOS starts on port ${PORT} !`));

if(process.versions['electron']){
	function createWindow () {
		mainWindow = new electron.BrowserWindow({frame:false});
		mainWindow.setFullScreen(true);
		/*	mainWindow.setAlwaysOnTop(true); */
		/**
		DANGEREUX !
		mainWindow.on('close', (e) => {e.preventDefault()});
		*/
		mainWindow.on('closed', () => {mainWindow = null;});
		mainWindow.loadURL(`http://localhost:${PORT}/`);
	}
	electron.app.on('ready', createWindow);
	electron.app.on('window-all-closed', () => {if (process.platform !== 'darwin') {electron.app.quit();}});
	electron.app.on('browser-window-created',function(e,window) {window.setMenu(null);});
}