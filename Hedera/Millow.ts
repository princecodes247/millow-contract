// const FileCreateTransaction = require("@hashgraph/sdk");

const {
        Client,
        PrivateKey,
        AccountCreateTransaction,
        AccountBalanceQuery,
        Hbar,
        TransferTransaction,
        FileCreateTransaction,
        ContractCallQuery,
        ContractCreateTransaction,
        ContractFunctionParameters
} = require("@hashgraph/sdk");

require("dotenv").config();
//Import the compiled contract from the HelloHedera.json file
let millow = require("../artifacts/contracts/Millow.sol/Millow.json");
const bytecode = millow.bytecode;


async function environmentSetup() {
        //Grab your Hedera testnet account ID and private key from your .env file
        const myAccountId = process.env.MY_ACCOUNT_ID;
        const myPrivateKey = process.env.MY_PRIVATE_KEY;

        console.log(myAccountId)

        // If we weren't able to grab it, we should throw a new error
        if (!myAccountId || !myPrivateKey) {
                throw new Error(
                        "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
                );
        }

        //Create your Hedera Testnet client
        const client = Client.forTestnet();

        //Set your account as the client's operator
        client.setOperator(myAccountId, myPrivateKey);

        //Set the default maximum transaction fee (in Hbar)
        client.setDefaultMaxTransactionFee(new Hbar(100));

        //Set the maximum payment for queries (in Hbar)
        client.setMaxQueryPayment(new Hbar(50));





        //Create a file on Hedera and store the hex-encoded bytecode
        const fileCreateTx = await new FileCreateTransaction()
                //Set the bytecode of the contract
                .setContents(bytecode);

        //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
        const submitTx = await fileCreateTx.execute(client);

        //Get the receipt of the file create transaction
        const fileReceipt = await submitTx.getReceipt(client);

        //Get the file ID from the receipt
        const bytecodeFileId = fileReceipt.fileId;

        //Log the file ID
        console.log("The smart contract byte code file ID is " + bytecodeFileId)



        const millow = await new ContractCreateTransaction()
                //Set the file ID of the Hedera file storing the bytecode
                .setBytecodeFileId(bytecodeFileId)
                //Set the gas to instantiate the contract
                .setGas(100000)
                //Provide the constructor parameters for the contract
                .setConstructorParameters(new ContractFunctionParameters("Millow", "MIL", ""));
}

environmentSetup();
