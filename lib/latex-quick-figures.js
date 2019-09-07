'use babel';

import { CompositeDisposable } from 'atom'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process';
export default {

  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'latex-quick-figures:compileallfig': () => this.compileallfig()
    }))
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'latex-quick-figures:fetch': () => this.fetch()
    }))
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'latex-quick-figures:makefigure': () => this.makefigure()
    }))
  },

  deactivate() {
    this.subscriptions.dispose()
  },


  compileallfig(){
    console.log('hi');
    let editor;
    if(editor = atom.workspace.getActiveTextEditor()){
      let filepath = editor.buffer.file.path;
      filepath = path.resolve(path.dirname(filepath),'./figures');
      fs.readdir(filepath, (err, files) => {
        files.forEach(file => {
          if(path.parse(file).ext=='.svg'){
          svgtolapdf(path.parse(file).name);
        }
        });
      });

    }
  },

  makefigure(){
    let editor;
    console.log('hi');
    if(editor = atom.workspace.getActiveTextEditor()){

      var point1 = editor.getCursorBufferPosition();
      console.log(point1);
      var name = editor.getTextInBufferRange([[point1.row,0],point1]);

      console.log(name[0]);
      var templateVariant=name[0];
      //InsertText with template

      filepath = __dirname+'/templates'+'/layoutData'+templateVariant+'.txt';

      fs.readFile(filepath, (err, data) => {
        if (err) throw err;
        editor.setTextInBufferRange([[point1.row,0],point1],'');
        text = data.toString();
        name = name.substr(1);
        editor.insertText(text.replace(/!/g,name));
        let editorpath = editor.buffer.file.path;
        editorpath = path.resolve(path.dirname(editorpath),'./figures/'+name+'.svg');

        copyFile( __dirname+'/templates/imageTemplate'+templateVariant+'.svg',editorpath);

        var exec = child_process.exec;
        var cmd = 'inkscape --file '+editorpath;

        exec(cmd,{cwd:'C:/Program Files/Inkscape'}, function(error, stdout, stderr) {
        });
        console.log(data.toString());
      })
      //copy template to rel directory with different name

      //openItem

      //

    }
  },


  fetch(){
    svgtolapdf('my-file');
  }

};

function svgtolapdf(svgname){
  let editor;
  if (editor = atom.workspace.getActiveTextEditor()) {
    let filepath = editor.buffer.file.path;
    filepath = path.resolve(path.dirname(filepath),'./figures/'+svgname);
    var exec = child_process.exec;
    //var cmd =
    var cmd = 'inkscape --export-area-page --export-dpi 300 --export-pdf '+filepath+'.pdf --export-latex '+filepath+'.svg'

    //var cmd = 'inkscape --export-area-page --export-dpi 300 --export-pdf C:/Users/Simo/Desktop/수학/Latex-Atom/my-file.pdf --export-latex C:/Users/Simo/Desktop/수학/Latex-Atom/my-file.svg';
    exec(cmd,{cwd:'C:/Program Files/Inkscape'}, function(error, stdout, stderr) {
    });
  }
}

// function copyFile(source, target) {
//
//   var rd = fs.createReadStream(source);
//   var wr = fs.createWriteStream(target);
//
// }
function copyFile(source, target) {
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  return new Promise(function(resolve, reject) {
    rd.on('error', reject);
    wr.on('error', reject);
    wr.on('finish', resolve);
    rd.pipe(wr);
  }).catch(function(error) {
    rd.destroy();
    wr.end();
    throw error;
  });
}
