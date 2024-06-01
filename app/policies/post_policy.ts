import User from '#models/user'
import Post from '#models/post'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

@inject()
export default class PostPolicy extends BasePolicy {
  edit(user: User, post: Post): AuthorizerResponse {
    return user.id === post.userId
  }
}
