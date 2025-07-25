/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as MainRouteImport } from './routes/main'
import { Route as IndexRouteImport } from './routes/index'

const MainRoute = MainRouteImport.update({
  id: '/main',
  path: '/main',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/main': typeof MainRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/main': typeof MainRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/main': typeof MainRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/main'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/main'
  id: '__root__' | '/' | '/main'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  MainRoute: typeof MainRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/main': {
      id: '/main'
      path: '/main'
      fullPath: '/main'
      preLoaderRoute: typeof MainRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  MainRoute: MainRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
