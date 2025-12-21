class ApiFeatures {
  constructor(query, queryString) {
    this.query = query; //tour.find()
    this.queryString = queryString; // req query
  }

  filter() {
    // 1) Build the query
    const queryobj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryobj[el]);
    // Advanced filtering
    let querystr = JSON.stringify(queryobj);
    // \b stands for word boundary , it makes sure that we only replace the exact words gt, gte, lt, lte and not something like "gtx"
    // g stands for global (ie replace all the instances)
    querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    // Create the initial query (without awaiting it yet!)
    this.query = this.query.find(JSON.parse(querystr)); // find with no argu return all documents
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //ex price,duration > ['price', 'duration'] > "price duration"
      this.query = this.query.sort(sortBy); // sort by = "price duration"  which mongodb understand
    } else {
      this.query = this.query.sort('-createdAt'); // if no sorting sort by new created first
    }
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
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

module.exports = ApiFeatures;
