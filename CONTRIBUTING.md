# Contributing to MockProxy

First off, thanks for taking the time to contribute!

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** to demonstrate the steps
* **Describe the behavior you observed** and what you expected

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description** of the suggested enhancement
* **Explain why this enhancement would be useful**

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow the TypeScript style guidelines
* End files with a newline

## Development Setup

1. Clone the repo
2. Install Bun: `curl -fsSL https://bun.sh/install | bash`
3. Install dependencies: `bun install`
4. Run tests: `bun test`
5. Start the proxy: `bun run src/index.ts --help`

## Project Structure

```
mockproxy/
├── src/
│   ├── index.ts      # CLI entry point
│   ├── proxy.ts      # Hono HTTP proxy
│   ├── cache.ts      # SQLite caching
│   ├── config.ts     # CLI parsing + pricing
│   ├── tokenizer.ts  # Token counting
│   ├── nvidia.ts     # NVIDIA NIM integration
│   └── ollama.ts     # Ollama integration
├── tests/
├── examples/
└── pricing.json     # Model pricing data
```

## Style Guidelines

* Use TypeScript for all code
* Use Bun APIs where possible (e.g., `bun:sqlite`)
* Keep functions small and focused
* Add comments for complex logic
* Write tests for new features

## License

By contributing, you agree that your contributions will be licensed under the MIT License.