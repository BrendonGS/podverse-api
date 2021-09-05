/* eslint-disable @typescript-eslint/no-unused-vars */

import { Podcast, User } from '~/entities'
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, Generated, Index,
  JoinTable, ManyToMany, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'

const shortid = require('shortid')
@Entity('podcastList')
export class PodcastList {

  @PrimaryColumn('varchar', {
    default: shortid.generate(),
    length: 14
  })
  id: string

  @Column()
  @Generated('increment')
  int_id: number

  @Column({ nullable: true })
  description?: string

  @Index()
  @Column({ default: false })
  isPublic: boolean

  @Column({ default: 0 })
  itemCount: number

  @Column('varchar', { array: true })
  itemsOrder: string[]

  @Index()
  @Column({ nullable: true })
  title?: string

  @ManyToMany(type => Podcast)
  @JoinTable()
  podcasts: Podcast[]

  @ManyToOne(type => User, user => user.podcastLists, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  owner: User

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @BeforeInsert()
  beforeInsert () {
    this.id = shortid.generate()
    this.itemsOrder = this.itemsOrder || []
  }

  @BeforeInsert()
  @BeforeUpdate()
  trimStrings () {
    if (this.description) {
      this.description = this.description.trim() === '' ? undefined : this.description.trim()
    }
    if (this.title) {
      this.title = this.title.trim() === '' ? undefined : this.title.trim()
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  setItemCount () {
    if (this.podcasts) {
      this.itemCount = this.podcasts.length
    }
  }
}
