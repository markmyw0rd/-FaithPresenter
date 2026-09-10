module.exports = {
 packagerConfig: {asar:true, executableName:'FaithPresenter', icon:'assets/icon',
  ignore: [/^\/(?!dist(?:\/|$)|assets(?:\/|$)|node_modules(?:\/|$)|package\.json$).*/,/^\/src($|\/)/,/^\/tests($|\/)/,/^\/scripts($|\/)/,/^\/out($|\/)/,/^\/\.git($|\/)/,/^\/node_modules\/(react|react-dom|scheduler)($|\/)/],
  win32metadata:{CompanyName:'FaithPresenter',FileDescription:'FaithPresenter Desktop',ProductName:'FaithPresenter'}},
  makers:[{name:'@electron-forge/maker-squirrel',config:{name:'FaithPresenter',authors:'FaithPresenter',description:'Offline church presentation local service database',setupExe:'FaithPresenter-0.14.0-Setup.exe',setupIcon:'assets/icon.ico'}}]
};
