const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('identifying field of blogs = id', async () => {
  const response = await api.get('/api/blogs')
  const ids = response.body.map(b => b.id)
  expect(ids).toBeDefined()
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Testing if a blog can be added correctly',
    author: 'Joni Koskinen',
    url: 'www.test.fi',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).toContain('Testing if a blog can be added correctly')
})

test('if likes is not defined, its value will be set to 0', async () => {
  const newBlog = {
    title: 'Testing if likes will be set to 0',
    author: 'Joni Koskinen',
    url: 'www.likestest.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.pop().likes).toBe(0)
})

test('blog without title or url is not added', async () => {
  const newBlog = {
    author: 'Joni Koskinen',
    url: 'www.blogWithoutTitle.com',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

  const newBlog2 = {
    title: 'Blog without url',
    author: 'Joni Koskinen',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .send(newBlog2)
    .expect(400)

  const blogsAtEnd2 = await helper.blogsInDb()
  expect(blogsAtEnd2).toHaveLength(helper.initialBlogs.length)
})

afterAll(async () => {
  await mongoose.connection.close()
})