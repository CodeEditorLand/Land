const u=/("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;function c(n){return n.replace(u,function(r,i,t,o,e,p){if(o)return"";if(e){const s=e.length;return e[s-1]===`
`?e[s-2]==="\r"?`\r
`:`
`:""}else return p?r.substring(1):r})}function g(n){const r=c(n);try{return JSON.parse(r)}catch{const t=r.replace(/,\s*([}\]])/g,"$1");return JSON.parse(t)}}export{g as parse,c as stripComments};
