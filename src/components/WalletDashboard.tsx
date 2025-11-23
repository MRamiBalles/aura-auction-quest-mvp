const handleMint = async () => {
  if (!account) {
    toast.error("Please connect your wallet first!");
    return;
  }

  try {
    toast.info("Initiating Mint Transaction...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Send a 0 MATIC transaction to self to simulate a contract interaction
    const tx = await signer.sendTransaction({
      to: account,
      value: ethers.parseEther("0.0"),
      data: "0x1234" // Dummy data to look like a function call
    });

    toast.success("Transaction Sent! Waiting for confirmation...");
    await tx.wait();
    toast.success(`Mint Successful! Hash: ${tx.hash.slice(0, 10)}...`);
    logError("Wallet:Mint", `Success: ${tx.hash}`);
        >
      <Wallet className="w-4 h-4 mr-2" />
    { account ? `${account.slice(0, 6)}...${account.slice(-4)}` : (isConnecting ? "Connecting..." : "Connect Wallet") }
        </Button >
      </header >

  {/* Balance Cards */ }
  < div className = "grid grid-cols-1 md:grid-cols-2 gap-4" >
        <Card className="bg-black/40 border-aura-purple/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Balance (MATIC)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{balance ? parseFloat(balance).toFixed(4) : '0.0000'}</div>
            <p className="text-xs text-aura-purple mt-1">
              {chainId === '0x13882' ? 'Polygon Amoy Testnet' : 'Network: ' + (chainId || 'Not Connected')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-aura-cyan/30 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Aura Tokens (Mock)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,250.00</div>
            <p className="text-xs text-aura-cyan mt-1">≈ $125.00 USD</p>
          </CardContent>
        </Card>
      </div >

  {/* Actions */ }
  < div className = "grid grid-cols-2 gap-4" >
        <Button className="bg-aura-purple hover:bg-aura-purple/80 text-white" onClick={handleMint}>
          <ArrowDownLeft className="w-4 h-4 mr-2" />
          Mint NFT
        </Button>
        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
          <ArrowUpRight className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
      </div >

  {/* Transaction History */ }
  < div >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-aura-cyan/20 text-aura-cyan">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Auction Reward</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <span className="text-aura-cyan font-medium">+500 AURA</span>
            </div>
          ))}
        </div>
      </div >
    </div >
  );
};

export default WalletDashboard;
