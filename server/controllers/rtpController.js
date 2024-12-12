const axios = require('axios');

const changeHallConfig = async (req, res) => {
    try {
        const { ratio, language, rtp, egt_jp, bet_min, bet_max, igroDenom, denom, minLine, igBetLimit, igRiskLimit, slBetLimit, slRiskLimit, demoCredit} = req.body;

        const requestBody = {
            cmd: "changeHallConfig",
            hall: 3204960,
            key: '03261548',

            data: {
                hall: {
                    ratio: ratio || "3x4",
                    language: language || "AUTO",
                    rtp: rtp || "85",
                    egt_jp: egt_jp || "1",
                    bet_min: bet_min || "0.01",
                    bet_max: bet_max || "5000.00",
                    demoCredit: demoCredit || "100.00"
                },
                ig: {
                    igroDenom: igroDenom || "1.0",
                    denom: denom || "true",
                    minLine: minLine || "0",
                    betLimit: igBetLimit || "5000",
                    riskLimit: igRiskLimit || "1000"
                },
                slgames: {
                    betLimit: slBetLimit || "1000",
                    riskLimit: slRiskLimit || "300"
                }
            }
        };

        const response = await axios.post('https://tbs2api.aslot.net/API/', requestBody);

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error al cambiar la configuración del hall:', error.message);
        res.status(500).json({ error: 'Error al cambiar la configuración del hall' });
    }
};

const getConfig = async (req, res) => {
    try {
        const requestBody = {
            cmd:"changeHallConfig",
            hall:"3204960",
            key:"03261548"
            }

        const response = await axios.post('https://tbs2api.aslot.net/API/', requestBody);

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error al obtener configuración del hall:', error.message);
        res.status(500).json({ error: 'Error al obetener la configuración del hall' });
    }
};


module.exports = {
    changeHallConfig, getConfig
};