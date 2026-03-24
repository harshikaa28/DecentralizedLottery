#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Address, Vec, Symbol};

#[contract]
pub struct LotteryContract;

#[contractimpl]
impl LotteryContract {

    // 🔹 Initialize contract storage
    pub fn init(env: Env) {
        let players: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&Symbol::short("PLAYERS"), &players);
    }

    // 🔹 Enter the lottery
    pub fn enter(env: Env, player: Address) {
        player.require_auth();

        let mut players: Vec<Address> = env
            .storage()
            .instance()
            .get(&Symbol::short("PLAYERS"))
            .unwrap();

        players.push_back(player);

        env.storage().instance().set(&Symbol::short("PLAYERS"), &players);
    }

    // 🔹 Pick a winner (pseudo-random)
    pub fn pick_winner(env: Env) -> Address {

        let players: Vec<Address> = env
            .storage()
            .instance()
            .get(&Symbol::short("PLAYERS"))
            .unwrap();

        let len = players.len();

        if len == 0 {
            panic!("No players in lottery");
        }

        // Pseudo randomness using ledger timestamp
        let rand = env.ledger().timestamp() as u32;
        let index = rand % len;

        let winner = players.get(index).unwrap();

        // ✅ Reset players list (correct Soroban way)
        let new_players: Vec<Address> = Vec::new(&env);
        env.storage().instance().set(&Symbol::short("PLAYERS"), &new_players);

        winner
    }

    // 🔹 View all players
    pub fn get_players(env: Env) -> Vec<Address> {
        env.storage()
            .instance()
            .get(&Symbol::short("PLAYERS"))
            .unwrap()
    }
}