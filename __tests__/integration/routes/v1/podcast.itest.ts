import * as chai from 'chai'
import chaiHttp = require('chai-http')
import { testUsers, v1Path } from '../../utils'
const { expect: chaiExpect } = chai
chai.use(chaiHttp)

describe('Podcast endpoints', () => {

  describe('get by id', () => {
    
    test('when a valid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);
          chaiExpect(res.body.id).to.equal('mN25xFjDG')
          chaiExpect(res.body.alwaysFullyParse).to.equal(false)
          chaiExpect(res.body.authorityId).to.equal(null)
          chaiExpect(res.body).to.have.property('description')
          chaiExpect(res.body.feedLastParseFailed).to.equal(false)
          chaiExpect(res.body).to.have.property('feedLastUpdated')
          chaiExpect(res.body.guid).to.equal(null)
          chaiExpect(res.body.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(res.body.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/SfjLyq3660/duncantrussellfamilyhour.jpg')
          chaiExpect(res.body.isExplicit).to.equal(true)
          chaiExpect(res.body.isPublic).to.equal(true)
          chaiExpect(res.body.language).to.equal('en-us')
          chaiExpect(res.body).to.have.property('lastEpisodePubDate')
          chaiExpect(res.body.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(res.body.linkUrl).to.equal('http://www.duncantrussell.com/')
          chaiExpect(res.body.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastWeekTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(res.body.shrunkImageUrl).to.equal(null)
          chaiExpect(res.body.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(res.body.title).to.equal('Duncan Trussell Family Hour')
          chaiExpect(res.body.type).to.equal('episodic')
          chaiExpect(res.body).to.have.property('createdAt')
          chaiExpect(res.body).to.have.property('updatedAt')


          const author = res.body.authors[0]
          chaiExpect(author.id).to.equal('uS56AylX')
          chaiExpect(author.name).to.equal('Duncan Trussell Family Hour')
          chaiExpect(author.slug).to.equal('duncantrussellfamilyhour')
          chaiExpect(author).to.have.property('createdAt')
          chaiExpect(author).to.have.property('updatedAt')

          const category = res.body.categories[0]
          chaiExpect(category.id).to.equal('SuCRgv5pdf')
          chaiExpect(category.fullPath).to.equal('Comedy')
          chaiExpect(category.slug).to.equal('comedy')
          chaiExpect(category.title).to.equal('Comedy')
          chaiExpect(category).to.have.property('createdAt')
          chaiExpect(category).to.have.property('updatedAt')

          const feedUrl = res.body.feedUrls[0]
          chaiExpect(feedUrl.id).to.equal('abHIMhblL')
          chaiExpect(feedUrl.isAuthority).to.equal(true)
          chaiExpect(feedUrl.url).to.equal('https://audioboom.com/channels/4954758.rss')
          chaiExpect(feedUrl).to.have.property('createdAt')
          chaiExpect(feedUrl).to.have.property('updatedAt')         

          done()
        })
    })

    test('when an invalid id is provided', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/mN25xfadfFjDG`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(404);
          chaiExpect(res.body.message).to.equal('Podcast not found')

          done()
        })
    })
  })

  describe('find by query', () => {
    test('top past week', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast?sort=top-past-week`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200);

          const podcasts = res.body[0]
          const podcast = podcasts[0]
          
          chaiExpect(podcast.id).to.equal('kS9ZnQNWlQc')
          chaiExpect(podcast).to.have.property('feedLastUpdated')
          chaiExpect(podcast.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast.imageUrl).to.equal('https://d1gtnbjwzey0wh.cloudfront.net/podcast-images/JbhIM2rFLFw/dancarlinshardcorehistory.jpg')
          chaiExpect(podcast.isExplicit).to.equal(false)
          chaiExpect(podcast).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast.lastEpisodeTitle).to.equal('Show 64 - Supernova in the East III')
          chaiExpect(podcast.linkUrl).to.equal('http://www.dancarlin.com')
          chaiExpect(podcast.pastAllTimeTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastHourTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastDayTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastWeekTotalUniquePageviews).to.equal(5)
          chaiExpect(podcast.pastMonthTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.pastYearTotalUniquePageviews).to.equal(1)
          chaiExpect(podcast.shrunkImageUrl).to.equal(null)
          chaiExpect(podcast.sortableTitle).to.equal('dan carlin\'s hardcore history')
          chaiExpect(podcast.title).to.equal('Dan Carlin\'s Hardcore History')
          chaiExpect(podcast).to.have.property('createdAt')

          done()
        })
    })
  })

  describe('toggle subscribe', () => {

    test('when the user is not logged in', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(401)

          done()
        })
    })
    
    test('when the user is logged in: unsubscribe from user', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "0RMk6UYGq",
            "kS9ZnQNWlQc",
            "mN25xFjDG",
            "yKyjZDxsB",
            "zRo1jwx67",
            "Yqft_RG8j",
            "GZsvTjDH0",
            "Q_QCTJbNR"
        ])

          done()
        })
    })

    test('when the user is logged in: subscribe to podcast', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/toggle-subscribe/XdbkHTiH9`)
        .set('Cookie', testUsers.premium.authCookie)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          chaiExpect(res.body).to.eql([
            "0RMk6UYGq",
            "kS9ZnQNWlQc",
            "mN25xFjDG",
            "yKyjZDxsB",
            "zRo1jwx67",
            "Yqft_RG8j",
            "GZsvTjDH0",
            "Q_QCTJbNR",
            "XdbkHTiH9"
        ])

          done()
        })
    })
  })

  describe('Metadata', () => {
    
    test('get metadata', async (done) => {
      chai.request(global.app)
        .get(`${v1Path}/podcast/metadata/?podcastId=mN25xFjDG,gyEGNwJud`)
        .end((err, res) => {
          chaiExpect(res).to.have.status(200)

          const podcast0 = res.body[0][0]
          const podcast1 = res.body[0][1]

          chaiExpect(podcast0.id).to.equal('mN25xFjDG')
          chaiExpect(podcast0).to.have.property('feedLastUpdated')
          chaiExpect(podcast0.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast0).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast0.lastEpisodeTitle).to.equal('378: David Nichtern')
          chaiExpect(podcast0.sortableTitle).to.equal('duncan trussell family hour')
          chaiExpect(podcast0.title).to.equal('Duncan Trussell Family Hour')


          chaiExpect(podcast1.id).to.equal('gyEGNwJud')
          chaiExpect(podcast1).to.have.property('feedLastUpdated')
          chaiExpect(podcast1.hideDynamicAdsWarning).to.equal(false)
          chaiExpect(podcast1).to.have.property('lastEpisodePubDate')
          chaiExpect(podcast1.lastEpisodeTitle).to.equal('Rob Gronkowski, This Is March, James Harden Pooped Himself, And Lebron Is Still Insane')
          chaiExpect(podcast1.sortableTitle).to.equal('pardon my take')
          chaiExpect(podcast1.title).to.equal('Pardon My Take')

          done()
        })
    })
  })

})