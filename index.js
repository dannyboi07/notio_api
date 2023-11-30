const app = require("./app");
const config = require("./config");

app.listen(config.PORT, () => {
	console.log(`Server started on port ${config.PORT}`);
});
