const express = require('express');
const router = express.Router();
const { sendIndividualNotification,
        createUser, getEstructuraAdmins,
        getUsers, getAgents , getAdmins, getLogin,
        login, loginOffice, validateToken, sendNotification, getNotification, markNotificationsAsRead} = require('../controllers/userController');
const {webhook, getBalance, writeBet, getGamesList, openGame, incrementClicks, getPopularGames } = require('../controllers/gameController');

const { deposit, retiro, depositError, retiroError } = require('../controllers/modalController');
const { editUser, changePassword, changePermission, deleteUser, statusUser } = require('../controllers/modalActionController')
const {getTheMovements, getTheMovementsMonto, getUserByLogin, getMovimientosByDate, getSaldoTotalDia, getUserByRol} = require('../controllers/movsController')

const { getFinanzas, getFinanzasByUser, getBestFinanzasUser, getFinanzasAllUser, addFinanza } = require('../controllers/finanzasController')
const { changeHallConfig, getConfig } = require('../controllers/rtpController')
const { loadSuper } = require('../controllers/loadSuperController')

const redisCache = require('../cache');


const { getIo } = require('../Socket');

router.post('/webhook', webhook);


router.post('/settings', changeHallConfig)
router.get('/getsettings', getConfig)


router.post('/getFin', getFinanzas);
router.post('/addFin', addFinanza);
router.post('/getFinancesByUser', getFinanzasByUser);
router.post('/getFinancesAllUser', getFinanzasAllUser);
router.post('/getBestFinancesUser', getBestFinanzasUser);



router.post('/increment-clicks',incrementClicks);
router.get('/popular-games', getPopularGames);

router.post('/notifications', (req, res) => {
    const io = getIo();
    sendNotification(req, res, io);
  });

router.get('/getnotifications', (req, res) => {
  const io = getIo();
  getNotification(req, res, io);
});

router.post('/markNotificationsAsRead',
  (req, res) => {
    const io = getIo();
    markNotificationsAsRead(req, res, io);
  }); 

router.post('/sendnotifies', (req, res) => {
    const io = getIo();
    sendIndividualNotification(req, res, io);
  });

router.post('/getBalance', getBalance);
router.post('/writeBet', writeBet);

router.post('/createUser', createUser)

router.post('/getGamesList', getGamesList);
router.post('/openGame', openGame);

router.post('/getLogin', getLogin)
router.get('/getUsers', getUsers);
router.get('/getAgents', getAgents);
router.get('/getAdmins', getAdmins);

router.get('/getEstAdmins', redisCache.route(), getEstructuraAdmins);


router.post('/login', (req, res) => {
  const io = getIo();
  login(req, res, io);
});

router.post('/loginOffice', (req, res) => {
  const io = getIo();
  loginOffice(req, res, io);
});

router.post('/validateToken', validateToken);


router.post('/deposit', (req, res) => {
  const io = getIo();
  deposit(req, res, io);
});
router.post('/depositError', depositError);

router.post('/retiro', (req, res) => {
  const io = getIo();
  retiro(req, res, io);
});
router.post('/retiroError', retiroError);

router.post('/loadSuper', (req, res) => {
  const io = getIo();
  loadSuper(req, res, io);
})

router.post('/editUser', editUser);
router.post('/changePassword', changePassword);
router.post('/changePermission', changePermission);
router.post('/deleteUser', deleteUser)
router.post('/statusUser', statusUser)

router.post('/movimientos', getTheMovements);



module.exports = router;
