var t=(await import("zod")).string().url("Must be a URL.").endsWith("/",{message:"URL must end with /."});export{t as default};
