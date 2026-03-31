const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
require('dotenv').config();

const { attachUser } = require('./middleware/authMiddleware');
const homeController = require('./controllers/homeController');
const authController = require('./controllers/authController');
const candidateController = require('./controllers/candidateController');
const employerController = require('./controllers/employerController');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(attachUser);

app.use('/', homeController);
app.use('/', authController);
app.use('/candidate', candidateController);
app.use('/employer', employerController);
app.use('/admin', adminController);

app.use((req, res) => {
  res.status(404).render('home/404', { title: '404' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
