const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Results = require('../models/result');
var authenticate = require('../authenticate');

const resultRouter = express.Router();
resultRouter.use(bodyParser.json());

// Methods for http://localhost:3000/results/ API end point
resultRouter.route('/')
.get((req,res,next) => {
    Results.find(req.query)
    .then((results) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(results);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    if (req.body != null) {
        req.body.student = req.user._id;
        Results.create(req.body)
        .then((result) => {
            Results.findById(result._id)
            .populate('student')
            .populate('exam')
            .then((result) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }
    else {
        err = new Error('Result information not found in request body');
        err.status = 404;
        return next(err);
    }
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /results');
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Results.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

// Methods for http://localhost:3000/results/:resultId API end point
resultRouter.route('/:resultId')
.get((req,res,next) => {
    Results.findById(req.params.resultId)
    .then((result) => {
        Results.findById(result._id)
        .populate('student')
        .populate('exam')
        .then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /results/${req.params.resultId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Results.findByIdAndUpdate(req.params.resultId, {
        $set: req.body
    }, { new: true })
    .then((result) => {
        Results.findById(result._id)
        .populate('student')
        .populate('exam')
        .then((result) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Results.findByIdAndRemove(req.params.resultId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = resultRouter;