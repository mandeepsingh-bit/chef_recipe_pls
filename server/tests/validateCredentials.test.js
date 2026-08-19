import { describe, it, expect } from "vitest"
import { validateCredentials } from "../utils/validateCredentials.js"

describe("validateCredentials", () => {
    it("throws if username is missing", () => {
        expect(() => validateCredentials("", "password123")).toThrow()
    })

    it("throws if password is shorter than 6 characters", () => {
        expect(() => validateCredentials("mandeep", "abc")).toThrow()
    })

    it("does not throw for a valid username and password", () => {
        expect(() => validateCredentials("mandeep", "password123")).not.toThrow()
    })
})