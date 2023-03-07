class APIFeatures {

	constructor(dbQuery, queryString) {
		this.dbQuery = dbQuery;
		this.queryString = queryString;
	};

	filter() {
		const queryObj = { ...this.queryString };
		const excludedFields = ["page", "sort", "limit", "fields"];
		excludedFields.forEach((field) => delete queryObj[field]);

		// 1b) Advanced filtering
		let queryStr = JSON.stringify(queryObj);
		let formattedQueryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      
		this.dbQuery = this.dbQuery.find(JSON.parse(formattedQueryStr));
      
		return this;
	};

	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			this.dbQuery = this.dbQuery.sort(sortBy);
		} else {
			// Sort by created at if no sort specified
			this.dbQuery = this.dbQuery.sort("-createdAt");
		};

		return this;
	};

	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(",").join(" ");
			this.dbQuery = this.dbQuery.select(fields);
		} else {
			this.dbQuery = this.dbQuery.select("-__v");
		};

		return this;
	};

	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 100;
		const skip = (page - 1) * limit;

		// page=2&limit=10, 1-10 = page 1,  11-20 = page 2
		this.dbQuery = this.dbQuery.skip(skip).limit(limit);

		return this;
	};
};

module.exports = APIFeatures;