function HDAccount(wallet, label) {
    var accountObject = {
        wallet : wallet,
        label : label,
        archived : false,
        getAccountJsonData : function() {
            var accountJsonData = {
                label : this.getLabel(),
                archived : this.isArchived(),
                external_addresses : this.getAddressesCount(),
                change_addresses : this.getChangeAddressesCount()
            };
            return accountJsonData;
        },
        getLabel : function() {
            return this.label;
        },
        setLabel : function(label) {
            this.label = label;
        },
        isArchived : function() {
            return this.archived;
        },
        setIsArchived : function(archived) {
            this.archived = archived;
        },
        getAddresses : function() {
            return this.wallet.addresses;
        },
        getAddressesCount : function() {
            return this.wallet.addresses.length;
        },
        getChangeAddresses : function() {
            return this.wallet.changeAddresses;
        },
        getChangeAddressesCount : function() {
            return this.wallet.changeAddresses.length;
        },        
        getAccountMainKey : function() {
            return this.wallet.getExternalAccount().toBase58();
        },
        getAccountChangeKey : function() {
            return this.wallet.getInternalAccount().toBase58();
        },
        generateAddress : function() {
            return this.wallet.generateAddress();
        },
        undoGenerateAddress : function() {
            return this.wallet.addresses.pop();
        },
        generateChangeAddress : function() {
            return this.wallet.generateChangeAddress();
        },
        getUnspentOutputs : function() {
            return this.wallet.getUnspentOutputs();
        },        
        setUnspentOutputs : function(utxo) {
            return this.wallet.setUnspentOutputs(utxo);
        },                
        getBalance : function() {
            return this.wallet.getBalance();
        }
    };

    return accountObject;
}

function HDWallet(passphrase) {
    var seed = Bitcoin.crypto.sha256(passphrase);

    var walletObject = {
        passphrase : passphrase,
        seed : seed,
        accountArray : [],
        getPassphrase : function() {
            return this.passphrase;
        },
        getAccountsCount : function() {
            return this.accountArray.length;
        },
        getAccount : function(accountIdx) {
            return this.accountArray[accountIdx];
        },
        createAccount : function(label) {
            var accountIdx = this.accountArray.length;

            var walletAccount = new Bitcoin.Wallet(this.seed);
            walletAccount.accountZero = walletAccount.getMasterKey().deriveHardened(0).derive(accountIdx);
            walletAccount.externalAccount = walletAccount.getAccountZero().derive(0);
            walletAccount.internalAccount = walletAccount.getAccountZero().derive(1);

            var account = HDAccount(walletAccount, label);
            this.accountArray.push(account);

            return account;
        }
    };

    return walletObject;
}

function buildHDWallet(passphrase, accountsArrayPayload) {
    var hdwallet = HDWallet(passphrase);

    for (var i = 0; i < accountsArrayPayload.length; i++) {
        if (archived == true)
            continue;

        var accountPayload = accountsArrayPayload[i];
        var label = accountPayload.label;
        var archived = accountPayload.archived;
        var external_addresses = accountPayload.external_addresses;
        var change_addresses = accountPayload.change_addresses;
        
        console.log("label: ", label);

        var hdaccount = hdwallet.createAccount(label);
        hdaccount.setIsArchived(archived);

        for (var j = 0; j < external_addresses; j++) {
            var address = hdaccount.generateAddress();
            console.log("\taddress: ", address);
        }

        for (var k = 0; k < change_addresses; k++) {
            var changeAddress = hdaccount.generateChangeAddress();
            console.log("\tchangeAddress: ", address);
        }
    }

    return hdwallet;
}

function test() {
    var passphrase = "don't use a string seed like this in real life";
    console.log("passphrase: ", passphrase);
    var accountsArrayPayload = [
        {
            label: "Savings", 
            archived: false,
            external_addresses: 7,
            change_addresses: 12
        },
        {
            label: "archived", 
            archived: true,
            external_addresses: 3,
            change_addresses: 3
        },
        {
            label: "Splurge", 
            archived: false,
            external_addresses: 5,
            change_addresses: 2
        }
        
    ];

    var hdwallet = buildHDWallet(passphrase, accountsArrayPayload);
    hdwallet.createAccount("Rothbard");
    console.log("getAccountMainKey: ", hdwallet.getAccount(0).getAccountMainKey());
    console.log("getAccountChangeKey: ", hdwallet.getAccount(0).getAccountChangeKey());

}