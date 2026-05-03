import { type operations as motionNetOperations } from '@motion/motion-net-types/openapi'
import {
  type components,
  type operations as backendOperations,
} from '@motion/rpc-types/swagger'

export type CombinedOperations = backendOperations | motionNetOperations
export type OperationKeys = keyof backendOperations | keyof motionNetOperations

type Operation<T extends OperationKeys> = T extends keyof backendOperations
  ? backendOperations[T]
  : T extends keyof motionNetOperations
    ? motionNetOperations[T]
    : never

export type IsNever<T> = [T] extends [never] ? true : false

export type NeverToVoid<T> = IsNever<T> extends true ? void : T

export type Merge<A, B> =
  IsNever<A> extends true ? B : IsNever<B> extends true ? A : A & B

export type DTO<TName extends keyof components['schemas']> =
  components['schemas'][TName]

export type ControllerParamsOfType<
  T extends OperationKeys,
  TType extends 'path' | 'query',
> = 'parameters' extends keyof Operation<T>
  ? TType extends keyof Operation<T>['parameters']
    ? Operation<T>['parameters'][TType]
    : never
  : never

// prettier-ignore
export type ControllerParams<T extends OperationKeys> = 
  Merge<
    ControllerParamsOfType<T, 'path'> , 
    ControllerParamsOfType<T, 'query'>
  >

export type JsonContent<T> = T extends {
  readonly content: { readonly 'application/json': any }
}
  ? T['content']['application/json']
  : never

export type ControllerBody<T extends OperationKeys> =
  'requestBody' extends keyof Operation<T>
    ? JsonContent<Operation<T>['requestBody']>
    : never

export type ApiRequest<T extends OperationKeys> = NeverToVoid<
  Merge<ControllerParams<T>, ControllerBody<T>>
>
export type ApiResponse<T extends OperationKeys> = ControllerSuccessResponse<T>

export type ControllerSuccessResponse<T extends OperationKeys> =
  201 extends keyof Operation<T>['responses']
    ? JsonContent<Operation<T>['responses'][201]>
    : 200 extends keyof Operation<T>['responses']
      ? JsonContent<Operation<T>['responses'][200]>
      : 204 extends keyof Operation<T>['responses']
        ? void
        : never

/**
 * Type helper to extract the various types for the controller method
 */
export type RouteTypes<T extends OperationKeys> = {
  /**
   * The combined shape of the request.
   * This includes `path` params, `query` params and the `body`
   */
  request: ApiRequest<T>

  /**
   * The type for the response
   */
  response: ApiResponse<T>

  /**
   * Individual components that make up the `request`
   */
  params: {
    /**
     * The properties that get injected into the path
     */
    path: ControllerParamsOfType<T, 'path'>
    /**
     * The properties that get injected into the query string
     */
    query: ControllerParamsOfType<T, 'query'>
    /**
     * The body
     */
    body: ControllerBody<T>
  }
}
