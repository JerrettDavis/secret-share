import startup from "./startup";

startup()
    .then(() => console.log('<APP> App startup completed'))
    .catch((e) => console.error('<APP> Error during app startup:', e));
