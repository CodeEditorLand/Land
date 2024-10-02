import{localize as e}from"../../../../../nls.js";var o=(t=>(t.AutoReplies="terminal.integrated.autoReplies",t))(o||{});const i={"terminal.integrated.autoReplies":{markdownDescription:e("terminal.integrated.autoReplies",`A set of messages that, when encountered in the terminal, will be automatically responded to. Provided the message is specific enough, this can help automate away common responses.

Remarks:

- Use {0} to automatically respond to the terminate batch job prompt on Windows.
- The message includes escape sequences so the reply might not happen with styled text.
- Each reply can only happen once every second.
- Use {1} in the reply to mean the enter key.
- To unset a default key, set the value to null.
- Restart VS Code if new don't apply.`,'`"Terminate batch job (Y/N)": "Y\\r"`','`"\\r"`'),type:"object",additionalProperties:{oneOf:[{type:"string",description:e("terminal.integrated.autoReplies.reply","The reply to send to the process.")},{type:"null"}]},default:{}}};export{o as TerminalAutoRepliesSettingId,i as terminalAutoRepliesConfiguration};
