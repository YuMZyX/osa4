const dummy = require('../utils/list_helper').dummy

test.skip('dummy returns one', () => {
  const blogs = []

  expect(dummy(blogs)).toBe(1)
})