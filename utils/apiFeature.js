
class APIFeatures {
    constructor(query, queryString) {
        //query = Tour.find(), queryString = req.query
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            // The url: http://localhost:3000/api/v1/tours?sort=price,ratingsAverage
            // The query: { sort: 'price,ratingsAverage' }
            // Here we split the string by ',' and join it with ' ' to 
            // look like this: 'price ratingsAverage' because the query looks like this: { sort: 'price ratingsAverage' } 
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            // The url: http://localhost:3000/api/v1/tours?fields=name,price,ratingsAverage
            // The query: { fields: 'name,price,ratingsAverage' }
            // Here we split the string by ',' and join it with ' ' to 
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures