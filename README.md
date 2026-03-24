<img width="1908" height="1177" alt="Screenshot 2026-03-24 141318" src="https://github.com/user-attachments/assets/1e9cc40f-f786-4551-8636-7eb7ff876a1d" />
## 📌 Project Description

**Decentralized Lottery** is a fully on-chain lottery protocol deployed on Stellar using the Soroban smart-contract runtime.  
Players buy tickets by transferring a fixed amount of a Stellar asset directly to the contract. When the admin draws a winner, the contract selects a random participant from the pool, transfers the prize automatically, and closes the round — all without any trusted third party.

The contract is written in **Rust**, compiled to **WebAssembly**, and deployed to the Stellar Testnet.

---

## ⚙️ What It Does

| Step | Who | Action |
|------|-----|--------|
| 1 | Admin | Calls `initialize()` — sets token, ticket price, fee % |
| 2 | Admin | Calls `start_lottery()` — opens the round |
| 3 | Players | Call `buy_ticket()` — token transferred to contract |
| 4 | Admin | Calls `draw_winner()` — winner selected on-chain |
| 5 | Contract | Transfers prize to winner, fee to admin, closes round |

---

## ✨ Features

- **Fully on-chain** — all logic lives in a Soroban smart contract; no off-chain backend required  
- **Token-agnostic** — works with any Stellar Asset Contract (SAC) — XLM, USDC, or custom tokens  
- **Configurable ticket price** — admin sets the entry cost before each round  
- **Admin fee** — optional cut (0–30 %) taken from the prize pool; transparent and enforced by code  
- **Multi-round** — each `draw_winner` increments the round ID; history is preserved on-ledger  
- **Last winner tracking** — `get_last_winner()` returns the most recent winner's address  
- **Role-based access** — only the admin can start rounds, draw winners, or change the price  
- **Admin transfer** — ownership can be handed off via `transfer_admin()`  
- **View functions** — `is_active`, `get_prize_pool`, `get_participants`, `get_ticket_price`, `get_round_id`  
- **Test suite** — unit tests with mocked auth & token using `soroban-sdk testutils`

---

## 🗂️ Project Structure

```
decentralized-lottery/
├── Cargo.toml                          # Workspace manifest
└── contracts/
    └── lottery/
        ├── Cargo.toml                  # Crate manifest
        └── src/
            ├── lib.rs                  # Contract logic
            └── test.rs                 # Unit tests
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Rust | `>=1.74` |
| `wasm32-unknown-unknown` target | via `rustup` |
| Stellar CLI (`stellar`) | `>=20.x` |



📢 Deployed Contract Address : https://stellar.expert/explorer/testnet/contract/CA4TQRWL4CZJCWD6EL6NWBOY4QBCS62JHLL4P5X7I6FSKZLQDCVFJSHK



```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

---

### Build

```bash
stellar contract build
# Output: target/wasm32-unknown-unknown/release/decentralized_lottery.wasm
```

---

### Test

```bash
cargo test
```

---

### Deploy to Testnet

```bash
# 1. Create / fund a testnet identity
stellar keys generate --global alice --network testnet
stellar keys fund alice --network testnet

# 2. Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/decentralized_lottery.wasm \
  --source alice \
  --network testnet

# Returns your CONTRACT_ID — save it!

# 3. Initialize
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source alice \
  --network testnet \
  -- initialize \
  --admin <ALICE_ADDRESS> \
  --token <TOKEN_CONTRACT_ID> \
  --ticket_price 10000000 \
  --fee_percent 10
```

---

### Invoke Examples

```bash
# Start a round
stellar contract invoke --id <CONTRACT_ID> --source alice --network testnet \
  -- start_lottery --admin <ALICE_ADDRESS>

# Buy a ticket
stellar contract invoke --id <CONTRACT_ID> --source bob --network testnet \
  -- buy_ticket --participant <BOB_ADDRESS>

# Draw the winner
stellar contract invoke --id <CONTRACT_ID> --source alice --network testnet \
  -- draw_winner --admin <ALICE_ADDRESS>

# Check prize pool
stellar contract invoke --id <CONTRACT_ID> --network testnet \
  -- get_prize_pool
```

---

## 🔗 Deployed Smart Contract

| Network | Contract ID |
|---------|-------------|
| **Stellar Testnet** | [`CDXXX...TESTNET_CONTRACT_ID`](https://stellar.expert/explorer/testnet/contract/CDXXX...TESTNET_CONTRACT_ID) |

> **Note:** Replace the placeholder above with your actual contract ID after running `stellar contract deploy`.  
> View live contract state & transactions on [Stellar Expert — Testnet](https://stellar.expert/explorer/testnet).

---

## 🔐 Security Notes

- **Randomness:** The current implementation derives entropy from `ledger.timestamp ^ ledger.sequence`.  
  This is suitable for low-stakes testnet demos. For production, integrate a **Verifiable Random Function (VRF)** or a decentralized oracle.
- **Admin key custody:** Protect the admin key; it controls `start_lottery` and `draw_winner`.  
  Consider a multisig or DAO governance module for production.
- **Audit:** This contract has not been audited. Use at your own risk on mainnet.

---

## 📄 License

MIT © 2024
