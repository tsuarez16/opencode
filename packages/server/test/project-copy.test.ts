import { describe, expect, test } from "bun:test"
import { AbsolutePath } from "@opencode-ai/core/schema"
import { Git } from "@opencode-ai/core/git"
import { ProjectCopy } from "@opencode-ai/core/project/copy"
import { message } from "../src/handlers/project-copy"

const dir = AbsolutePath.make("/tmp/project")
const strategy = ProjectCopy.StrategyID.make("git_worktree")

describe("message", () => {
  test("maps SourceDirectoryNotFoundError", () => {
    expect(message(new ProjectCopy.SourceDirectoryNotFoundError({ directory: dir }))).toBe(
      `Project copy source not found: ${dir}`,
    )
  })

  test("maps DestinationExistsError", () => {
    expect(message(new ProjectCopy.DestinationExistsError({ directory: dir }))).toBe(
      `Project copy destination already exists: ${dir}`,
    )
  })

  test("maps DirectoryUnavailableError", () => {
    expect(message(new ProjectCopy.DirectoryUnavailableError({ directory: dir }))).toBe(
      `Project copy directory unavailable: ${dir}`,
    )
  })

  test("maps InvalidDirectoryError", () => {
    expect(message(new ProjectCopy.InvalidDirectoryError({ directory: dir }))).toBe(
      `Invalid project copy directory: ${dir}`,
    )
  })

  test("maps StrategyUnavailableError", () => {
    expect(message(new ProjectCopy.StrategyUnavailableError({ strategy }))).toBe(
      `Project copy strategy unavailable: ${strategy}`,
    )
  })

  test("falls back to the error's own message for unmapped errors", () => {
    const error = new Git.WorktreeError({ operation: "create", message: "disk full", directory: dir })
    expect(message(error)).toBe("disk full")
  })
})
