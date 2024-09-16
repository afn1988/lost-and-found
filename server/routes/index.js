/**
 * App routes definitions.
 */
'use strict';

let express = require('express');
let router = express.Router();

// To confirm setup only.
router.get('/', (req, res) => res.send('Hello world!'));

module.exports = router;
