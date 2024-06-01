import type { HttpContext } from '@adonisjs/core/http'
import { z } from 'zod'
import User from '#models/user'
import { Body, Params, Query } from '../decorators/Params.js'
import { GET, POST } from '../decorators/Decorator.js'

export const PostModel = z
  .object({
    id: z.number(),
    title: z.string().optional().nullable(),
  })
  .openapi('Post')

export const UserModel = z
  .object({
    id: z.number(),
    fullName: z.string().optional().nullable(),
    posts: PostModel.array().optional(),
  })
  .nullable()
  .openapi('User')

export const UserParam = z.object({
  id: z.string(),
})
export const UserQvery = z.object({
  q: z.string(),
})

export const UserInput = z.object({
  fullName: z.string(),
  email: z.string(),
  password: z.string(),
})

export const UsersReponse = UserModel.array()

export default class UsersController {
  @GET('/users', UsersReponse)
  async index({ request }: HttpContext) {
    return User.query().preload('posts')
  }

  @GET('/users/:id', UserModel)
  async user(
    @Query(UserQvery) kvery: z.infer<typeof UserParam>,
    @Params(UserParam) params: z.infer<typeof UserParam>
  ) {
    const user = await User.query().preload('posts')
    return user
  }

  @POST('/users/', UserModel)
  async creatUser(@Body(UserInput) payload: z.infer<typeof UserInput>) {
    const user = await User.create(payload)
    return user
  }
}
