import React,{useState} from "react";
import {pinata} from "./config";
import {ethers} from "ethers";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [storedHash, setStoredHash]=useState("");

  const changeHandler = (event)=>{
    setSelectedFile(event.target.files[0]);
  }

  const handleSubmission= async ()=>{
    const response = await pinata.upload.file(selectedFile);
    const ipfsHash = response.IpfsHash;
    setIpfsHash(ipfsHash);
    await storeHashOnBlockchain(ipfsHash);
  }

  const storeHashOnBlockchain = async (hash) => {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        alert("MetaMask is not detected. Please install MetaMask!");
        return;
      }
  
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Create a contract instance
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
  
      // Send the transaction to store the IPFS hash on the blockchain
      const tx = await contract.setIPFSHash(hash);
      await tx.wait();
  
      console.log("IPFS hash stored on blockchain:", hash);
    } catch (error) {
      console.log("Failed to store IPFS hash on blockchain:", error);
    }
  };
  

  const retrieveHashFromBlockchain = async ()=>{
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    const storedhash = await contract.getIPFSHash();
    setStoredHash(storedHash);
  }

  const contractAddress="0xd9145CCE52D386f254917e481eB44e9943F39138";
  const contractAbi=[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_ipfshash",
				"type": "string"
			}
		],
		"name": "setIPFSHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getIPFSHash",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

  return (
    <div className="app-container">
      <div className="upload-selection">
        <label className="form-label">Choose File</label>
        <input type="file" onChange={changeHandler} className="file-input"></input>
        <button className="submit-button" onClick={handleSubmission}>Submit</button>
      </div>

      {ipfsHash && (
        <div className= "result-section">
        <p>IPFS Hash: {ipfsHash}</p>
        </div>

      )}

      <div className="retrieve-section">
        <button className="retrieve-button" onClick={retrieveHashFromBlockchain}>Retrieve Stored Hash</button>
      </div>

      {storedHash &&(
        <p>Stored IPFS Hash:{storedHash}</p>
      )}
    </div>
    
  );
}

export default App;
