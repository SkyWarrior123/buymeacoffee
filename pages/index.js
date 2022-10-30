import abi from '../utils/BuyMeACoffee.json'
import { ethers } from 'ethers'
import Head from 'next/head'
import React, { useState, useEffect, memo } from 'react' 
import styles from '../styles/Home.module.css'

export default function Home() {
  // Calling ABI & contractaddress
  const contractAddress = "0x94E9d5935eF9C265008fd3044Bd7Cd741CfAdCDe";
  const contractABI = abi.abi;

  // Component State
  const [currentAccount, setCurrentAccount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected  = async () => {
    try {
      const { ethereum } = window;
      const accounts = await ethereum.request({ method: 'eth_Accounts' });
      console.log('accounts: ' ,accounts);

      if(accounts.length > 0) {
        const account = accounts[0]
        console.log("wallet is connected: ", account);
      } else {
        console.log("Please connect your Metamask account");
      }
    } catch (error) {
      console.log("error: ", error);      
    }    
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if(!ethereum) {
        console.log("Please install Metamask wallet");
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);     
    }
  }

  // main function
  const buyCoffee = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("Buying coffee....")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "joe",
          message ? message : "Enjoy your coffee",
          { value: ethers.utils.parseEther("0.001") }
        );

        await coffeeTxn.wait();
        console.log("tx mined: ", coffeeTxn.hash);
        console.log("Coffee purchased successfully");

        // clear the form
        setName("");
        setMessage("");

      }
    } catch (error) {
      console.log(error);      
    }
  };

  const getMemos = async () => {
    try{
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("Fetching Memos from Blockchain.....");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!!");
        setMemos(memos);
      } else {
        console.log("metamask is not connected!");
      }
    } catch (error) {
      console.log(error);
    }   
  }

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    //Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    //Listen for new memo events
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy Sahbaaz A Coffee</title>
        <meta name='description' content='Tipping site' />
        <link rel='icon' href='/favicon.ico' /> 
      </Head>

      <main className={styles.main} >
        <h1 className={styles.title} >
          Buy Sahbaaz A Coffee
        </h1>

        {currentAccount ? (
          <div>
            <form>
              <div>
                <label>
                  Name
                </label>
                <br />

                <input 
                  id = "name"
                  type="text"
                  placeholder="Your Name"
                  onChange={onNameChange}
                 />
                 <div>
                  <br />
                 </div>
                 <label>
                  Send Sahbaaz a message
                 </label>
                 <br />

                 <textarea
                   rows={3}
                   placeholder="Enjoy your coffee!"
                   id='message'
                   onChange={onMessageChange}
                   required
                 >
                 </textarea>
              </div>
              <div>
                <button
                  type='button'
                  onClick={buyCoffee}
                > 
                 Send 1 Coffee for 0.001 ETH
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </main>
      {currentAccount && (<h1>Memos received</h1>)}

      {currentAccount && (memos.map((memo, idx) => {
        return (
          <div key={idx} style={{ border: "2px solid",
          "borderRadius": "5px", padding: "5px", margin: "5px" }}>
            <p style={{ "fontWeight": "bold"}}>"{memo.message}"</p>
            <p>From: {memo.name} at {memo.timestamp.toString()}</p>
          </div>
        )
      }))}

      <footer className={styles.footer}>
       <h4> Created by Sahbaaz Ansari</h4>

      </footer>
    </div>
  )
}
