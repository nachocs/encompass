const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const fixtures = require('./fixtures.js');
const dbSetup = require('../data/restore');
// If you are getting 401 errors with these tests yo u may need to change
// the userCredentials variable. Go to the network tab of the dev tools in your
// browser and find the value of Cookie. Paste it in here
const userCredentials = 'loginSessionUser=superuser; EncAuth=test-admin-key';
const baseUrl = "/api/sections/";
const host = 'http://localhost:8088';
chai.use(chaiHttp);

/** GET **/
describe('/GET sections', () => {
  it('should get all sections', done => {
    chai.request(host)
    .get(baseUrl)
    .set('Cookie', userCredentials) // what to do about this?
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.have.all.keys('sections');
      expect(res.body.sections).to.be.a('array');
      expect(res.body.sections.length).to.be.above(0);
      done();
    });
  });
});

/** POST **/
describe('/POST section', () => {
  it('should post a new section', done => {
    chai.request(host)
    .post(baseUrl)
    .set('Cookie', userCredentials)
    .send(fixtures.section.validSection)
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      done();
    });
  });
});

/** PUT name**/
describe('/PUT update section name', () => {
  it('should change the section name to phils class', done => {
    let url = baseUrl + fixtures.section.validSection._id;
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({section: {name: 'phils class'}})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.name).to.eql('phils class');
      done();
    });
  });
});

/** Add teachers **/
describe('add teacher to section', () => {
  it('should add one teacher to the section', done => {
    let url = baseUrl + 'addTeacher/' + fixtures.section.validSection._id;
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({teacherId: '52964659e4bad7087700014c'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.teachers).to.contain('52964659e4bad7087700014c');
      done();
    });
  });
});

/** Remove teachers **/
describe('remove teacher from section', () => {
  let url = baseUrl + 'removeTeacher/' + fixtures.section.validSection._id;
  it('should return an empty array', done => {
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({teacherId: '52964659e4bad7087700014c'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.teachers).to.not.contain('52964659e4bad7087700014c');
      done();
    });
  });
});

describe('addStudent to section', () => {
  it('should add one student to the section', done => {
    let url = baseUrl + 'addStudent/' + fixtures.section.validSection._id;
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({studentName: 'bill'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.students).to.contain('bill');
      done();
    });
  });
});

/** Remove teachers **/
describe('remove student from section', () => {
  let url = baseUrl + 'removeStudent/' + fixtures.section.validSection._id;
  it('should return an empty array', done => {
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({studentName: 'bill'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.teachers).to.not.contain('52964659e4bad7087700014c');
      done();
    });
  });
});

describe('add problem to section', () => {
  it('should add one problem to the section', done => {
    let url = baseUrl + 'addProblem/' + fixtures.section.validSection._id;
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({problemId: '5b0d939baca0b80f78807cf5'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.problems).to.contain('5b0d939baca0b80f78807cf5');
      done();
    });
  });
});

/** Remove teachers **/
describe('remove problem from section', () => {
  let url = baseUrl + 'removeProblem/' + fixtures.section.validSection._id;
  it('should return an empty array', done => {
    chai.request(host)
    .put(url)
    .set('Cookie', userCredentials)
    .send({problemId: '5b0d939baca0b80f78807cf5'})
    .end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
      expect(res.body.section.problems).to.not.contain('5b0d939baca0b80f78807cf5');
      done();
    });
  });
});