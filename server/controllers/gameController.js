const axios = require('axios');
const User = require('../models/User');
const Game = require('../models/Game'); 


const getBalance = async (req, res) => {
  const { login } = req.body;
  
  const user = await User.findOne({ login });

  if (user) {
    
    const response = {
      status: 'success',
      error: '',
      login: login,
      balance: user.balance,
      currency: user.currency,
    };
    res.json(response);
  } else {
   
    res.json({ status: 'fail', error: 'user_not_found' });
  }
};

const writeBet = async (req, res) => {
  const {cmd, hall, key, login, sessionId, bet, win, tradeId, betInfo, gameId, matrix, date, WinLines } = req.body;
  try {
    const user = await User.findOne({ login });

    if (user) {
      let currentBalance = parseFloat(user.balance);
      const betAmount = parseFloat(bet);
      const winAmount = parseFloat(win);

      if (!isNaN(betAmount) && !isNaN(winAmount)) {
        if (currentBalance >= betAmount) {
          currentBalance = currentBalance - betAmount + winAmount;
          user.balance = currentBalance.toFixed(2).toString();
          await user.save();

          res.json({
            status: 'success',
            error: '',
            login: login,
            balance: user.balance,
            currency: user.currency,
          });
        } else {
          res.json({ status: 'fail', error: 'fail_balance' });
        }
      } else {
        res.json({ status: 'fail', error: 'invalid_bet_or_win' });
      }
    } else {
      res.json({ status: 'fail', error: 'user_not_found' });
    }
  } catch (error) {
    console.error('Error in writeBet:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
}

const getGamesList = async (req, res) => {
  const {} = req.body;

  const data = {
    hall: 3206118,
    key: '0012025',
    cmd: 'gamesList',
    cdnUrl:"",

  };

  try {
    const response = await axios.post('https://tbs2api.aslot.net/API/', data);
    const gamesList = response.data;

    res.json({ status: 'success', error: '', gamesList });
  } catch (error) {
    console.error('Error getting games list:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const openGame = async (req, res) => {
  const { login, gameId } = req.body;
  try {
    const user = await User.findOne({ login });
    if (!user) {
      return res.json({ status: 'fail', error: 'user_not_found' });
    }   

    if (parseFloat(user.balance) < 100) { console.log('Insufficient balance for user:', login, 'Balance:', user.balance);
      return res.json({ status: 'fail', error: 'insufficient_balance' });
    }
    const data = {
      cmd:"openGame",hall:"3206118",domain:"https://suerte24.bet",exitUrl:"https://suerte24.bet",
      language:"es",continent:"eur",key:"0012025",login:login,gameId:gameId,
      cdnUrl:"",
      demo:"0"
    };

    const response = await axios.post('https://tbs2api.aslot.net/API/openGame/', data);
    const gameData = response.data.content;
    res.json({ status: 'success', error: '', content: gameData });

  } catch (error) {
    console.log('Error opening game:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

// Incrementar el contador de clics para un juego
const incrementClicks = async (req, res) => {
  const { name } = req.body;
  try {
    const game = await Game.findOneAndUpdate(
      { name },
      { $inc: { clicks: 1 } },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', error: '', game });
  } catch (error) {
    console.error('Error incrementing clicks:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

// Obtener los 20 juegos más populares
const getPopularGames = async (req, res) => {
  try {
    const popularGames = await Game.find().sort({ clicks: -1 }).limit(15);
    res.json({ status: 'success', error: '', popularGames });
  } catch (error) {
    console.error('Error getting popular games:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};

const webhook = async (req, res) => {
  const { cmd } = req.body;

  if (!cmd) {
    return res.status(400).json({ status: 'fail', error: 'missing_command' });
  }

  try {
    if (cmd === 'getBalance') {
      await getBalance(req, res);
    } else if (cmd === 'writeBet') {
      await writeBet(req, res);
    } else {
      res.status(400).json({ status: 'fail', error: 'unknown_command' });
    }
  } catch (error) {
    console.error('Error in webhook:', error);
    res.status(500).json({ status: 'fail', error: 'internal_error' });
  }
};



module.exports = { 
  getBalance, 
  writeBet,
  getGamesList, 
  openGame,
  incrementClicks, 
  getPopularGames,
  webhook
};