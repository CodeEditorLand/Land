import*as a from"os";import*as e from"path";import"../common/argv.js";const p=process.env.VSCODE_CWD||process.cwd();function P(o,s){const t=c(o,s),r=[t];return e.isAbsolute(t)||r.unshift(p),e.resolve(...r)}function c(o,s){process.env.VSCODE_DEV&&(s="code-oss-dev");const t=process.env.VSCODE_PORTABLE;if(t)return e.join(t,"user-data");let r=process.env.VSCODE_APPDATA;if(r)return e.join(r,s);const n=o["user-data-dir"];if(n)return n;switch(process.platform){case"win32":if(r=process.env.APPDATA,!r){const i=process.env.USERPROFILE;if(typeof i!="string")throw new Error("Windows: Unexpected undefined %USERPROFILE% environment variable");r=e.join(i,"AppData","Roaming")}break;case"darwin":r=e.join(a.homedir(),"Library","Application Support");break;case"linux":r=process.env.XDG_CONFIG_HOME||e.join(a.homedir(),".config");break;default:throw new Error("Platform not supported")}return e.join(r,s)}export{P as getUserDataPath};
