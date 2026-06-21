module m2a::governance;

use sui::tx_context::TxContext;
use std::string::String;

use m2a::m2a;
use m2a::policy::{Self as policy, AgentPolicy};

/// Only the policy owner can call governance functions.

const ENotPolicyOwner: u64 = 0;

/// Deactivate (freeze) an agent. Only the policy owner may call this.
entry fun freeze_agent(
    policy: &mut AgentPolicy,
    ctx: &TxContext,
) {
    assert!(policy.is_owner(ctx.sender()), ENotPolicyOwner);
    let agent_id = policy::agent_id(policy);
    policy::deactivate(policy);
    m2a::emit_agent_frozen(agent_id);
}

/// Update policy fields. Only the policy owner may call this.
entry fun update_policy(
    policy: &mut AgentPolicy,
    policy_version: u64,
    new_budget_cap: u64,
    new_expiry_epoch: u64,
    new_protocols: vector<String>,
    new_tools: vector<String>,
    ctx: &TxContext,
) {
    assert!(policy.is_owner(ctx.sender()), ENotPolicyOwner);
    let agent_id = policy::agent_id(policy);
    policy::set_budget_cap(policy, new_budget_cap);
    policy::set_expiry_epoch(policy, new_expiry_epoch);
    policy::set_protocol_whitelist(policy, new_protocols);
    policy::set_tool_whitelist(policy, new_tools);
    m2a::emit_policy_updated(agent_id, policy_version);
}
