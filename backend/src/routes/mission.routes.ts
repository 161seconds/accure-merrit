const express = require('express');
const router = express.Router();
const { getMissions } = require('../controllers/mission.controllers');

router.get('/', getMissions);

export default router;