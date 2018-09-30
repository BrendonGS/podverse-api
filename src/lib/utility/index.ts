export { validatePassword } from 'lib/utility/validatePassword'

export const delimitQueryValues = (ctx, keys) => {
  let query = ctx.request.query
  for (const key of keys) {
    if (query[key]) {
      query[key] = query[key].split(',')
    }
  }
  ctx.request.query = query
  return ctx
}

export const chunkArray = (arr, chunkSize = 10) => {
  let i
  let j
  let chunks = []
  for (i = 0, j = arr.length; i < j; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize))
  }
  return chunks
}

export const offsetDate = (minutesOffset = 0) => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) + minutesOffset)
  return todayDate.toISOString().slice(0, 10)
}

// NOTE: I am manually offsetting by 5 hours since the server is in UTC but the
// Google Analytics data is in CST.
// This WILL cause a problem when DST happens.
export const lastHour = () => {
  let todayDate = new Date()
  todayDate.setMinutes((todayDate.getMinutes() - todayDate.getTimezoneOffset()) - 300 - 60)
  let lastHour = todayDate.toISOString().slice(11, 13)
  return parseInt(lastHour, 10)
}

export const convertSecondsToDaysText = (seconds) => {
  const totalDays = Math.round(parseInt(seconds) / 86400)
  return `${totalDays > 1 ? `${totalDays} days` : '24 hours'}`
}