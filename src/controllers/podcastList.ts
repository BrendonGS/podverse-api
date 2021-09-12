import { getRepository } from 'typeorm'
import { Podcast, PodcastList } from '~/entities'
import { validateClassOrThrow } from '~/lib/errors'
// import { getUserSubscribedPlaylistIds } from './user'
const createError = require('http-errors')

const createPodcastList = async (obj) => {
  const repository = getRepository(PodcastList)
  const podcastList = new PodcastList()
  const newPodcastList = Object.assign(podcastList, obj)

  await validateClassOrThrow(newPodcastList)

  await repository.save(newPodcastList)
  return newPodcastList
}
// update deletePlaylist on your own time 
// const deletePlaylist = async (id, loggedInUserId) => {
//   const repository = getRepository(Playlist)
//   const playlist = await repository.findOne({
//     where: {
//       id
//     },
//     relations: ['owner']
//   })

//   if (!playlist) {
//     throw new createError.NotFound('Playlist not found')
//   }

//   if (playlist.owner.id !== loggedInUserId) {
//     throw new createError.Unauthorized('Log in to delete this playlist')
//   }

//   const result = await repository.remove(playlist)
//   return result
// }

// const getPlaylist = async id => {
//   const relations = ['podcasts'
//     'owner'
//   ]
//   const repository = getRepository(Playlist)
//   const playlist = await repository.findOne({ id }, { relations })

//   if (!playlist) {
//     throw new createError.NotFound('Playlist not found')
//   }

//   if (!playlist.owner.isPublic) {
//     delete playlist.owner.name
//   }

//   return playlist
// }

// const getSubscribedPlaylists = async (query, loggedInUserId) => {
//   const subscribedPlaylistIds = await getUserSubscribedPlaylistIds(loggedInUserId)
//   query.playlistId = subscribedPlaylistIds.join(',')
//   return getPlaylists(query)
// }

const getPodcastLists = async (query) => {
  const repository = getRepository(PodcastList)
  if (query.podcastListId && query.podcastListId.split(',').length > 1) {
    query.id = query.podcastListId.split(',')
  } else if (query.podcastListId) {
    query.id = [query.podcastListId]
  } else {
    return []
  }
  const podcastLists = await repository
    .createQueryBuilder('podcastList')
    .select('podcastList.id')
    .addSelect('podcastList.description')
    .addSelect('podcastList.isPublic')
    .addSelect('podcastList.itemCount')
    .addSelect('podcastList.itemsOrder')
    .addSelect('podcastList.title')
    .addSelect('podcastList.createdAt')
    .addSelect('podcastList.updatedAt')
    .innerJoin('podcastList.owner', 'user')
    .addSelect('user.id')
    .addSelect('user.name')
    .where('podcastList.id IN (:...podcastListIds)', { podcastListIds: query.id })
    .orderBy('podcastList.title', 'ASC')
    .getMany()

  return podcastLists
}

// const updatePlaylist = async (obj, loggedInUserId) => {
//   const relations = [
//     'episodes', 'episodes.podcast',
//     'mediaRefs', 'mediaRefs.episode', 'mediaRefs.episode.podcast',
//     'owner'
//   ]
//   const repository = getRepository(Playlist)

//   const playlist = await repository.findOne({
//     where: {
//       id: obj.id
//     },
//     relations
//   })

//   if (!playlist) {
//     throw new createError.NotFound('Playlist not found')
//   }

//   if (playlist.owner.id !== loggedInUserId) {
//     throw new createError.Unauthorized('Log in to delete this playlist')
//   }

//   const newPlaylist = Object.assign(playlist, obj)

//   await validateClassOrThrow(newPlaylist)

//   await repository.save(newPlaylist)

//   return newPlaylist
// }

const addOrRemovePodcastListItem = async (podcastListId, podcastId, loggedInUserId) => {
  const relations = [
    'podcasts', 
    'owner'
  ]
  const repository = getRepository(PodcastList)
  const podcastList = await repository.findOne(
    {
      where: {
        id: podcastListId
      },
      relations
    }
  )

  if (!podcastList) {
    throw new createError.NotFound('PodcastList not found')
  }

  if (!loggedInUserId || podcastList.owner.id !== loggedInUserId) {
    throw new createError.Unauthorized('Log in to delete this podcastList')
  }

  const itemsOrder = podcastList.itemsOrder
  let actionTaken = 'removed'

  if (podcastId) {
    // If no podcasts match filter, add the podcast item.
    // Else, remove the podcast item.
    const filteredPodcasts = podcastList.podcasts.filter(x => x.id !== podcastId)

    if (filteredPodcasts.length === podcastList.podcasts.length) {
      const podcastRepository = getRepository(Podcast)
      const podcast = await podcastRepository.findOne({ id: podcastId })
      if (podcast) {
        podcastList.podcasts.push(podcast)
        actionTaken = 'added'
      } else {
        throw new createError.NotFound('Podcast not found')
      }
    } else {
      podcastList.podcasts = filteredPodcasts
    }

    podcastList.itemsOrder = itemsOrder.filter(x => x !== podcastId)
  } else {
    throw new createError.NotFound('Must provide a Podcast id')
  }

  await validateClassOrThrow(podcastList)

  const saved = await repository.save(podcastList)

  return [saved, actionTaken]
}

// const toggleSubscribeToPlaylist = async (playlistId, loggedInUserId) => {

//   if (!loggedInUserId) {
//     throw new createError.Unauthorized('Log in to subscribe to this playlist')
//   }

//   const playlist = await getPlaylist(playlistId)

//   if (playlist.owner.id === loggedInUserId) {
//     throw new createError.BadRequest('Cannot subscribe to your own playlist')
//   }

//   const repository = getRepository(User)
//   const user = await repository.findOne(
//     {
//       where: {
//         id: loggedInUserId
//       },
//       select: [
//         'id',
//         'subscribedPlaylistIds'
//       ]
//     }
//   )

//   if (!user) {
//     throw new createError.NotFound('User not found')
//   }

//   let subscribedPlaylistIds = user.subscribedPlaylistIds

//   // If no playlistIds match the filter, add the playlistId.
//   // Else, remove the playlistId.
//   const filteredPlaylists = user.subscribedPlaylistIds.filter(x => x !== playlistId)
//   if (filteredPlaylists.length === user.subscribedPlaylistIds.length) {
//     subscribedPlaylistIds.push(playlistId)
//   } else {
//     subscribedPlaylistIds = filteredPlaylists
//   }

//   await repository.update(loggedInUserId, { subscribedPlaylistIds })

//   return subscribedPlaylistIds
// }

export {
    addOrRemovePodcastListItem,
    createPodcastList,
//   deletePlaylist,
//   getPlaylist,
    getPodcastLists,
//   getSubscribedPlaylists,
//   toggleSubscribeToPlaylist,
//   updatePlaylist
}
