const _ = require('lodash')

const dummy = (blogs) => { // eslint-disable-line
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {

  if (Object.keys(blogs).length === 0) {
    return null
  }

  const mostLikes = Math.max(...blogs.map(blog => blog.likes))
  const mostLikedBlog = blogs.find(blog => blog.likes === mostLikes)

  const blog = {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes
  }

  return blog
}

const mostBlogs = (blogs) => {

  if (Object.keys(blogs).length === 0) {
    return null
  }

  const authors = _.mapValues(blogs, 'author')
  const authorWithMostBlogs = _.head(_(authors)
    .countBy()
    .entries()
    .maxBy(_.last))

  const blogCount = Object.values(authors).filter(author => author === authorWithMostBlogs).length

  const author = {
    author: authorWithMostBlogs,
    blogs: blogCount
  }

  return author
}

const mostLikes = (blogs) => {

  if (Object.keys(blogs).length === 0) {
    return null
  }

  const authors = _(blogs)
    .groupBy('author')
    .map((blogs, key) => ({
      'author': key,
      'likes': _.sumBy(blogs, 'likes')
    }))
    .value()

  const authorWithMostLikes = _.maxBy(authors, 'likes')

  return authorWithMostLikes
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}