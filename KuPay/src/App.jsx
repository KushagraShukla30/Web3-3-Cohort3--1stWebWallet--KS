import { useEffect, useState, useSyncExternalStore } from 'react'
import { assertPrivate, ethers, HDNodeWallet } from 'ethers'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const App = () => {

  const [seedPhrase, setSeedPhrase] = useState('');
  const [wallets, setWallets] = useState([]);
  const [selectedWalletIndexes, setSelectWallet] = useState({});
  const [walletBalance, setWalletBalance] = useState();
  const [inTransactionForm, SetIstransactionForm] = useState(false);

  const generateSeedPhrase = () => {
    const mnemonic = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16));
    setSeedPhrase(mnemonic);
  };

  const createWalletFromSeed = () => {
    if(!seedPhrase){
      return;
    }
    const hdNode = ethers.HDNodeWallet.fromPhrase(seedPhrase, `m/44'/60'/0'/0/${wallets.length}`);

    const WalletWithID = {
      id : wallets.length + 1,
      address: hdNode.address,
      privateKey : hdNode.privateKey,
      publicKey : hdNode.publicKey,
      mnemonic : hdNode.mnemonic.phrase,
      path : hdNode.path,

    };


  setSelectWallet(hdNode);
  const newWallets = [...wallets, WalletWithID];
  setWallets(newWallets);
  setSelectWalletIndex(newWallets.length=1);
  SetIstransactionForm(false);


  fetchBalance(WalletWithID);
  };

  const handleCharge = (e) => {
    const selectedIndex = parseInt(e.target.value, 10);
    const selectedWallet = wallets[selectedIndex];
    setSelectWallet(selectedWallet);
    setSelectWalletIndex(selectedIndex);
    SetIstransactionForm(false);
  };

  const fetchBalance = async (wallet) => {
    if(wallet){
      const response = await axios.post(import.meta.env.VITE_ALCHEMY_RPC_URL,
        {
          "jsonrpc" : "2.0",
          "id": 1,
          "method": "eth_getbalance",
          "params" : [wallet.address, "latest"]
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      if(response.data){
        const hexvalue = response.data.result;
        let decimalValue = BigInt(hexvalue).toString(18);
        decimalValue /= 1e18;

        if(decimalValue != 0){
          const formattedNumber = parseFloat(decimalValue).topFixed(4);
          setWalletBalance(formattedNumber);
        }
        else{
          setWalletBalance(decimalValue);
        }
      }
    };


    useEffect(() => {
      const interval = setInterval(() => {
        if(wallet.length > 0){
          fetchBalance(selectedWallet);
        }
      }, 5000);

      return () => clearInterval(interval);
    }, [selectedWallet, wallets.length]);

    return(
      <div className="root">
      <div className="main">
        <div className="gradient" />
      </div>
      <NavBar />
      <div className='main gradiant main-container'
      >
        <div className='container'>
          <h1 className='heading'>Experiment with wallet creation and blockchain transactions in a hands-on learning environment</h1>
          <div className={`${seedPhrase ? 'hidden' : 'block'}`}>
            <button onClick={generateSeedPhrase} style={{ marginBottom: '10px' }} className='buttons'>
              Generate Seed Phrase
            </button>
          </div>

          {seedPhrase && (
            <div className='phrase-container'>
              <PhraseBox seedPhrase={seedPhrase} />
              <div className='margin-top-15'>
                <button onClick={createWalletFromSeed} className='buttons'>
                  {wallets.length ? `Add Account` : 'Create a Wallet'}
                </button>
              </div>
            </div>
          )}

          {wallets.length > 0 && (
            <WalletBox wallets={wallets} selectedWalletIndex={selectedWalletIndex} handleChange={handleChange} walletBalance={walletBalance} selectedWallet={selectedWallet} isTransactionForm={isTransactionForm} setIsTransactionForm={setIsTransactionForm} />
          )}

        </div>
      </div>
    </div>
  );
};
}
export default App;
