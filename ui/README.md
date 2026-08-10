# v4 Hook Address Miner UI Documentation

Welcome to the documentation for the v4 Hook Address Miner UI. This tool is designed to provide a seamless user interface for mining addresses using the v4 Hook protocol.

## Requirements

- **Node.js**: Ensure you have Node.js version `24.19.0` installed. You can manage your Node.js versions using [nvm](https://github.com/nvm-sh/nvm).
- **Yarn**: This project uses Yarn as the package manager. If you haven't installed Yarn yet, you can do so by running:
  ```bash
  npm install --global yarn
  ```

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/v4-hook-address-miner-ui.git
   cd v4-hook-address-miner-ui
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Build Wasm worker**:
   ```bash
   yarn build-wasm-worker
   ```

3. **Run the development server**:
  ```bash
  yarn dev
  ```

4. **Build the project**:
   ```bash
   yarn build
   ```

5. **Preview the production build**:
   ```bash
   yarn preview
   ```