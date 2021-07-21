`use strict`
const catchAsync = require("./../utils/catch-async");
const ServerError = require("./../utils/app-error");
const APIFeatures = require("./../utils/api-features");


exports.getAll = (Model) =>
	catchAsync(async (req, res, next) => {
		// Allow for nested GET reviews on tour
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };

		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const doc = await features.query;

		// Send response
		res.status(200).json({
			status: "success",
			requested_at: req.requestTime,
			results: doc.length,
			data: {
				data: doc,
			},
		});
	});


exports.getOne = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query = query.populate(popOptions);
		const doc = await query;

		if (!doc) {
			return next(new ServerError("No document found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			requested_at: req.requestTime,
			data: {
				data: doc,
			},
		});
	});


exports.deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new ServerError("No document found with that ID", 404));
		}

		res.status(204).json({
			status: "success",
			requested_at: req.requestTime,
			data: null,
		});
	});


exports.updateOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!doc) {
			return next(new ServerError("No document found with that ID", 404));
		}

		res.status(200).json({
			status: "success",
			requested_at: req.requestTime,
			data: {
				data: doc,
			},
		});
	});


exports.createOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);

		res.status(201).json({
			status: "success",
			requested_at: req.requestTime,
			data: {
				data: doc,
			},
		});
	});