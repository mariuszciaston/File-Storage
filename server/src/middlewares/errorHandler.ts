import type { ErrorRequestHandler } from 'express';

interface CustomError extends Error {
	statusCode?: number;
}

const errorHandler: ErrorRequestHandler = (err: CustomError, _req, res, _next) => {
	console.error(err);
	res.status(err.statusCode ?? 500).send(err.message || 'Internal Server Error');
};

export default errorHandler;
