const fs = require("fs")
const path = require("path")

const getAllFiles = function(dirPath, arrayOfFiles=[]) {
  files = fs.readdirSync(dirPath)
  files.forEach(function(file) {
	if(file == "node_modules") return;
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			if (arrayOfFiles.indexOf(path.join("./",dirPath, "/", file))==-1) arrayOfFiles.push(path.join("./",dirPath, "/", file))
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
		}
	else {arrayOfFiles.push(path.join("./",dirPath, "/", file))}
  })
  return arrayOfFiles
}
// console.log("File in directory","./",getAllFiles("./"))
module.exports = {getAllFiles}