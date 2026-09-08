import { Location } from "@opencode-ai/core/location"
import { ProjectCopy } from "@opencode-ai/core/project/copy"
import { Git } from "@opencode-ai/core/git"
import { Effect } from "effect"
import { HttpApiBuilder, HttpApiSchema } from "effect/unstable/httpapi"
import { Api } from "../api"
import { ProjectCopyError } from "@opencode-ai/protocol/groups/project-copy"

export const ProjectCopyHandler = HttpApiBuilder.group(Api, "server.projectCopy", (handlers) =>
  Effect.succeed(
    handlers
      .handle("projectCopy.create", (ctx) =>
        Effect.gen(function* () {
          const copies = yield* ProjectCopy.Service
          const location = yield* Location.Service
          return yield* badRequest(
            copies.create({
              ...ctx.payload,
              projectID: ctx.params.projectID,
              sourceDirectory: location.project.directory,
            }),
          )
        }),
      )
      .handle("projectCopy.remove", (ctx) =>
        ProjectCopy.Service.use((copies) =>
          badRequest(copies.remove({ ...ctx.payload, projectID: ctx.params.projectID })).pipe(
            Effect.as(HttpApiSchema.NoContent.make()),
          ),
        ),
      )
      .handle("projectCopy.refresh", (ctx) =>
        ProjectCopy.Service.use((copies) =>
          badRequest(copies.refresh({ projectID: ctx.params.projectID })).pipe(
            Effect.as(HttpApiSchema.NoContent.make()),
          ),
        ),
      ),
  ),
)

function badRequest<A, R>(effect: Effect.Effect<A, ProjectCopy.Error, R>) {
  return effect.pipe(
    Effect.mapError(
      (error) =>
        new ProjectCopyError({
          name: "ProjectCopyError",
          data: {
            message: message(error),
            forceRequired: error instanceof Git.WorktreeError ? error.forceRequired : undefined,
          },
        }),
    ),
  )
}

export function message(error: ProjectCopy.Error) {
  let result: string
  switch (error._tag) {
    case "ProjectCopy.SourceDirectoryNotFoundError":
      result = `Project copy source not found: ${error.directory}`
      break
    case "ProjectCopy.DestinationExistsError":
      result = `Project copy destination already exists: ${error.directory}`
      break
    case "ProjectCopy.DirectoryUnavailableError":
      result = `Project copy directory unavailable: ${error.directory}`
      break
    case "ProjectCopy.InvalidDirectoryError":
      result = `Invalid project copy directory: ${error.directory}`
      break
    case "ProjectCopy.StrategyUnavailableError":
      result = `Project copy strategy unavailable: ${error.strategy}`
      break
    default:
      result = error.message
  }
  return result
}
