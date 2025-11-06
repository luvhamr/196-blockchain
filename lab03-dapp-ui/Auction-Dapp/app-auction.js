// ===================== DEV banner =====================
console.log("auction app.js BUILD (ganache-only)", Date.now());

// ===================== Config =====================
const RPC_HTTP = "http://127.0.0.1:8545";                 // ganache-cli RPC
const EXPECT_CHAIN_ID = 1337;                             // match ganache --chain.chainId
const WEB3_URL = "https://esm.sh/web3@4?bundle&v=" + Date.now(); // dynamic ESM import
const DEFAULT_ADDRESS = "";                               // optional prefill, e.g., "0x..."

const ABI_PATHS = [
  "/build/contracts/SimpleAuction.json",                  // Truffle artifact
];

// ===================== State =====================
let Web3Ctor = null;
let web3;
let accounts = [];
let activeFrom = null;      // currently selected "from" account
let contract;
let contractABI = null;
let countdownTimer = null;
let bound = false;

// ===================== Utils =====================
const $  = (id)=>document.getElementById(id);
const log= (m)=>{ const el=$("log"); if (el) { el.textContent += m + "\n"; el.scrollTop = el.scrollHeight; } console.log("[Auction]", m); };
function weiToEth(wei){ return web3 ? web3.utils.fromWei(String(wei), "ether") : "-"; }
function ethToWei(eth){ return web3 ? web3.utils.toWei(String(eth), "ether") : "0"; }
function fmtUTC(sec){ if(!sec) return "-"; const d=new Date(Number(sec)*1000); return d.toISOString().replace("T"," ").slice(0,19)+" UTC"; }
function fmtDuration(ms){ if(ms<=0) return "Ended"; const s=Math.floor(ms/1000), d=Math.floor(s/86400), h=Math.floor((s%86400)/3600), m=Math.floor((s%3600)/60), r=s%60; return `${d}d ${h}h ${m}m ${r}s`; }

async function dynamicImportWeb3(){
  if (Web3Ctor) return Web3Ctor;
  log("Importing Web3 module…");
  const mod = await import(WEB3_URL);
  if(!mod?.Web3) throw new Error("Web3 ESM not available");
  Web3Ctor = mod.Web3;
  log("Web3 module loaded");
  return Web3Ctor;
}

async function fetchJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function loadABI() {
  if (contractABI) return contractABI;
  let lastErr;
  for (const p of ABI_PATHS) {
    try {
      const artifact = await fetchJSON(p);
      if (artifact?.abi) {
        contractABI = artifact.abi;
        log(`ABI loaded from ${p}`);
        return contractABI;
      }
    } catch (e) { lastErr = e; }
  }
  throw new Error(`Unable to load ABI from known paths. ${lastErr?.message || lastErr || ""}`);
}

async function supports1559(){
  const latest = await web3.eth.getBlock("latest");
  return latest && latest.baseFeePerGas != null;
}

function applyActiveAccount(addr) {
  activeFrom = addr || null;
  try { if (contract) contract.options.from = activeFrom || undefined; } catch (_) {}
}

function populateAccountSelect(list){
  const sel = $("accountSelect");
  if (!sel) { log('Missing <select id="accountSelect"> in HTML'); return; }
  sel.innerHTML = "";
  for (const a of list) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    sel.appendChild(opt);
  }
}

function setActiveAccountFromUI(){
  const sel = $("accountSelect");
  const chosen = sel?.value || accounts[0];
  applyActiveAccount(chosen);
}

// ===================== RPC =====================
async function initRPC(){
  try{
    log(`Connecting to Ganache RPC at ${RPC_HTTP} ...`);
    const Web3 = await dynamicImportWeb3();

    // In web3@4 you can pass a URL string directly
    web3 = new Web3(RPC_HTTP);

    // Accounts (ganache provides unlocked accounts)
    accounts = await web3.eth.getAccounts();
    if (!accounts?.length) throw new Error("No accounts from Ganache. Is it running?");

    // Network / chain id
    const chainId = await web3.eth.getChainId();
    const expected = BigInt(EXPECT_CHAIN_ID);    // normalize your expected value

    if ($("network")) $("network").textContent = chainId.toString();
    if (EXPECT_CHAIN_ID != null && chainId !== expected) {
      log(`Warning: expected chainId ${EXPECT_CHAIN_ID} but got ${chainId}`);
    }

    populateAccountSelect(accounts);
    setActiveAccountFromUI();

    log(`RPC connected. Accounts: ${accounts.length}`);
  }catch(e){
    console.error(e);
    log("RPC init error: " + (e.message || e));
  }
}

// ===================== Contract =====================
async function initContract(){
  try{
    if(!web3){ log("Init RPC first"); return; }
    const address = ($("contractAddress")?.value||"").trim() || DEFAULT_ADDRESS;
    if(!address || !address.startsWith("0x")){ log("Enter a valid 0x address"); return; }

    const abi = await loadABI();

    // Clear previous instance
    contract = new web3.eth.Contract(abi, address);
    applyActiveAccount(activeFrom);

    if ($("contractStatus")) $("contractStatus").textContent = `Loaded at ${address}`;
    log("Contract initialized at " + address);

    await refreshState();
  }catch(e){
    log("Init error: " + (e.message || e));
  }
}

function startCountdown(endTs){
  if(countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(()=>{
    const now = Math.floor(Date.now()/1000);
    const ms  = (endTs - now) * 1000;
    if ($("timeLeft")) $("timeLeft").textContent = fmtDuration(ms);
    if(ms<=0) clearInterval(countdownTimer);
  }, 1000);
}

async function refreshState(){
  try{
    if(!contract){ log("Load contract first"); return; }
    const [hbWei, hbr, endTs, bene] = await Promise.all([
      contract.methods.highestBid().call(),
      contract.methods.highestBidder().call(),
      contract.methods.auctionEndTime().call(),
      contract.methods.beneficiary().call()
    ]);
    if ($("highestBid"))    $("highestBid").textContent    = `${weiToEth(hbWei)} ETH`;
    if ($("highestBidder")) $("highestBidder").textContent = hbr || "-";
    if ($("endTime"))       $("endTime").textContent       = fmtUTC(endTs);
    if ($("beneficiary"))   $("beneficiary").textContent   = bene || "-";
    if (Number(endTs)>0) startCountdown(Number(endTs));
    log("State refreshed");
  }catch(e){
    log("Refresh error: " + (e.message || e));
  }
}

// ===================== Actions =====================
async function placeBid(){
  try{
    if(!contract){ log("Load contract first"); return; }
    setActiveAccountFromUI();
    if (!activeFrom) { log("Choose an account first."); return; }

    const btn = $("bidBtn"); if(btn) btn.disabled = true;
    const eth = Number(($("bidEth")?.value||"").trim());
    if(!Number.isFinite(eth) || eth<=0){ log("Enter a positive bid (ETH)"); if(btn) btn.disabled=false; return; }

    const value = ethToWei(eth);
    log(`Sending bid from ${activeFrom}: ${eth} ETH …`);

    const gas = await contract.methods.bid().estimateGas({ from: activeFrom, value });
    const opts = { from: activeFrom, value, gas };

    if(!(await supports1559())){
      opts.gasPrice = await web3.eth.getGasPrice(); // legacy fallback
      log(`Legacy tx (gasPrice=${opts.gasPrice})`);
    } else {
      // leave EIP-1559 fees to provider defaults
    }

    const tx = await contract.methods.bid().send(opts);
    log("Bid tx: " + tx.transactionHash);
    $("bidEth").value = "";
    await refreshState();
  }catch(e){
    log("Bid error: " + (e.message || e));
  }finally{
    const btn = $("bidBtn"); if(btn) btn.disabled = false;
  }
}

async function withdrawFunds(){
  try{
    if(!contract){ log("Load contract first"); return; }
    setActiveAccountFromUI();
    if (!activeFrom) { log("Choose an account first."); return; }

    log(`Withdrawing pending returns from ${activeFrom}…`);
    const gas = await contract.methods.withdraw().estimateGas({ from: activeFrom });
    const opts = { from: activeFrom, gas };
    if(!(await supports1559())) opts.gasPrice = await web3.eth.getGasPrice();

    const tx = await contract.methods.withdraw().send(opts);
    log("Withdraw tx: " + tx.transactionHash);
    await refreshState();
  }catch(e){
    log("Withdraw error: " + (e.message || e));
  }
}

async function endAuction(){
  try{
    if(!contract){ log("Load contract first"); return; }
    setActiveAccountFromUI();
    if (!activeFrom) { log("Choose an account first."); return; }

    log(`Ending auction from ${activeFrom}…`);
    const gas = await contract.methods.auctionEnd().estimateGas({ from: activeFrom });
    const opts = { from: activeFrom, gas };
    if(!(await supports1559())) opts.gasPrice = await web3.eth.getGasPrice();

    const tx = await contract.methods.auctionEnd().send(opts);
    log("End tx: " + tx.transactionHash);
    await refreshState();
  }catch(e){
    log("End error: " + (e.message || e));
  }
}

// ===================== Wire UI =====================
document.addEventListener("DOMContentLoaded", ()=>{
  if (bound) return; bound = true;

  // Init Ganache RPC
  $("connectBtn")?.addEventListener("click", initRPC);

  // Account dropdown changes "from" address
  $("accountSelect")?.addEventListener("change", ()=> setActiveAccountFromUI());

  // Contract + actions
  $("initBtn")?.addEventListener("click", initContract);
  $("refreshBtn")?.addEventListener("click", refreshState);
  $("bidBtn")?.addEventListener("click", placeBid);
  $("withdrawBtn")?.addEventListener("click", withdrawFunds);
  $("endBtn")?.addEventListener("click", endAuction);

  // Optional: prefill contract address
  if (DEFAULT_ADDRESS && DEFAULT_ADDRESS.startsWith("0x")) {
    const inp = $("contractAddress");
    if (inp) inp.value = DEFAULT_ADDRESS;
  }

  log("Auction DApp ready — click Init RPC (Ganache), pick an account, then load the contract.");
});
