
require("babel-polyfill");

describe('Render Index - Page Load Test', () => {
  it('should test that Index Page is successfully rendered.".', async () => {

    const {app} = require('../index')
    const request = require('supertest')
    const response = await request(app).get('/')

    //console.log(response)
    expect(response.status).toBe(200)
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8")
    expect(response.text.indexOf('Linked LINE COMMON LOG SERVICE')).not.toBe(-1)
    expect(response.text.indexOf('Add')).not.toBe(-1)
    expect(response.text.indexOf('Check Integrity')).not.toBe(-1)
    expect(response.text.indexOf('Recalculate Nonces')).not.toBe(-1)

  }, 30000)
})
describe('Add Entry - Empty Message Test', () => {
  it('should test that Message Matching "Empty Message. Insert Message to add new line.".', async () => {

    const { mockRequest, mockResponse } = require('../utils/interceptor')
    const logValidator = require('../app/validators/logValidator')
    const validator = require('../utils/validator')

    let req = mockRequest();
    let res = mockResponse();

    req.body.message = '';

    await logValidator['add']()[0](req, res, () => { })
    await validator.validate(req, res, () => { })

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      {
        errors: [
          {
            "message": "Empty Message. Insert Message to add new line.",
          }
        ]
      })
  }, 30000)
})
describe('Add Entry - Not Empty Message Test', () => {
  it('should test that Message value Not Empty.', async () => {

    const { mockRequest, mockResponse } = require('../utils/interceptor')
    const logValidator = require('../app/validators/logValidator')
    const validator = require('../utils/validator')

    let req = mockRequest();
    let res = mockResponse();

    req.body.message = 'Not Empty';

    await logValidator['add']()[0](req, res, () => { })
    await validator.validate(req, res, () => { })

    expect(res.status).not.toHaveBeenCalledWith(422);
    expect(res.json).not.toBeCalledWith(expect.anything());
  }, 30000)
})
describe('Get Entries - First Entry, Success', () => {
  beforeAll(async () => {

    const mongoose = require('mongoose')

    await mongoose.connect(global.__MONGO_URI__, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      else {
        console.log('Memory DB Connected')
      }
    });
  })
  it('should test that inserts a new record in database', async () => {

    const model = require('../app/models/entry')

    const entry = new model()
    entry.message = 'hgfhh'
    entry.prev_hash = '0000000000000000000000000000000000000000000000000000000000000000'
    entry.hash = '00ceea0d8254c4051f895cb73714a202a6b6a52e7e9da1ea6d574d01e247fcc6'
    entry.nonce = '32972277082267792743495421949699515856'

    const saveEntry = await entry.save();

    expect(saveEntry._id).toBeDefined();
    expect(saveEntry.message).toBe(entry.message);
    expect(saveEntry.prev_hash).toBe(entry.prev_hash);
    expect(saveEntry.hash).toBe(entry.hash);
    expect(saveEntry.nonce).toBe(entry.nonce);

  }, 30000)
})
