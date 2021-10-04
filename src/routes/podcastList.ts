import * as bodyParser from 'koa-bodyparser'
import * as Router from 'koa-router'
import { config } from '~/config'
import { createPodcastList, deletePodcastList, getPodcastList,
  getPodcastLists, updatePodcastList } from '~/controllers/podcastList'
import { emitRouterError } from '~/lib/errors'
// import { delimitQueryValues } from '~/lib/utility'
// import { addOrRemovePlaylistItem, createPlaylist, deletePlaylist, getPlaylist, getPlaylists,
//   getSubscribedPlaylists, toggleSubscribeToPlaylist, updatePlaylist } from '~/controllers/playlist'
import { addOrRemovePodcastListItem } from '~/controllers/podcastList'
import { jwtAuth } from '~/middleware/auth/jwtAuth'
import { parseNSFWHeader } from '~/middleware/parseNSFWHeader'
import { parseQueryPageOptions } from '~/middleware/parseQueryPageOptions'
import { validatePodcastListCreate } from '~/middleware/queryValidation/create'
import { validatePodcastListSearch } from '~/middleware/queryValidation/search'
import { validatePodcastListUpdate } from '~/middleware/queryValidation/update'
import { hasValidMembership } from '~/middleware/hasValidMembership'

const RateLimit = require('koa2-ratelimit').RateLimit
const { rateLimiterMaxOverride } = config

const router = new Router({ prefix: `${config.apiPrefix}${config.apiVersion}/podcast-list` })

// const delimitKeys = ['mediaRefs']

router.use(bodyParser())

// Search
router.get('/',
  (ctx, next) => parseQueryPageOptions(ctx, next, 'podcast-lists'),
  validatePodcastListSearch,
  parseNSFWHeader,
  async ctx => {
    try {
      const podcastLists = await getPodcastLists(ctx.state.query)

      ctx.body = podcastLists
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Search Subscribed Playlists
// router.get('/subscribed',
//   (ctx, next) => parseQueryPageOptions(ctx, next, 'playlists'),
//   validatePlaylistSearch,
//   jwtAuth,
//   async ctx => {
//     try {
//       ctx = delimitQueryValues(ctx, delimitKeys)

//       if (ctx.state.user && ctx.state.user.id) {
//         const playlists = await getSubscribedPlaylists(ctx.state.query, ctx.state.user.id)
//         ctx.body = playlists
//       } else {
//         throw new Error('You must be logged in to get your subscribed playlists.')
//       }
//     } catch (error) {
//       emitRouterError(error, ctx)
//     }
//   })

// Get 
router.get('/:id',
  parseNSFWHeader,
  async ctx => {
    try {
      const podcastList = await getPodcastList(ctx.params.id)

      ctx.body = podcastList
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Create
const createPodcastListLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 10,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'post/podcast-list'
})

router.post('/',
  validatePodcastListCreate,
  createPodcastListLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      body.owner = ctx.state.user.id

      const podcastList = await createPodcastList(body)
      ctx.body = podcastList
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Update
const updatePodcastListLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 20,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/podcast-list'
})

router.patch('/',
  validatePodcastListUpdate,
  updatePodcastListLimiter,
  jwtAuth,
  async ctx => {
    try {
      const body = ctx.request.body
      const podcastList = await updatePodcastList(body, ctx.state.user.id)
      ctx.body = podcastList
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Delete
router.delete('/:id',
  jwtAuth,
  async ctx => {
    try {
      await deletePodcastList(ctx.params.id, ctx.state.user.id)
      ctx.status = 200
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Add/remove mediaRef/episode to/from playlist
const addOrRemovePodcastListLimiter = RateLimit.middleware({
  interval: 1 * 60 * 1000,
  max:  rateLimiterMaxOverride || 30,
  message: `You're doing that too much. Please try again in a minute.`,
  prefixKey: 'patch/add-or-remove'
})

router.patch('/add-or-remove',
  addOrRemovePodcastListLimiter,
  jwtAuth,
  hasValidMembership,
  async ctx => {
    try {
      const body: any = ctx.request.body
      const { podcastId, podcastListId } = body

      const results = await addOrRemovePodcastListItem(podcastListId, podcastId, ctx.state.user.id)
      const updatedPodcastList = results[0] as any
      const actionTaken = results[1]
      ctx.body = {
        podcastListId: updatedPodcastList.id,
        podcastListItemCount: updatedPodcastList.itemCount,
        actionTaken
      }
    } catch (error) {
      emitRouterError(error, ctx)
    }
  })

// Toggle subscribe to playlist
// const toggleSubscribeLimiter = RateLimit.middleware({
//   interval: 1 * 60 * 1000,
//   max:  rateLimiterMaxOverride || 15,
//   message: `You're doing that too much. Please try again in a minute.`,
//   prefixKey: 'get/playlist/toggle-subscribe'
// })

// router.get('/toggle-subscribe/:id',
//   toggleSubscribeLimiter,
//   jwtAuth,
//   hasValidMembership,
//   async ctx => {
//     try {
//       const subscribedPlaylistIds = await toggleSubscribeToPlaylist(ctx.params.id, ctx.state.user.id)
//       ctx.body = subscribedPlaylistIds
//     } catch (error) {
//       emitRouterError(error, ctx)
//     }
//   })

export const podcastListRouter = router
