import Groq from "groq-sdk"
//import { Error } from "mongoose"

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

// 🚨👉 ALERT: Read message below! 👈🚨
// Never commit your real API key to a repository, and never deploy
// this project with the key hardcoded here. Anyone can open dev tools
// and read it straight out of the bundled JS. That's what
// dangerouslyAllowBrowser is warning you about below — it's not a
// suggestion, it's Groq telling you this key WILL be visible client-side.
// For a portfolio project that's an accepted tradeoff (it's how Scrimba's
// own Chef Claude project works too), but keep the key in an environment
// variable — never typed directly into this file — so it's at least not
// sitting in your git history.

// Vite only exposes env vars prefixed with VITE_ to the browser bundle.
// process.env.X (what Scrimba's own hosted environment supports) does NOT
// work in a plain Vite + Vercel setup — you must use import.meta.env.
const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
})

export async function getRecipeFromChefClaude(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ")

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            max_tokens: 1024,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
            ],
        })
        const content = completion.choices[0]?.message?.content
        if(!content){
            throw new Error("CheF couldn't generate a recipe for those ingredients. Try adding a few more.")
        }

        return  content
    } catch (err) {
        console.error(err)
        throw new Error("Couldn't reach Chef Claude. Please try again.")
    }
}
