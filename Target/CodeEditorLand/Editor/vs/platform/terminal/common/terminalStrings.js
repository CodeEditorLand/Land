function t(r,n={}){let e="";return n.excludeLeadingNewLine||(e+=`\r
`),e+="\x1B[0m\x1B[7m * ",n.loudFormatting?e+="\x1B[0;104m":e+="\x1B[0m",e+=` ${r} \x1B[0m
\r`,e}export{t as formatMessageForTerminal};
