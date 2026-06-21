import { skillRegistry } from './skills/SkillRegistry.js';
import { deepBookTradeSkill } from './skills/defi/DeepBookTrade.js';
import { cetusSwapSkill } from './skills/defi/CetusSwap.js';
import { defiBaseSkill } from './skills/defi/DeFiSkill.js';
import { nftSkill } from './skills/nft/NFTSkill.js';
import { deepBookLendSkill } from './skills/defi/lending/DeepBookLend.js';
import { cetusLendSkill } from './skills/defi/lending/CetusLend.js';
import { haedalSkill } from './skills/defi/HaedalSkill.js';
import { voloSkill } from './skills/defi/VoloSkill.js';
import { bucketSkill } from './skills/defi/BucketSkill.js';
import { bluefinSkill } from './skills/defi/BluefinSkill.js';
import { pythSkill } from './skills/PythSkill.js';
import { switchboardSkill } from './skills/SwitchboardSkill.js';
import { tradePortSkill } from './skills/nft/TradePortSkill.js';
import { eventTriggerSkill } from './skills/EventTriggerSkill.js';
import { wormholeSkill } from './skills/bridge/WormholeSkill.js';
import { suiBridgeSkill } from './skills/bridge/SuiBridgeSkill.js';
import { alphaFiSkill } from './skills/defi/AlphaFiSkill.js';

import { serviceRegistry } from './services/ServiceRegistry.js';
import { suiTxService } from './services/sui/SuiTxService.js';
import { suiQueryService } from './services/sui/SuiQueryService.js';
import { deepBookService } from './services/defi/DeepBookService.js';
import { cetusService } from './services/defi/CetusService.js';


import { integrationRegistry } from './integrations/IntegrationRegistry.js';
import { registerAllSkillsAsTools } from './tools/SkillTools.js';

// Trigger tool registrations (side effects from module imports)
import './tools/index.js';

export function bootstrapEngine() {
  // Register all skills
  skillRegistry.register(defiBaseSkill);
  skillRegistry.register(deepBookTradeSkill);
  skillRegistry.register(cetusSwapSkill);
  skillRegistry.register(deepBookLendSkill);
  skillRegistry.register(cetusLendSkill);
  skillRegistry.register(haedalSkill);
  skillRegistry.register(voloSkill);
  skillRegistry.register(bucketSkill);
  skillRegistry.register(bluefinSkill);
  skillRegistry.register(pythSkill);
  skillRegistry.register(switchboardSkill);
  skillRegistry.register(tradePortSkill);
  skillRegistry.register(eventTriggerSkill);
  skillRegistry.register(wormholeSkill);
  skillRegistry.register(suiBridgeSkill);
  skillRegistry.register(alphaFiSkill);
  skillRegistry.register(nftSkill);
  console.log(`✅ Registered ${skillRegistry.getAll().length} skills`);

  // Register skills as tools so AgentRunner can call them
  registerAllSkillsAsTools();

  // Register all services
  serviceRegistry.register(suiTxService);
  serviceRegistry.register(suiQueryService);
  serviceRegistry.register(deepBookService);
  serviceRegistry.register(cetusService);

  console.log(`✅ Registered ${serviceRegistry.getAll().length} services`);

  // Integrations are created per-config (factory pattern)
  console.log(`✅ Integration registry ready (${integrationRegistry.getAll().length} pre-configured)`);
}
