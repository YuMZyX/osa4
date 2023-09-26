const reverse = require('../utils/for_testing').reverse

test.skip('reverse of a', () => {
  const result = reverse('a')

  expect(result).toBe('a')
})

test.skip('reverse of react', () => {
  const result = reverse('react')

  expect(result).toBe('tcaer')
})

test.skip('reverse of saippuakauppias', () => {
  const result = reverse('saippuakauppias')

  expect(result).toBe('saippuakauppias')
})