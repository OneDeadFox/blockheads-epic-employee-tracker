const express = require(`express`);
const app = express();
const PORT = process.env.PORT || 3030;
const inquirer = require(`inquirer`);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(`public`));

const allRoutes = require('./controllers');
app.use(allRoutes);

app.listen(port, () => {
    console.log(`listenin on port ` + PORT);
});