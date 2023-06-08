import FA_PROXY_CONTRACT from "../abis/FederatedAttestationsProxy.json";
import FA_CONTRACT from "../abis/FederatedAttestations.json";
import REGISTRY_CONTRACT from "../abis/Registry.json";
import ESCROW_PROXY_CONTRACT from "../abis/EscrowProxy.json";
import ESCROW_CONTRACT from "../abis/Escrow.json";
import ODIS_PAYMENTS_CONTRACT from "../abis/OdisPayments.json";
import STABLE_TOKEN_CONTRACT from "../abis/StableToken.json";
import ACCOUNTS_CONTRACT from "../abis/Accounts.json";

export const ALFAJORES_RPC = process.env.ALFAJORES_RPC;
export const ALFAJORES_ACCOUNT = process.env.ALFAJORES_ACCOUNT;
export const ALFAJORES_ACCOUNT_PK =process.env.ALFAJORES_ACCOUNT_PK;
export const FA_PROXY_ADDRESS = process.env.FA_PROXY_ADDRESS;
export const ESCROW_PROXY_ADDRESS =process.env.ESCROW_PROXY_ADDRESS;
export const ODIS_PAYMENTS_PROXY_ADDRESS =process.env.ODIS_PAYMENTS_PROXY_ADDRESS;
export const ALFAJORES_CUSD_ADDRESS = process.env.ALFAJORES_CUSD_ADDRESS;
export const ACCOUNTS_PROXY_ADDRESS = process.env.ACCOUNTS_PROXY_ADDRESS;
export const DEK_PRIVATE_KEY = process.env.DEK_PRIVATE_KEY;
export const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;

export { FA_CONTRACT, FA_PROXY_CONTRACT, REGISTRY_CONTRACT, ESCROW_CONTRACT, ESCROW_PROXY_CONTRACT, ODIS_PAYMENTS_CONTRACT, STABLE_TOKEN_CONTRACT, ACCOUNTS_CONTRACT };
