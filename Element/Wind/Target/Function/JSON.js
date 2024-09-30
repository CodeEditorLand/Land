var t=async(...[e,a])=>JSON.parse((await(await import("fs/promises")).readFile(`${a??"."}/${e}`,"utf-8")).toString());export{t as default};
