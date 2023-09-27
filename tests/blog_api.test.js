const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {

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

  describe('addition of a new blog', () => {

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
  })

  describe('deletion of a blog', () => {

    test('succeeds with status 204 is id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

      const titles = blogsAtEnd.map(b => b.title)
      expect(titles).not.toContain(blogToDelete.title)
    })

    test('fails with status 400 if id is invalid', async () => {
      const invalidId = 'gregerger45645fdgfd'

      await api
        .delete(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('changing attributes of a blog', () => {

    test('changing likes succeeds with status 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      blogToUpdate.likes = 500

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const likes = blogsAtEnd.map(b => b.likes)
      expect(likes).toContain(500)
    })

    test('changing title succeeds with status 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      blogToUpdate.title = 'Testing PUT with async/await'

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(b => b.title)
      expect(titles).toContain('Testing PUT with async/await')
    })

    test('fails with status 400 if id is invalid', async () => {
      const invalidId = 'jjiofew83478900fweifds'
      await api
        .put(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})